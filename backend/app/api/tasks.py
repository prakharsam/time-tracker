from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Task
from app.models.task import TaskCreate, TaskResponse
from app.services.db_task import create_task, get_all_tasks

router = APIRouter()

@router.post("/tasks", response_model=TaskResponse)
def create_task_api(payload: TaskCreate, db: Session = Depends(get_db)):
    task = create_task(db, payload.name, payload.project_id, payload.assigned_employee_ids)
    return TaskResponse.from_orm_with_employees(task)

@router.get("/tasks", response_model=List[TaskResponse])
def list_tasks_api(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return [TaskResponse.from_orm_with_employees(t) for t in tasks]
