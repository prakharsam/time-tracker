from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Employee(Base):
    __tablename__ = "employees"

    email = Column(String, primary_key=True, index=True)
    name = Column(String)
    role = Column(String, default="employee")  # 'admin' or 'employee'
    is_active = Column(Boolean, default=False)
    activation_token = Column(String, nullable=True)


    time_logs = relationship("TimeLog", back_populates="employee")
    screenshots = relationship("Screenshot", back_populates="employee")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True)
    name = Column(String)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True)
    name = Column(String)
    project_id = Column(String, ForeignKey("projects.id"))

class TimeLog(Base):
    __tablename__ = "time_logs"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.email"))
    project_id = Column(String)
    task_id = Column(String)
    clock_in = Column(DateTime)
    clock_out = Column(DateTime)

    employee = relationship("Employee", back_populates="time_logs")

class Screenshot(Base):
    __tablename__ = "screenshots"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.email"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    image_path = Column(String)
    ip_address = Column(String)
    mac_address = Column(String)
    has_permission = Column(Boolean)

    employee = relationship("Employee", back_populates="screenshots")
