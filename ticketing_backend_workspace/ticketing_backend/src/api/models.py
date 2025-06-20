from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class TicketStatus(str, enum.Enum):
    open = 'open'
    in_progress = 'in_progress'
    closed = 'closed'

class User(Base):
    """User database model."""
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

    tickets = relationship("Ticket", back_populates="owner")

    def __repr__(self):
        return f"<User id={self.id}, username={self.username}, email={self.email}>"

class Ticket(Base):
    """Ticket database model."""
    __tablename__ = 'tickets'
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String)
    status = Column(Enum(TicketStatus), default=TicketStatus.open)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey('users.id'))

    owner = relationship("User", back_populates="tickets")
