from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database
from .users import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.TicketOut, summary="Create a new ticket")
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    db_ticket = models.Ticket(
        title=ticket.title,
        description=ticket.description,
        owner_id=current_user.id,
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.get("/", response_model=list[schemas.TicketOut], summary="List all tickets for current user")
def list_tickets(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Ticket).filter(models.Ticket.owner_id == current_user.id).all()

@router.get("/{ticket_id}", response_model=schemas.TicketOut, summary="Get ticket by ID")
def get_ticket(ticket_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id, models.Ticket.owner_id == current_user.id).first()
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    return ticket

@router.put("/{ticket_id}", response_model=schemas.TicketOut, summary="Update ticket")
def update_ticket(ticket_id: int, ticket: schemas.TicketUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    db_ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id, models.Ticket.owner_id == current_user.id).first()
    if not db_ticket:
        raise HTTPException(404, "Ticket not found")
    for var, value in vars(ticket).items():
        if value is not None:
            setattr(db_ticket, var, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@router.delete("/{ticket_id}", status_code=204, summary="Delete ticket")
def delete_ticket(ticket_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    db_ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id, models.Ticket.owner_id == current_user.id).first()
    if not db_ticket:
        raise HTTPException(404, "Ticket not found")
    db.delete(db_ticket)
    db.commit()
    return None
