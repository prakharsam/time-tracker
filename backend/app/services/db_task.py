from typing import List
from app.db.models import Task, Employee, Project
from sqlalchemy.orm import Session

def create_task(db: Session, name: str, project_id: str, employee_ids: List[str]):
    project = db.query(Project).filter(Project.id == project_id).first()
    employees = db.query(Employee).filter(Employee.email.in_(employee_ids)).all()

    task = Task(name=name, project_id=project_id, assigned_employees=employees)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def get_all_tasks(db: Session):
    return db.query(Task).all()
