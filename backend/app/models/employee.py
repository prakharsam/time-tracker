from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import uuid4

class Employee(BaseModel):
    id: str
    name: str
    email: EmailStr
    is_active: bool = False
    activation_token: Optional[str] = None

    @staticmethod
    def create(name: str, email: str):
        return Employee(
            id=str(uuid4()),
            name=name,
            email=email,
            is_active=False,
            activation_token=str(uuid4()),
        )