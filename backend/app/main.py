from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import employee, time_tracking, projects, tasks, screenshots

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(time_tracking.router)
app.include_router(employee.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(screenshots.router)


@app.get("/")
def root():
    return {"message": "Backend is working 🎉"}
