from pydantic import BaseModel
from typing import List
from uuid import uuid4

class Task(BaseModel):
    id: str
    name: str
    project_id: str
    assigned_employee_ids: List[str]

    @staticmethod
    def create(name: str, project_id: str, employees: List[str]):
        return Task(
            id=str(uuid4()),
            name=name,
            project_id=project_id,
            assigned_employee_ids=employees
        )
