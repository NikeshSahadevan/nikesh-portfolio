import os
import shutil
import base64
import hashlib
import secrets
from fastapi import FastAPI, Depends, HTTPException, Header, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
import models
from database import SessionLocal, engine

try:
    import fitz
except ImportError:
    fitz = None

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nikesh Portfolio API")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_ROOT = os.path.join(BASE_DIR, "uploads")
RESUME_UPLOAD_DIR = os.path.join(UPLOADS_ROOT, "resume")
os.makedirs(RESUME_UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_ROOT), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ACTIVE_TOKENS = set()

DEFAULT_SETTINGS = {
    "status_text": "Open to ERP & Full-Stack Opportunities",
    "first_name": "Nikesh",
    "last_name": "Sahadevan",
    "subtitle": "Odoo ERP Specialist • Full-Stack Python & React Developer",
    "bio": "Building scalable enterprise workflows, custom ERP integrations, and modern database-driven web applications with FastAPI, PostgreSQL, and React.",
    "github_url": "https://github.com/NikeshSahadevan",
    "linkedin_url": "",
    "whatsapp_number": "919633361830",
    "resume_url": None,
    "bg_color": "#090d16",
    "accent_color": "#38bdf8",
    "accent_secondary": "#818cf8",
}

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def init_defaults():
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS github_url VARCHAR;"))
        db.execute(text("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR;"))
        db.execute(text("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR;"))
        db.execute(text("ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS resume_url VARCHAR;"))
        db.execute(text("ALTER TABLE experiences ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1 NOT NULL;"))
        db.execute(text("ALTER TABLE certifications ADD COLUMN IF NOT EXISTS certificate_data TEXT;"))
        db.commit()

        if not db.query(models.AdminUser).first():
            db.add(models.AdminUser(
                username="admin",
                password_hash=hash_password("admin123")
            ))
        existing_settings = db.query(models.SiteSettings).first()
        if not existing_settings:
            db.add(models.SiteSettings(**DEFAULT_SETTINGS))
        elif not existing_settings.whatsapp_number:
            existing_settings.whatsapp_number = "919633361830"
        db.commit()
    finally:
        db.close()

def verify_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Login required")
    token = authorization.split(" ")[1]
    if token not in ACTIVE_TOKENS:
        raise HTTPException(status_code=401, detail="Session expired. Please login again.")
    return token

def encode_certificate_to_base64(file_bytes: bytes, ext: str) -> str:
    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Selected file is empty (0 bytes). Please choose a valid PDF, JPG, or PNG file."
        )
    if ext == ".pdf":
        if fitz is None:
            raise HTTPException(
                status_code=400,
                detail="Run 'pip install pymupdf' in backend terminal to upload PDFs, or upload as JPG/PNG image."
            )
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            page = doc[0]
            pix = page.get_pixmap(dpi=160)
            png_bytes = pix.tobytes("png")
            doc.close()
            b64 = base64.b64encode(png_bytes).decode("utf-8")
            return f"data:image/png;base64,{b64}"
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file. Please upload a valid PDF or JPG/PNG.")

    mime = "image/jpeg" if ext in {".jpg", ".jpeg"} else "image/png"
    b64 = base64.b64encode(file_bytes).decode("utf-8")
    return f"data:{mime};base64,{b64}"

# ==================== PYDANTIC SCHEMAS ====================
class LoginSchema(BaseModel):
    username: str
    password: str

class ChangeCredentialsSchema(BaseModel):
    current_password: str
    new_username: str
    new_password: str

class SettingsUpdateSchema(BaseModel):
    status_text: str
    first_name: str
    last_name: str
    subtitle: str
    bio: str
    github_url: str | None = ""
    linkedin_url: str | None = ""
    whatsapp_number: str | None = ""
    bg_color: str
    accent_color: str
    accent_secondary: str

class ProjectCreate(BaseModel):
    title: str
    description: str
    tech_stack: str
    github_url: str | None = None
    live_url: str | None = None

class ExperienceCreate(BaseModel):
    role: str
    company: str
    location: str
    duration: str
    description: str
    display_order: int = 1

