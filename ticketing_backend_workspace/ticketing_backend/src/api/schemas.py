from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional

# PUBLIC_INTERFACE
class UserCreate(BaseModel):
    username: str = Field(..., description="Unique user identifier")
    email: EmailStr
    password: str

# PUBLIC_INTERFACE
class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True
        orm_mode = True

# PUBLIC_INTERFACE
class LoginInput(BaseModel):
    username: str
    password: str

# PUBLIC_INTERFACE
class TicketCreate(BaseModel):
    title: str
    description: Optional[str]

# PUBLIC_INTERFACE
class TicketOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    owner_id: int

    class Config:
        orm_mode = True

# PUBLIC_INTERFACE
class TicketUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[str]
