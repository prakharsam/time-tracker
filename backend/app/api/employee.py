from typing import List
import uuid
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.db_employee import get_employee, create_employee, deactivate_employee, update_employee, delete_employee, get_admin_by_email, create_admin
from app.models.employee import EmployeeResponse, InviteRequest, EmployeeCreate, EmployeeUpdate, AdminCreate, AdminLogin
from app.db.models import Employee
from fastapi_mail import FastMail, MessageSchema
from starlette.background import BackgroundTasks
from app.mail_config import conf
from app.services.mail import send_verification_email, send_invitation_email
import random
import string
from datetime import datetime, timedelta
from passlib.hash import bcrypt
from jose import jwt
from fastapi import status
from app.core.auth import get_current_admin

# ==========================

router = APIRouter()

verification_codes = {}

SECRET_KEY = "supersecretkey"  # In production, use env var
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))

# ==========================
# Invite Employee
# ==========================

class InviteRequest(BaseModel):
    name: str
    email: EmailStr

@router.post("/invite")
async def invite(request: InviteRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    if get_employee(db, request.email):
        raise HTTPException(status_code=400, detail="Employee already exists")

    activation_token = str(uuid.uuid4())
    create_employee(db, email=request.email, name=request.name, activation_token=activation_token)
    activation_link = f"http://localhost:5173/activate?email={request.email}&token={activation_token}"
    
    try:
        await send_invitation_email(request.email, request.name, activation_link)
        return {
            "message": "Invitation sent successfully.",
            "activation_link": activation_link
        }
    except Exception as e:
        # If email fails, delete the created employee
        emp = get_employee(db, request.email)
        if emp:
            db.delete(emp)
            db.commit()
        raise HTTPException(status_code=500, detail="Failed to send invitation email")


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
def delete_employee(email: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    emp = get_employee(db, email)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not emp.is_active:
        return {"message": f"{emp.name} is already deactivated"}

    deactivate_employee(db, email)
    return {"message": f"{email} deactivated."}

# ==========================
# Get all Employees (Admin only)
# ==========================

@router.get("/employees", response_model=List[EmployeeResponse])
def list_all_employees(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """Get all employees (including deactivated ones). Admin only."""
    return db.query(Employee).all()

# ==========================
# Get Active Employees
# ==========================

@router.get("/employees/active", response_model=List[EmployeeResponse])
def list_active_employees(db: Session = Depends(get_db)):
    """Get only active employees. Used for task assignments and other active operations."""
    return db.query(Employee).filter(Employee.is_active == True).all()

class LoginCodeRequest(BaseModel):
    email: EmailStr

@router.post("/send-login-code")
async def send_login_code(request: LoginCodeRequest, db: Session = Depends(get_db)):
    # Check if employee exists
    employee = get_employee(db, request.email)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Check if employee is deactivated
    if not employee.is_active:
        raise HTTPException(status_code=403, detail="Your account has been deactivated. Please contact your administrator.")
    
    # Generate verification code
    code = generate_verification_code()
    expiry = datetime.utcnow() + timedelta(minutes=5)
    
    # Store code with expiry
    verification_codes[request.email] = {
        "code": code,
        "expiry": expiry
    }
    
    # Send email
    try:
        await send_verification_email(request.email, code)
        return {"message": "Verification code sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send verification code")

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

@router.post("/verify-code")
def verify_code(request: VerifyCodeRequest, db: Session = Depends(get_db)):
    # Check if code exists and is valid
    stored_data = verification_codes.get(request.email)
    if not stored_data:
        raise HTTPException(status_code=400, detail="No verification code found")
    
    if datetime.utcnow() > stored_data["expiry"]:
        del verification_codes[request.email]
        raise HTTPException(status_code=400, detail="Verification code expired")
    
    if request.code != stored_data["code"]:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Code is valid, get employee data
    employee = get_employee(db, request.email)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Check if employee is deactivated
    if not employee.is_active:
        raise HTTPException(status_code=403, detail="Your account has been deactivated. Please contact your administrator.")
    
    # Remove used code
    del verification_codes[request.email]
    
    return {
        "email": employee.email,
        "name": employee.name,
        "role": employee.role
    }

@router.post("/admin/register")
def admin_register(payload: AdminCreate, db: Session = Depends(get_db)):
    if get_admin_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Admin already exists")
    admin = create_admin(db, payload.email, payload.name, payload.password)
    return {"message": "Admin registered", "admin": {"email": admin.email, "name": admin.name}}

@router.post("/admin/login")
def admin_login(payload: AdminLogin, db: Session = Depends(get_db)):
    admin = get_admin_by_email(db, payload.email)
    if not admin or not bcrypt.verify(payload.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = jwt.encode({"sub": admin.email}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer", "admin": {"email": admin.email, "name": admin.name}}

@router.post("/employee/{email}/activate")
def activate_employee(email: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    emp = get_employee(db, email)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    if emp.is_active:
        return {"message": f"{emp.name} is already active"}
    update_employee(db, email, {"is_active": True})
    return {"message": f"{emp.name} has been reactivated"}

