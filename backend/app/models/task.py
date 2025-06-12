from pydantic import BaseModel, ConfigDict
from typing import Optional

class TaskBase(BaseModel):
    name: str
    project_id: str
    employee_email: str


# Model used when creating a new task
class TaskCreate(TaskBase):
    pass


# Model used when updating a task (optional fields)
class TaskUpdate(BaseModel):
    name: Optional[str] = None
    employee_email: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    name: str
    project_id: str
    employee_email: str

    @classmethod
    def from_orm_with_employee(cls, task_orm):
        return cls(
            id=task_orm.id,
            name=task_orm.name,
            project_id=task_orm.project_id,
            employee_email=task_orm.employee_email
        )

    model_config = ConfigDict(from_attributes=True)

class Task(TaskBase):
    id: str

    model_config = ConfigDict(from_attributes=True)