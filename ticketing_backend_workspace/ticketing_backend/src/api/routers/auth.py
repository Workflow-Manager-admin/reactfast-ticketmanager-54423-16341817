from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth_utils
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

# --- Code review and documentation of potential 500 error root causes ---

"""
Deep Dive Analysis of /auth/register and /auth/login:

/auth/register:
- Accepts schemas.UserCreate, expects fields: username, email, password.
- Checks for uniqueness of username/email.
- Hashes password with auth_utils.get_password_hash (passlib context).
- Creates new models.User(username, email, hashed_password).
- Adds to db session, commits, and refreshes to return.
- Returns: schemas.UserOut (id, username, email).
- Catches broad Exception, does db.rollback(), logs, re-raises as HTTP_500.

Potential 500 error sources:
1. SQLAlchemy IntegrityError (race between check & insert on username/email).
   - Root cause: db.commit() fails if uniqueness is violated mid-race (not covered by pre-check).
   - Current handling: generic Exception → 500 Internal Server Error returned, even for expected client error.
2. DB connection errors or disk full (unlikely, but surfaces as 500).
3. Model/schema mismatches: e.g., if UserCreate or UserOut out of sync w/ User model or if extra fields returned.
4. Hashing unexpected values (if user.password is None/type error, would fail in hashing).
5. Unhandled commit error (any exception except HTTPException is collapsed to 500, without specific messaging).
6. Pydantic response model serialization error, e.g., non-serializable attributes in SQLAlchemy user.

Current code swallows all errors and returns generic HTTP_500, masking e.g., username/email taken or validation problems.

/auth/login:
- POSTs an OAuth2PasswordRequestForm (fields: username, password).
- Looks up user by username.
- Fails with 401 if user not found.
- Verifies password using auth_utils.verify_password.
- If correct, issues JWT with create_access_token.
- Returns {access_token, token_type: bearer}
- Broad except Exception logs and returns generic 500 on any other error.

Potential 500 error sources:
1. DB/session errors: if db.query fails.
2. Attribute error if user has no hashed_password.
3. Passlib or bcrypt error in verify_password (bad hash, library config, etc.).
4. Token creation failure (e.g., misconfigured secret/algorithm, or bad sub payload).
5. (Lesser) OAuth2 dependency issues if form_data missing fields.

General Observations:
- All non-HTTPException errors currently collapse to HTTP_500 and reveal little to user/client.
- Not all DB errors are fatal and could be interpreted as 400 or 409 (e.g., duplicate, bad data).
- Tracebacks sometimes printed, but not included in response.
- User feedback on known errors (e.g., registration race/double user) not surfaced with appropriate code.

ROOT CAUSE LIST for Persistent 500s (to fix in next step):
1. IntegrityError not mapped to 409/400: Uniqueness check on username/email not race-safe, commit may 500.
2. Password hash/verify exceptions (misconfig, wrong type) are caught as 500, not specifically messaged.
3. JWT/token failures (wrong payload, bad secret) not mapped to informative error.
4. Pydantic serialization errors: If model returns extra/invalid fields, leads to 500.
5. Broad except Exception without granular diagnostics; no user feedback except generic “internal error.”
6. Proper DB rollback/logging on all DB errors, but not all errors are truly “internal server errors.”
7. Validation issues on inbound payload (username/email malformed) can surface as 500 if not caught by Pydantic/FastAPI auto-validation.

# No changes to endpoint logic in this step. Documented all causes for targeted fixing next.
"""

from sqlalchemy.exc import IntegrityError, OperationalError
from jose import JWTError
from passlib.exc import UnknownHashError
import logging
from .. import database as db_module, models as models_module

# PUBLIC_INTERFACE
@router.post("/register", response_model=schemas.UserOut, summary="Register new user", description="Register a new user account.")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Register a new user account.
    Returns: schemas.UserOut

    Raises:
        HTTPException 400: Validation error or taken username/email
        HTTPException 409: Uniqueness constraint (race)
        HTTPException 422: Bad password format/hash error
        HTTPException 500: Unexpected internal error
    """
    try:
        # Check for existing user by username or email
        db_user = db.query(models.User).filter(
            (models.User.username == user.username) | (models.User.email == user.email)
        ).first()
        if db_user:
            # Client error: already registered
            raise HTTPException(status_code=400, detail="Username or email already registered")
        try:
            hashed_pw = auth_utils.get_password_hash(user.password)
        except Exception as hash_err:
            # Catch password hash issues up-front
            raise HTTPException(
                status_code=422,
                detail=f"Password could not be processed: {str(hash_err)}"
            )
        new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
        db.add(new_user)
        try:
            db.commit()
            db.refresh(new_user)
        except IntegrityError as ie:
            db.rollback()
            # Uniqueness violation at commit time (race) → client error
            raise HTTPException(
                status_code=409,
                detail="Username or email already registered (conflict)"
            )
        except OperationalError as dberr:
            db.rollback()
            # Likely cause is missing tables: try to auto-create and inform the admin
            logging.error(f"OperationalError during registration, attempting to re-create schema: {dberr}")
            try:
                models_module.Base.metadata.create_all(bind=db_module.engine)
                # Optionally, try to commit again if it was due to missing tables
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                logging.info("Table(s) were missing and have been created. Registration succeeded after auto-create.")
            except Exception as re_err:
                logging.error(f"Could not recover from OperationalError: {re_err}")
                raise HTTPException(status_code=500, detail="Could not register user: DB schema was missing and could not be auto-recreated.")
        except Exception as dberr:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error during registration: {type(dberr).__name__}")
        # Return serializable user
        return schemas.UserOut.model_validate(new_user)
    except HTTPException:
        # Let explicitly raised client/data exceptions percolate
        raise
    except Exception as fatal:
        db.rollback()
        # Final catch-all - should be rare, e.g., unhandled serialization
        raise HTTPException(status_code=500, detail=f"Could not register user: {type(fatal).__name__}")

# PUBLIC_INTERFACE
@router.post("/login", summary="Authenticate user")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    """
    Authenticate user and return JWT token.

    Raises:
        HTTPException 401: Bad credentials
        HTTPException 422: Hash/token/technical credential issues
        HTTPException 500: True internal errors
    """
    try:
        user = db.query(models.User).filter(models.User.username == form_data.username).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        try:
            if not auth_utils.verify_password(form_data.password, user.hashed_password):
                raise HTTPException(status_code=401, detail="Invalid credentials")
        except UnknownHashError as hash_err:
            # Hashing library can't interpret the hash
            raise HTTPException(status_code=422, detail=f"Stored password hash error: {str(hash_err)}")
        except Exception as hash_exc:
            raise HTTPException(status_code=422, detail=f"Password check error: {str(hash_exc)}")
        try:
            token = auth_utils.create_access_token({"sub": user.username})
        except (JWTError, ValueError) as jwt_exc:
            raise HTTPException(status_code=422, detail=f"Token creation error: {str(jwt_exc)}")
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as fatal:
        raise HTTPException(status_code=500, detail=f"Could not login: {type(fatal).__name__}")

