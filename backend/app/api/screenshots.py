from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Screenshot
from app.services.db_screenshot import create_screenshot
from app.models.screenshot import ScreenshotResponse, ScreenshotCreate
import os
from uuid import uuid4

router = APIRouter()

@router.post("/screenshots", response_model=ScreenshotResponse)
async def upload_screenshot(
    employee_id: str = Form(...),
    has_permission: bool = Form(...),
    ip_address: str = Form(None),
    mac_address: str = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_ext = os.path.splitext(image.filename)[1]
    filename = f"{uuid4()}{file_ext}"
    save_path = f"screenshots/{filename}"

    os.makedirs("screenshots", exist_ok=True)
    with open(save_path, "wb") as f:
        f.write(await image.read())

    data = ScreenshotCreate(
        employee_email=employee_id,
        has_permission=has_permission,
        ip_address=ip_address,
        mac_address=mac_address,
        image_path=save_path
    )

    return create_screenshot(db, data)

@router.get("/screenshots/{email}", response_model=List[ScreenshotResponse])
def list_screenshots(email: str, db: Session = Depends(get_db)):
    return db.query(Screenshot).filter_by(employee_email=email).all()
