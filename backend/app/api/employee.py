import uuid
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.db_employee import get_employee, create_employee, deactivate_employee
from app.models.employee import Employee, InviteRequest
# ==========================

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================
# Invite Employee
# ==========================

class InviteRequest(BaseModel):
    name: str
    email: EmailStr

@router.post("/invite")
def invite(request: InviteRequest, db: Session = Depends(get_db)):
    if get_employee(db, request.email):
        raise HTTPException(status_code=400, detail="Employee already exists")

    activation_token = str(uuid.uuid4())
    create_employee(db, email=request.email, name=request.name, activation_token=activation_token)

    return {
        "message": "Invitation sent.",
        "activation_link": f"http://localhost:8000/activate?email={request.email}&token={activation_token}"
    }


# ==========================
# Activate Employee
# ==========================

@router.get("/activate")
def activate(email: str, token: str, db: Session = Depends(get_db)):
    emp = get_employee(db, email)

    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    if emp.is_active:
        return {"message": "Already activated"}

    if emp.activation_token != token:
        raise HTTPException(status_code=400, detail="Invalid activation token")

    emp.is_active = True
    emp.activation_token = None
    db.commit()

    return {"message": f"{emp.name} is now activated 🎉"}

# ==========================
# Get Employee Info (/me)
# ==========================

@router.get("/me")
def get_me(email: str, db: Session = Depends(get_db)):
    emp = get_employee(db, email)
    if not emp or not emp.is_active:
        raise HTTPException(status_code=404, detail="Invalid or deactivated user")
    return emp


# ==========================
# Deactivate Employee
# ==========================

@router.delete("/employee/{email}")
def delete_employee(email: str, db: Session = Depends(get_db)):
    emp = get_employee(db, email)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not emp.is_active:
        return {"message": f"{emp.name} is already deactivated"}

    deactivate_employee(db, email)
    return {"message": f"{email} deactivated."}

