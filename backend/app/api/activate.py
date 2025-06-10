from fastapi import APIRouter, HTTPException, Query
from app.services.storage import EMPLOYEES

router = APIRouter()

@router.get("/activate")
def activate_employee(token: str = Query(...)):
    for emp in EMPLOYEES.values():
        if emp.activation_token == token:
            emp.is_active = True
            return {"message": f"{emp.name} activated!"}
    raise HTTPException(status_code=404, detail="Invalid token")