class MessageCreate(BaseModel):
    name: str
    email: str
    message: str

# ==================== AUTH ENDPOINTS ====================
@app.get("/")
def home():
    return {"message": "Portfolio API is live"}

@app.post("/admin/login")
def admin_login(creds: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.AdminUser).filter(models.AdminUser.username == creds.username.strip()).first()
    if not user or user.password_hash != hash_password(creds.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = secrets.token_hex(32)
    ACTIVE_TOKENS.add(token)
    return {"token": token, "username": user.username}

@app.post("/admin/logout")
def admin_logout(token: str = Depends(verify_admin)):
    ACTIVE_TOKENS.discard(token)
    return {"message": "Logged out"}

@app.put("/admin/credentials")
def update_credentials(
    data: ChangeCredentialsSchema,
    db: Session = Depends(get_db),
    token: str = Depends(verify_admin)
):
    user = db.query(models.AdminUser).first()
    if not user or user.password_hash != hash_password(data.current_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(data.new_username.strip()) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    user.username = data.new_username.strip()
    user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Credentials updated", "username": user.username}

# ==================== SITE BRANDING, LINKS & RESUME ====================
@app.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(models.SiteSettings).first()
    if not settings:
        settings = models.SiteSettings(**DEFAULT_SETTINGS)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.put("/settings")
def update_settings(
    data: SettingsUpdateSchema,
    db: Session = Depends(get_db),
    token: str = Depends(verify_admin)
):
    settings = db.query(models.SiteSettings).first()
    for key, value in data.model_dump().items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings

@app.post("/settings/resume")
async def upload_resume(
    resume_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    token: str = Depends(verify_admin)
):
    if not resume_file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    ext = os.path.splitext(resume_file.filename)[1].lower()
    if ext not in {".pdf", ".doc", ".docx"}:
        raise HTTPException(status_code=400, detail="Only PDF, DOC, or DOCX resume files allowed.")

    settings = db.query(models.SiteSettings).first()
    if settings.resume_url:
        old_filename = settings.resume_url.split("/")[-1]
        old_path = os.path.join(RESUME_UPLOAD_DIR, old_filename)
        if os.path.exists(old_path):
            os.remove(old_path)

    safe_name = f"Nikesh_Sahadevan_Resume_{secrets.token_hex(4)}{ext}"
    file_path = os.path.join(RESUME_UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume_file.file, buffer)

    settings.resume_url = f"/uploads/resume/{safe_name}"
    db.commit()
    db.refresh(settings)
    return settings

@app.delete("/settings/resume")
def delete_resume(db: Session = Depends(get_db), token: str = Depends(verify_admin)):
    settings = db.query(models.SiteSettings).first()
    if settings and settings.resume_url:
        old_filename = settings.resume_url.split("/")[-1]
        old_path = os.path.join(RESUME_UPLOAD_DIR, old_filename)
        if os.path.exists(old_path):
            os.remove(old_path)
        settings.resume_url = None
        db.commit()
        db.refresh(settings)
    return settings

@app.post("/settings/reset")
def reset_settings(db: Session = Depends(get_db), token: str = Depends(verify_admin)):
    settings = db.query(models.SiteSettings).first()
    for key, value in DEFAULT_SETTINGS.items():
        if key != "resume_url":
            setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings

# ==================== PROJECTS CRUD ====================
@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "ok"}

@app.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).order_by(models.Project.id.desc()).all()

@app.post("/projects")
def create_project(project: ProjectCreate, db: Session = Depends(get_db), token: str = Depends(verify_admin)):
    db_proj = models.Project(**project.model_dump())
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj

@app.put("/projects/{project_id}")
def update_project(project_id: int, project: ProjectCreate, db: Session = Depends(get_db), token: str = Depends(verify_admin)):
    item = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in project.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), token: str = Depends(verify_admin)):
    item = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(item)
    db.commit()
    return {"message": "Project deleted"}

# ==================== EXPERIENCES CRUD ====================
@app.get("/experiences")
def get_experiences(db: Session = Depends(get_db)):
    return db.query(models.Experience).order_by(models.Experience.display_order.asc(), models.Experience.id.asc()).all()

