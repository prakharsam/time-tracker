from pydantic import BaseModel
from datetime import datetime
from uuid import uuid4
from typing import Optional

class TimeLog(BaseModel):
    id: str
    employee_id: str
    task_id: str
    clock_in: datetime
    clock_out: Optional[datetime] = None

    @staticmethod
    def create(employee_id: str, task_id: str):
        return TimeLog(
            id=str(uuid4()),
            employee_id=employee_id,
            task_id=task_id,
            clock_in=datetime.utcnow()
        )
