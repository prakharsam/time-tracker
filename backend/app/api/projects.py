from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.project import ProjectCreate, ProjectUpdate, Project
from app.services.db_project import create_project, get_all_projects, delete_project, update_project
from app.db.session import get_db

router = APIRouter()

@router.post("/projects")
def add_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    return create_project(
        db,
        name=payload.name,
        description=payload.description,
        assigned_employee_ids=payload.assigned_employee_ids
    )

@router.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    return get_all_projects(db)

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