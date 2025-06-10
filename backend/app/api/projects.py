from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.models.project import Project
from app.services.storage import PROJECTS

router = APIRouter()

class ProjectRequest(BaseModel):
    name: str
    description: str
    assigned_employee_ids: List[str]

class ProjectUpdateRequest(BaseModel):
    assigned_employee_ids: Optional[List[str]]

@router.post("/projects")
def create_project(req: ProjectRequest):
    project = Project.create(req.name, req.description, req.assigned_employee_ids)
    PROJECTS[project.id] = project
    return {"message": "Project created", "project_id": project.id}

@router.get("/projects")
def list_projects():
    return list(PROJECTS.values())

@router.patch("/projects/{project_id}")
def update_project(project_id: str, req: ProjectUpdateRequest):
    project = PROJECTS.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if req.assigned_employee_ids is not None:
        project.assigned_employee_ids = req.assigned_employee_ids
        
    return {"message": "Project updated", "project": project}

@router.delete("/projects/{project_id}")
def delete_project(project_id: str):
    if project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")
    del PROJECTS[project_id]
    return {"message": "Project deleted"}