from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ScreenshotCreate(BaseModel):
    employee_email: str
    has_permission: bool
    ip_address: Optional[str]
    mac_address: Optional[str]
    image_path: str  # relative path

class ScreenshotResponse(ScreenshotCreate):
    id: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
