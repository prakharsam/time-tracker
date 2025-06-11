from app.db.models import Screenshot
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime
from app.models.screenshot import ScreenshotCreate

def create_screenshot(db: Session, data: ScreenshotCreate) -> Screenshot:
    screenshot = Screenshot(
        id=str(uuid4()),
        employee_email=data.employee_email,
        has_permission=data.has_permission,
        ip_address=data.ip_address,
        mac_address=data.mac_address,
        image_path=data.image_path,
        timestamp=datetime.utcnow()
    )
    db.add(screenshot)
    db.commit()
    db.refresh(screenshot)
    return screenshot
