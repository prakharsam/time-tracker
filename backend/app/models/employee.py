from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import uuid4

class InviteRequest(BaseModel):
    email: str
    name: str

class Employee(BaseModel):
    id: str
    name: str
    email: EmailStr
    is_active: bool = False
    activation_token: Optional[str] = None
    role: str = "employee"  # Later use for role-based access

    @staticmethod
    def create(name: str, email: str):
        return Employee(
            id=str(uuid4()),
            name=name,
            email=email,
            is_active=False,
            activation_token=str(uuid4()),
            role="employee"
        )

class EmployeeResponse(BaseModel):
    name: str
    email: str
    is_active: bool
    role: str

    model_config = ConfigDict(from_attributes=True)