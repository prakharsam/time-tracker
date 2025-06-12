from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.project import ProjectCreate, ProjectUpdate, Project, ProjectResponse, ProjectEmployee
from app.services.db_project import create_project, get_all_projects, delete_project, update_project
from app.db.session import get_db
from typing import List
from app.core.auth import get_current_admin

router = APIRouter()

@router.post("/projects")
def add_project(payload: ProjectCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return create_project(
        db,
        name=payload.name,
        description=payload.description,
        assigned_employee_ids=payload.assigned_employee_ids
    )

@router.get("/projects", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    projects = get_all_projects(db)
    def serialize_project(p):
        return ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            assigned_employees=[
                ProjectEmployee(name=e.name, email=e.email)
                for e in p.assigned_employees
            ]
        )
    return [serialize_project(p) for p in projects]

@router.get("/projects/employee/{employee_id}")
def list_employee_projects(employee_id: str, db: Session = Depends(get_db)):
    projects = get_all_projects(db)
    return [p for p in projects if any(e.email == employee_id for e in p.assigned_employees)]

@router.delete("/projects/{project_id}")
def remove_project(project_id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    success = delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Deleted"}

@router.put("/projects/{project_id}")
def update_existing_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    updated = update_project(db, project_id, payload.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated