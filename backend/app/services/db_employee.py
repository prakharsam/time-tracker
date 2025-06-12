from sqlalchemy.orm import Session
from app.db.models import Employee, Admin
from passlib.hash import bcrypt

def get_employee(db: Session, email: str):
    return db.query(Employee).filter(Employee.email == email).first()

def create_employee(db: Session, email: str, name: str, activation_token: str):
    employee = Employee(
        email=email,
        name=name,
        is_active=False,
        activation_token=activation_token  # ✅ store token
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee

def deactivate_employee(db: Session, email: str):
    emp = get_employee(db, email)
    if emp:
        emp.is_active = False
        db.commit()
    return emp

def update_employee(db: Session, email: str, update_data: dict):
    emp = get_employee(db, email)
    if not emp:
        return None

    if "name" in update_data:
        emp.name = update_data["name"]
    
    if "role" in update_data:
        emp.role = update_data["role"]
    
    if "is_active" in update_data:
        emp.is_active = update_data["is_active"]
    
    if "activation_token" in update_data:
        emp.activation_token = update_data["activation_token"]

    db.commit()
    db.refresh(emp)
    return emp

def delete_employee(db: Session, email: str):
    emp = get_employee(db, email)
    if not emp:
        return False
    
    db.delete(emp)
    db.commit()
    return True

def get_admin_by_email(db: Session, email: str):
    return db.query(Admin).filter(Admin.email == email).first()

def create_admin(db: Session, email: str, name: str, password: str):
    password_hash = bcrypt.hash(password)
    admin = Admin(
        email=email,
        name=name,
        password_hash=password_hash
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin
