from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.models.task import Task
from app.services.storage import TASKS, PROJECTS

router = APIRouter()

class TaskRequest(BaseModel):
    name: str
    project_id: str
    assigned_employee_ids: List[str]

@router.post("/tasks")
def create_task(req: TaskRequest):
    if req.project_id not in PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")

    task = Task.create(req.name, req.project_id, req.assigned_employee_ids)
    TASKS[task.id] = task
    return {"message": "Task created", "task_id": task.id}

@router.get("/tasks")
def list_tasks():
    return list(TASKS.values())
