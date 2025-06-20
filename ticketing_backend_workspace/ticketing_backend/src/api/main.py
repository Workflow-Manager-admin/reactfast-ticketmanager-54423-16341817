from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, tickets, auth

app = FastAPI(
    title="Ticketing System API",
    description="A FastAPI backend for a ticketing system with secure user and ticket management.",
    version="1.0.0",
    openapi_tags=[
        {"name": "Auth", "description": "Authentication routes"},
        {"name": "Users", "description": "User management routes"},
        {"name": "Tickets", "description": "Ticket CRUD operations"},
    ],
    servers=[
        {"url": "https://vscode-internal-7052-dev.dev01.cloud.kavia.ai:3001", "description": "Production API base"},
    ],
)

# Set the base API URL for CORS policy
API_BASE_URL = "https://vscode-internal-7052-dev.dev01.cloud.kavia.ai:3001"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[API_BASE_URL],
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
