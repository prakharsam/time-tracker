from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Task
from app.models.task import TaskCreate, TaskResponse
from app.services.db_task import create_task, update_task, delete_task
from app.core.auth import get_current_admin

router = APIRouter()

@router.post("/tasks", response_model=TaskResponse)
def create_task_api(payload: TaskCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    try:
        task = create_task(db, payload.name, payload.project_id, payload.employee_email)
        return TaskResponse.from_orm_with_employee(task)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/tasks", response_model=List[TaskResponse])
def list_tasks_api(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return [TaskResponse.from_orm_with_employee(t) for t in tasks]

@router.get("/tasks/employee/{employee_id}", response_model=List[TaskResponse])
def list_employee_tasks(employee_id: str, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.employee_email == employee_id).all()
    return [TaskResponse.from_orm_with_employee(t) for t in tasks]

@router.get("/tasks/employee/{employee_id}/project/{project_id}", response_model=List[TaskResponse])
def list_employee_project_tasks(employee_id: str, project_id: str, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.project_id == project_id, Task.employee_email == employee_id).all()
    return [TaskResponse.from_orm_with_employee(t) for t in tasks]

@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task_api(task_id: str, payload: TaskCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    try:
        task = update_task(db, task_id, payload.dict(exclude_unset=True))
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return TaskResponse.from_orm_with_employee(task)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/tasks/{task_id}")
def delete_task_api(task_id: str, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    success = delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Deleted"}
