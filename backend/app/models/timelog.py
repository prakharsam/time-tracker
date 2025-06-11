from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TimeLogCreate(BaseModel):
    employee_email: str
    task_id: str
    project_id: str

class TimeLogOut(BaseModel):
    id: str
    employee_email: str
    task_id: str
    project_id: str
    clock_in: datetime
    clock_out: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
