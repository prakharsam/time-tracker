from typing import List
from app.db.models import Task, Employee, Project
from sqlalchemy.orm import Session

def create_task(db: Session, name: str, project_id: str, employee_email: str):
    project = db.query(Project).filter(Project.id == project_id).first()
    employee = db.query(Employee).filter(Employee.email == employee_email).first()
    
    if not employee:
        raise ValueError("Employee not found")
    
    if not employee.is_active:
        raise ValueError("Cannot assign task to deactivated employee")
    
    task = Task(name=name, project_id=project_id, employee_email=employee_email)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def get_all_tasks(db: Session):
    return db.query(Task).all()

def update_task(db: Session, task_id: str, update_data: dict):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return None
        
    if "employee_email" in update_data:
        employee = db.query(Employee).filter(Employee.email == update_data["employee_email"]).first()
        if not employee:
            raise ValueError("Employee not found")
        if not employee.is_active:
            raise ValueError("Cannot assign task to deactivated employee")
        task.employee_email = update_data["employee_email"]
        
    if "name" in update_data:
        task.name = update_data["name"]
    if "project_id" in update_data:
        task.project_id = update_data["project_id"]
        
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: str):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True
