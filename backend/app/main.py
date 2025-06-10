from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import invite, activate, time_tracking, me, projects, tasks

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invite.router)
app.include_router(activate.router)
app.include_router(time_tracking.router)
app.include_router(me.router)
app.include_router(projects.router)
app.include_router(tasks.router)

@app.get("/")
def root():
    return {"message": "Backend is working 🎉"}
