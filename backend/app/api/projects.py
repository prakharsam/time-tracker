from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.models.project import Project
from app.services.storage import PROJECTS

router = APIRouter()

class ProjectRequest(BaseModel):
    name: str
    description: str
    assigned_employee_ids: List[str]

@router.post("/projects")
def create_project(req: ProjectRequest):
    project = Project.create(req.name, req.description, req.assigned_employee_ids)
    PROJECTS[project.id] = project
    return {"message": "Project created", "project_id": project.id}

@router.get("/projects")
def list_projects():
    return list(PROJECTS.values())
