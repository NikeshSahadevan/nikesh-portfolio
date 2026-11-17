from typing import Optional
from pydantic import BaseModel


# --- Project Schemas ---
class ProjectCreate(BaseModel):
  title: str
  description: str
  tech_stack: str
  github_url: Optional[str] = None
  live_url: Optional[str] = None


class ProjectResponse(ProjectCreate):
  id: int

  class Config:
    from_attributes = True


# --- Experience Schemas ---
class ExperienceCreate(BaseModel):
  role: str
  company: str
  location: Optional[str] = None
  duration: str
  description: str


class ExperienceResponse(ExperienceCreate):
  id: int

  class Config:
    from_attributes = True


# --- Message Schemas ---
class MessageCreate(BaseModel):
  name: str
  email: str
  message: str


class MessageResponse(MessageCreate):
  id: int

  class Config:
    from_attributes = True

class CertificationCreate(BaseModel):
  title: str
  issuer: str
  issue_date: Optional[str] = None
  credential_url: Optional[str] = None


class CertificationResponse(CertificationCreate):
  id: int

  class Config:
    from_attributes = True
  
