from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.db_timelog import clock_in, clock_out, get_logs_for_employee
from app.models.timelog import TimeLogCreate, TimeLogOut

router = APIRouter()

@router.post("/clock-in", response_model=TimeLogOut)
def clock_in_api(payload: TimeLogCreate, db: Session = Depends(get_db)):
    try:
        return clock_in(db, payload.employee_email, payload.task_id, payload.project_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/clock-out", response_model=TimeLogOut)
def clock_out_api(payload: TimeLogCreate, db: Session = Depends(get_db)):
    log = clock_out(db, payload.employee_email, payload.task_id,payload.project_id)
    if not log:
        raise HTTPException(status_code=404, detail="No active session found")
    return log

@router.get("/time-logs/{email}", response_model=list[TimeLogOut])
def get_logs(email: str, db: Session = Depends(get_db)):
    return get_logs_for_employee(db, email)
