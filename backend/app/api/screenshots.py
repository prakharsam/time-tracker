import os
from fastapi import APIRouter, UploadFile, Form, HTTPException, Query
from fastapi.responses import FileResponse
from app.services.storage import SCREENSHOTS
from app.models.screenshot import ScreenshotMeta

router = APIRouter()

UPLOAD_DIR = "app/static/screenshots"

@router.post("/screenshot")
async def upload_screenshot(
    employee_id: str = Form(...),
    has_permission: bool = Form(...),
    ip_address: str = Form(...),
    mac_address: str = Form(...),
    image: UploadFile = Form(...)
):
    if image.content_type not in ["image/png", "image/jpeg"]:
        raise HTTPException(status_code=400, detail="Invalid image type")

    filename = f"{employee_id}_{image.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(await image.read())

    meta = ScreenshotMeta.create(
        employee_id=employee_id,
        filename=filepath,
        has_permission=has_permission,
        ip=ip_address,
        mac=mac_address
    )

    SCREENSHOTS.append(meta)
    return {"message": "Screenshot uploaded", "path": filepath}

@router.get("/screenshots")
def get_screenshots(employee_id: str = Query(...)):
    filtered = [s for s in SCREENSHOTS if s.employee_id == employee_id]
    return filtered