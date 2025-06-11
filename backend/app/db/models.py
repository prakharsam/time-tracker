from uuid import uuid4
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Integer, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

# association table for many-to-many (project ↔ employees)
project_employees = Table(
    "project_employees",
    Base.metadata,
    Column("project_id", String, ForeignKey("projects.id")),
    Column("employee_id", String, ForeignKey("employees.email"))
)
task_employee_association = Table(
    "task_employee_association",
    Base.metadata,
    Column("task_id", ForeignKey("tasks.id")),
    Column("employee_email", ForeignKey("employees.email"))
)
class Employee(Base):
    __tablename__ = "employees"

    email = Column(String, primary_key=True, index=True)
    name = Column(String)
    role = Column(String, default="employee")  # 'admin' or 'employee'
    is_active = Column(Boolean, default=False)
    activation_token = Column(String, nullable=True)

    projects = relationship("Project", secondary=project_employees, back_populates="assigned_employees")
    time_logs = relationship("TimeLog", back_populates="employee")
    screenshots = relationship("Screenshot", back_populates="employee")
    tasks = relationship(
    "Task", secondary=task_employee_association, back_populates="assigned_employees")


class Screenshot(Base):
    __tablename__ = "screenshots"

    id = Column(String, primary_key=True, index=True)
    employee_email = Column(String, ForeignKey("employees.email"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    has_permission = Column(Boolean, default=True)
    ip_address = Column(String)
    mac_address = Column(String)
    image_path = Column(String)

    employee = relationship("Employee", back_populates="screenshots")

Employee.screenshots = relationship("Screenshot", back_populates="employee")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    assigned_employees = relationship("Employee", secondary=project_employees, back_populates="projects")
    tasks = relationship("Task", back_populates="project")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    name = Column(String, nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    assigned_employees = relationship(
        "Employee",
        secondary=task_employee_association,
        back_populates="tasks"
    )

    project = relationship("Project", back_populates="tasks")

class TimeLog(Base):
    __tablename__ = "time_logs"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.email"))
    project_id = Column(String)
    task_id = Column(String)
    clock_in = Column(DateTime)
    clock_out = Column(DateTime)

    employee = relationship("Employee", back_populates="time_logs")