@app.post("/experiences")
def create_experience(exp: ExperienceCreate, db: Session = Depends(get_db), token: str = Depends(verify_admin)):
    db_exp = models.Experience(**exp.model_dump())
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@app.put("/experiences/{exp_id}")
def update_experience(exp_id: int, exp: ExperienceCreate, db: Session = Depends(get_db), token: str = Depends(verify_admin)):
    item = db.query(models.Experience).filter(models.Experience.id == exp_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Experience not found")
    for key, value in exp.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

@app.delete("/experiences/{exp_id}")
def delete_experience(exp_id: int, db: Session = Depends(get_db), token: str = Depends(verify_admin)):
    item = db.query(models.Experience).filter(models.Experience.id == exp_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(item)
    db.commit()
    return {"message": "Experience deleted"}

# ==================== CERTIFICATIONS CRUD ====================
@app.get("/certifications")
def get_certifications(db: Session = Depends(get_db)):
    return db.query(models.Certification).order_by(models.Certification.id.desc()).all()

@app.post("/certifications")
async def create_certification(
    title: str = Form(...),
    issuer: str = Form(...),
    issue_date: str = Form(...),
    credential_url: str = Form(""),
    certificate_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    token: str = Depends(verify_admin)
):
    cert_b64 = None
    ext_url = credential_url.strip() or None

    if certificate_file and certificate_file.filename:
        ext = os.path.splitext(certificate_file.filename)[1].lower()
        if ext not in {".pdf", ".jpg", ".jpeg", ".png", ".webp"}:
            raise HTTPException(status_code=400, detail="Only PDF, JPG, JPEG, PNG, or WEBP files allowed.")
        raw_bytes = await certificate_file.read()
        cert_b64 = encode_certificate_to_base64(raw_bytes, ext)
        ext_url = None

    db_cert = models.Certification(
        title=title.strip(),
        issuer=issuer.strip(),
        issue_date=issue_date.strip(),
        credential_url=ext_url,
        certificate_data=cert_b64
    )
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

@app.put("/certifications/{cert_id}")
async def update_certification(
    cert_id: int,
    title: str = Form(...),
    issuer: str = Form(...),
    issue_date: str = Form(...),
    credential_url: str = Form(""),
    certificate_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    token: str = Depends(verify_admin)
):
    item = db.query(models.Certification).filter(models.Certification.id == cert_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Certification not found")

    if certificate_file and certificate_file.filename:
        ext = os.path.splitext(certificate_file.filename)[1].lower()
        if ext not in {".pdf", ".jpg", ".jpeg", ".png", ".webp"}:
            raise HTTPException(status_code=400, detail="Only PDF, JPG, JPEG, PNG, or WEBP files allowed.")
        raw_bytes = await certificate_file.read()
        item.certificate_data = encode_certificate_to_base64(raw_bytes, ext)
        item.credential_url = None
    elif credential_url.strip():
        item.credential_url = credential_url.strip()

    item.title = title.strip()
    item.issuer = issuer.strip()
    item.issue_date = issue_date.strip()
    db.commit()
    db.refresh(item)
    return item

@app.delete("/certifications/{cert_id}")
def delete_certification(cert_id: int, db: Session = Depends(get_db), token: str = Depends(verify_admin)):
    item = db.query(models.Certification).filter(models.Certification.id == cert_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(item)
    db.commit()
    return {"message": "Certification deleted"}

# ==================== MESSAGES CRUD ====================
@app.get("/messages")
def get_messages(db: Session = Depends(get_db), token: str = Depends(verify_admin)):
    return db.query(models.Message).order_by(models.Message.id.desc()).all()

@app.post("/messages")
def create_message(msg: MessageCreate, db: Session = Depends(get_db)):
    db_msg = models.Message(**msg.model_dump())
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

@app.delete("/messages/{msg_id}")
def delete_message(msg_id: int, db: Session = Depends(get_db), token: str = Depends(verify_admin)):
    item = db.query(models.Message).filter(models.Message.id == msg_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(item)
    db.commit()
    return {"message": "Message deleted"}