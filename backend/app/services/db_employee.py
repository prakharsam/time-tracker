from sqlalchemy.orm import Session
from app.db.models import Employee

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
