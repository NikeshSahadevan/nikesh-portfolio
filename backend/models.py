from sqlalchemy import Column, Integer, String, Text
from database import Base

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    tech_stack = Column(String, nullable=False)
    github_url = Column(String, nullable=True)
    live_url = Column(String, nullable=True)

class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    description = Column(String, nullable=False)
    display_order = Column(Integer, default=1, nullable=False)

class Certification(Base):
    __tablename__ = "certifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    issue_date = Column(String, nullable=False)
    credential_url = Column(String, nullable=True)
    certificate_data = Column(Text, nullable=True)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(String, nullable=False)

class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

class SiteSettings(Base):
    __tablename__ = "site_settings"
    id = Column(Integer, primary_key=True, index=True)
    status_text = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    subtitle = Column(String, nullable=False)
    bio = Column(String, nullable=False)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    bg_color = Column(String, nullable=False)
    accent_color = Column(String, nullable=False)
    accent_secondary = Column(String, nullable=False)