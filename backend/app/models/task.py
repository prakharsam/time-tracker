from pydantic import BaseModel, ConfigDict
from typing import List

class TaskBase(BaseModel):
    name: str
    project_id: str
    assigned_employee_ids: List[str]


# Model used when creating a new task
class TaskCreate(TaskBase):
    pass


# Model used when updating a task (optional fields)
class TaskUpdate(BaseModel):
    name: str | None = None
    assigned_employee_ids: List[str] | None = None


class TaskResponse(BaseModel):
    id: str
    name: str
    project_id: str
    assigned_employee_ids: List[str]

    @classmethod
    def from_orm_with_employees(cls, task_orm):
        return cls(
            id=task_orm.id,
            name=task_orm.name,
            project_id=task_orm.project_id,
            assigned_employee_ids=[e.email for e in task_orm.assigned_employees]
        )

    model_config = ConfigDict(from_attributes=True)

class Task(TaskBase):
    id: str

    model_config = ConfigDict(from_attributes=True)