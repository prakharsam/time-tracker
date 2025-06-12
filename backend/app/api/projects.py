from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.project import ProjectCreate, ProjectUpdate, Project, ProjectResponse
from app.services.db_project import create_project, get_all_projects, delete_project, update_project
from app.db.session import get_db
from app.services.db_employee import get_employee
from app.db.models import Employee, Task

# from app.models.employee import Employee
# from app.models.task import Task

router = APIRouter()

@router.post("/projects")
def add_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    return create_project(
        db,
        name=payload.name,
        description=payload.description,
        assigned_employee_ids=payload.assigned_employee_ids
    )

@router.get("/projects", response_model=List[ProjectResponse])
def list_projects(email: str = Query(...), db: Session = Depends(get_db)):
    employee = get_employee(db, email)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Return only projects where the employee has tasks
    projects = db.query(Project).join(Project.tasks).join(Task.assigned_employees).filter(Employee.email == email).distinct()
    return projects

@router.delete("/projects/{project_id}")
def remove_project(project_id: str, db: Session = Depends(get_db)):
    success = delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Deleted"}

@router.put("/projects/{project_id}")
def update_existing_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db)
):
    updated = update_project(db, project_id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated