from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.employee import Employee
from app.services.storage import EMPLOYEES

router = APIRouter()


# ==========================
# Invite Employee
# ==========================

class InviteRequest(BaseModel):
    name: str
    email: EmailStr

@router.post("/invite")
def invite_employee(req: InviteRequest):
    if req.email in EMPLOYEES:
        raise HTTPException(status_code=400, detail="Employee already invited")

    emp = Employee.create(req.name, req.email)
    EMPLOYEES[req.email] = emp

    print(f"📩 Activation link: http://localhost:8000/activate?token={emp.activation_token}")

    return {"message": "Employee invited successfully"}


# ==========================
# Activate Employee
# ==========================

@router.get("/activate")
def activate_employee(token: str = Query(...)):
    for emp in EMPLOYEES.values():
        if emp.activation_token == token:
            emp.is_active = True
            return {"message": f"{emp.name} activated!"}
    raise HTTPException(status_code=404, detail="Invalid token")


# ==========================
# Get Employee Info (/me)
# ==========================

@router.get("/me")
def get_employee(email: str = Query(...)):
    emp = EMPLOYEES.get(email)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


# ==========================
# Deactivate Employee
# ==========================

@router.delete("/employees/{email}")
def deactivate_employee(email: str):
    emp = EMPLOYEES.get(email)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if not emp.is_active:
        return {"message": f"{emp.name} is already deactivated"}
    
    emp.is_active = False
    return {"message": f"{emp.name} deactivated"}
