from app.db.models import TimeLog
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime, timezone

def clock_in(db: Session, employee_email: str, task_id: str, project_id: str):
    # Check if already clocked in for the same task
    existing_log = db.query(TimeLog).filter(
        TimeLog.employee_email == employee_email,
        TimeLog.task_id == task_id,
        TimeLog.clock_out == None
    ).first()

    if existing_log:
        raise Exception(f"User already clocked in for the task. Please clock out first.")

    # Otherwise, proceed with new clock-in
    log = TimeLog(
        id=str(uuid4()),
        employee_email=employee_email,
        task_id=task_id,
        project_id=project_id,
        clock_in=datetime.now(timezone.utc)
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def clock_out(db: Session, employee_email: str, task_id: str, project_id: str):
    active_log = (
        db.query(TimeLog)
        .filter(TimeLog.employee_email == employee_email, 
                TimeLog.task_id == task_id,
                TimeLog.clock_out == None)
        .order_by(TimeLog.clock_in.desc()).first()
    )
    if not active_log:
        raise ValueError("No active session found for this user")

    # Mark it clocked out
    active_log.clock_out = datetime.now(timezone.utc)
    db.commit()
    db.refresh(active_log)
    return active_log

def get_logs_for_employee(db: Session, employee_email: str):
    return db.query(TimeLog).filter_by(employee_email=employee_email).all()
