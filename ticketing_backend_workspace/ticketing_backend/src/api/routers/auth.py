from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth_utils
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

# Note: Instrument endpoints to print extra debug info for error root cause analysis

# PUBLIC_INTERFACE
@router.post("/register", response_model=schemas.UserOut, summary="Register new user", description="Register a new user account.")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Register a new user account.
    Returns: schemas.UserOut
    Raises: HTTPException on validation/database errors.
    """
    try:
        # Check for existing user by username or email
        db_user = db.query(models.User).filter(
            (models.User.username == user.username) | (models.User.email == user.email)
        ).first()
        if db_user:
            print(f"DEBUG register: Username or email taken ({user.username}, {user.email})")
            raise HTTPException(status_code=400, detail="Username or email already registered")
        hashed_pw = auth_utils.get_password_hash(user.password)
        print(f"DEBUG register: Creating user {user.username} with hash {hashed_pw[:10]}...")
        new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"DEBUG register: Successfully created user {new_user.id}")
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Registration DB Error [{type(e)}]: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Could not register user due to internal error.")

# PUBLIC_INTERFACE
@router.post("/login", summary="Authenticate user")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.User).filter(models.User.username == form_data.username).first()
        if not user:
            print(f"DEBUG login: No such user '{form_data.username}'")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not auth_utils.verify_password(form_data.password, user.hashed_password):
            print(f"DEBUG login: Invalid password for '{form_data.username}'")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = auth_utils.create_access_token({"sub": user.username})
        print(f"DEBUG login: Token generated for {user.username}: {token[:10]}...")
        return {"access_token": token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login Error [{type(e)}]: {e}")
        raise HTTPException(status_code=500, detail="Could not login due to internal error.")

