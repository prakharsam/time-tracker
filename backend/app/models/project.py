from pydantic import BaseModel
from typing import List,Optional
from uuid import uuid4

class Project(BaseModel):
    id: str
    name: str
    description: str
    assigned_employee_ids: List[str]

    @staticmethod
    def create(name: str, description: str, employees: List[str]):
        return Project(
            id=str(uuid4()),
            name=name,
            description=description,
            assigned_employee_ids=employees
        )

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    assigned_employee_ids: List[str] = []

    class Config:
        orm_mode = True

class ProjectUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    assigned_employee_ids: Optional[List[str]]     