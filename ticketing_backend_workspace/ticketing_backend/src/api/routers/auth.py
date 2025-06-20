from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from .. import models, schemas, database, auth_utils
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

# PUBLIC_INTERFACE
@router.post("/register", response_model=schemas.UserOut, summary="Register new user", description="Register a new user account.")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Register a new user account.

    Args:
        user (schemas.UserCreate): The registration data including username, email, password.
        db (Session): SQLAlchemy DB session, injected dependency.

    Returns:
        schemas.UserOut: The newly created user data (no password field).

    Raises:
        HTTPException: 400 if username or email is already registered, 
                       422 for validation errors,
                       500 for internal DB errors (with handled message).
    """
    try:
        db_user = db.query(models.User).filter(
            (models.User.username == user.username) | (models.User.email == user.email)
        ).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username or email already registered")
        hashed_pw = auth_utils.get_password_hash(user.password)
        new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except HTTPException:
        # Propagate handled validation errors
        raise
    except Exception as e:
        db.rollback()
        # Log the real error here in production (print for dev purposes)
        print(f"Registration DB Error: {e}")
        raise HTTPException(status_code=500, detail="Could not register user due to internal error.")

@router.post("/login", summary="Authenticate user")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth_utils.create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}
