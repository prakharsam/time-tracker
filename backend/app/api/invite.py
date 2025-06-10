from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.models.employee import Employee
from app.services.storage import EMPLOYEES

router = APIRouter()

class InviteRequest(BaseModel):
    name: str
    email: EmailStr

@router.post("/invite")
def invite_employee(req: InviteRequest):
    if req.email in EMPLOYEES:
        raise HTTPException(status_code=400, detail="Employee already invited")

    emp = Employee.create(req.name, req.email)
    EMPLOYEES[req.email] = emp

    # Simulate email send
    print(f"📩 Activation link: http://localhost:8000/activate?token={emp.activation_token}")

    return {"message": "Employee invited successfully"}