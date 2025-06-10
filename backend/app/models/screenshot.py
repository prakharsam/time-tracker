from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import uuid4

class ScreenshotMeta(BaseModel):
    id: str
    employee_id: str
    timestamp: datetime
    image_path: str
    has_permission: bool
    ip_address: str
    mac_address: str

    @staticmethod
    def create(employee_id: str, filename: str, has_permission: bool, ip: str, mac: str):
        return ScreenshotMeta(
            id=str(uuid4()),
            employee_id=employee_id,
            timestamp=datetime.utcnow(),
            image_path=filename,
            has_permission=has_permission,
            ip_address=ip,
            mac_address=mac,
        )
