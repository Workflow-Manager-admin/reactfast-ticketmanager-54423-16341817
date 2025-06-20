from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, tickets, auth
from . import database, models

app = FastAPI(
    title="Ticketing System API",
    description="A FastAPI backend for a ticketing system with secure user and ticket management.",
    version="1.0.0",
    openapi_tags=[
        {"name": "Auth", "description": "Authentication routes"},
        {"name": "Users", "description": "User management routes"},
        {"name": "Tickets", "description": "Ticket CRUD operations"},
    ]
)


# Ensure database schema is created on startup
@app.on_event("startup")
def on_startup():
    """
    Create database tables on startup if they do not exist.
    This prevents SQLAlchemy OperationalError due to missing tables.
    """
    models.Base.metadata.create_all(bind=database.engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"message": "Healthy"}

# Register routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(tickets.router, prefix="/tickets", tags=["Tickets"])
