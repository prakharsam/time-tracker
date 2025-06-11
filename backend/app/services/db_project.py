from sqlalchemy.orm import Session
from app.db.models import Project, Employee, Task

def create_project(db: Session, name: str, description: str, assigned_employee_ids: list):
    employees = db.query(Employee).filter(Employee.email.in_(assigned_employee_ids)).all()
    project = Project(
        name=name,
        description=description,
        assigned_employees=employees
    )
    # ✅ Automatically add a default task
    default_task = Task(
        name=f"Default Task for {name}",
        project_id=project.id,
        assigned_employees=employees
    )
    db.add(default_task)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def get_all_projects(db: Session):
    return db.query(Project).all()

def delete_project(db: Session, project_id: str):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if proj:
        db.delete(proj)
        db.commit()
        return True
    return False

def update_project(db: Session, project_id: str, update_data: dict):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None

    if "name" in update_data:
        project.name = update_data["name"]

    if "description" in update_data:
        project.description = update_data["description"]

    if "assigned_employee_ids" in update_data:
        employee_ids = update_data["assigned_employee_ids"]
        employees = db.query(Employee).filter(Employee.email.in_(employee_ids)).all()
        project.assigned_employees = employees

    db.commit()
    db.refresh(project)
    return project
