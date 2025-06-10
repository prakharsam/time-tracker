from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.models.timelog import TimeLog
from app.services.storage import TIME_LOGS

router = APIRouter()

class TimeTrackRequest(BaseModel):
    employee_id: str
    task_id: str

@router.post("/clock-in")
def clock_in(req: TimeTrackRequest):
    # Check if already clocked in
    for log in TIME_LOGS:
        if log.employee_id == req.employee_id and log.clock_out is None:
            raise HTTPException(status_code=400, detail="Already clocked in.")

    log = TimeLog.create(req.employee_id, req.task_id)
    TIME_LOGS.append(log)
    return {"message": "Clock-in successful", "log_id": log.id, "clock_in": log.clock_in}


class ClockOutRequest(BaseModel):
    employee_id: str

@router.post("/clock-out")
def clock_out(req: ClockOutRequest):
    for log in reversed(TIME_LOGS):
        if log.employee_id == req.employee_id and log.clock_out is None:
            log.clock_out = datetime.utcnow()
            return {"message": "Clock-out successful", "log_id": log.id, "clock_out": log.clock_out}
    raise HTTPException(status_code=400, detail="No active session to clock out from.")

@router.get("/time-logs")
def get_time_logs(employee_id: str):
    logs = [log for log in TIME_LOGS if log.employee_id == employee_id]
    return logs