from fastapi import APIRouter, HTTPException, Query
from app.services.storage import EMPLOYEES

router = APIRouter()

@router.get("/me")
def get_employee(email: str = Query(...)):
    emp = EMPLOYEES.get(email)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp
