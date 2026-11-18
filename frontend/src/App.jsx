import { useState, useEffect } from 'react';
import './App.css';

// ============================================================================
// CONFIGURATION: FastAPI Backend Base URL & Default Theme Constants
// ============================================================================
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const DEFAULT_SITE_SETTINGS = {
  status_text: 'Open to ERP & Full-Stack Opportunities',
  first_name: 'Nikesh',
  last_name: 'Sahadevan',
  subtitle: 'Odoo ERP Specialist • Full-Stack Python & React Developer',
  bio: 'Building scalable enterprise workflows, custom ERP integrations, and modern database-driven web applications with FastAPI, PostgreSQL, and React.',
  github_url: 'https://github.com/NikeshSahadevan',
  linkedin_url: '',
  whatsapp_number: '919633361830',
  resume_url: null,
  bg_color: '#090d16',
  accent_color: '#38bdf8',
  accent_secondary: '#818cf8',
};

const formatExternalUrl = (url) => {
  if (!url || !url.trim()) return '';
  let clean = url.trim().replace(/^https?:\/\/(https?:\/\/)/i, '$1');
  if (clean.startsWith('/uploads')) return `${API_URL}${clean}`;
  return clean.startsWith('http://') || clean.startsWith('https://') ? clean : `https://${clean}`;
};

// Uses api.whatsapp.com/send so it works reliably across Oman & global networks
const buildWhatsAppUrl = (rawNumber, firstName = 'Nikesh') => {
  const effectiveNumber = rawNumber && rawNumber.trim() ? rawNumber : '919633361830';
  const digits = effectiveNumber.replace(/\D/g, '');
  if (!digits) return '';
  const message = encodeURIComponent(`Hi ${firstName}, I visited your portfolio and would like to connect.`);
  return `https://api.whatsapp.com/send?phone=${digits}&text=${message}`;
};

// Render multi-line / bullet-point text cleanly as bullet points
const renderBulletList = (text) => {
  if (!text) return null;
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length <= 1) {
    const cleanedSingle = lines[0]?.replace(/^[•\-*▪►]+\s*/, '') || text;
    return <p className="card-desc">{cleanedSingle}</p>;
  }

  return (
    <ul className="exp-bullet-list">
      {lines.map((line, idx) => (
        <li key={idx}>{line.replace(/^[•\-*▪►]+\s*/, '')}</li>
      ))}
    </ul>
  );
};

// Crisp Professional SVG Icons
const GitHubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z" />
  </svg>
);

const ResumeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <polyline points="9 15 12 18 15 15" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const LocationPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const THEME_PRESETS = [
  { name: 'Default Midnight', bg_color: '#090d16', accent_color: '#38bdf8', accent_secondary: '#818cf8' },
  { name: 'Emerald Slate', bg_color: '#071311', accent_color: '#34d399', accent_secondary: '#06b6d4' },
  { name: 'Royal Obsidian', bg_color: '#0c0a1a', accent_color: '#a78bfa', accent_secondary: '#f472b6' },
  { name: 'Carbon Amber', bg_color: '#11100e', accent_color: '#fbbf24', accent_secondary: '#f97316' },
];

function App() {
  // 1. Public Portfolio Data States
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  // 2. Navigation & Preview Modal States
  const [selectedProject, setSelectedProject] = useState(null);
  const [previewCert, setPreviewCert] = useState(null);
  const [activeNav, setActiveNav] = useState('about');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 3. Admin Authentication & Dashboard States
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [adminUsername, setAdminUsername] = useState(() => localStorage.getItem('admin_user') || 'admin');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [isAdminView, setIsAdminView] = useState(false);
  const [adminTab, setAdminTab] = useState('projects');
  const [alertBox, setAlertBox] = useState({ type: '', text: '' });

  // 4. Admin Create / Edit Form States
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '', description: '', tech_stack: '', github_url: '', live_url: ''
  });

  const [editingExpId, setEditingExpId] = useState(null);
  const [newExp, setNewExp] = useState({
    role: '', company: '', location: '', duration: '', description: '', display_order: 1
  });

  const [editingCertId, setEditingCertId] = useState(null);
  const [newCert, setNewCert] = useState({
    title: '', issuer: '', issue_date: '', credential_url: '', file: null
  });
  const [certUploading, setCertUploading] = useState(false);

  const [settingsForm, setSettingsForm] = useState(DEFAULT_SITE_SETTINGS);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  const [credForm, setCredForm] = useState({
    current_password: '', new_username: '', new_password: '', confirm_password: ''
  });

  // Public Contact Form
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [contactNotice, setContactNotice] = useState({ type: '', text: '' });
  const [sending, setSending] = useState(false);

  const triggerAlert = (type, text) => {
    setAlertBox({ type, text });
    setTimeout(() => setAlertBox({ type: '', text: '' }), 4000);
  };

  // Dynamic Theme & Browser Tab Title Applicator
  useEffect(() => {
    const activeTheme = isAdminView ? settingsForm : siteSettings;
    document.documentElement.style.setProperty('--bg', activeTheme.bg_color || '#090d16');
    document.documentElement.style.setProperty('--accent', activeTheme.accent_color || '#38bdf8');
    document.documentElement.style.setProperty('--accent-2', activeTheme.accent_secondary || '#818cf8');
    if (activeTheme.first_name || activeTheme.last_name) {
      document.title = `${activeTheme.first_name || ''} ${activeTheme.last_name || ''} | Portfolio`.trim();
    }
  }, [siteSettings, settingsForm, isAdminView]);

  // Fetch Public Portfolio Data & Site Settings
  const fetchPublicData = async () => {
    setLoading(true);
    setApiError('');
    try {
      const [projRes, expRes, certRes, setRes] = await Promise.all([
        fetch(`${API_URL}/projects`),
        fetch(`${API_URL}/experiences`),
        fetch(`${API_URL}/certifications`),
        fetch(`${API_URL}/settings`),
      ]);
      if (!projRes.ok || !expRes.ok || !certRes.ok) {
        throw new Error('Failed to load portfolio data from server.');
      }
      setProjects(await projRes.json());
      setExperiences(await expRes.json());
      setCertifications(await certRes.json());

      if (setRes.ok) {
        const loadedSettings = await setRes.json();
        setSiteSettings(loadedSettings);
        setSettingsForm(loadedSettings);
      }
    } catch {
      setApiError('Unable to connect to backend server. Ensure FastAPI is running.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Protected Inbox Messages
  const fetchMessages = async (activeToken = token) => {
    if (!activeToken) return;
    try {
      const res = await fetch(`${API_URL}/messages`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch {
      triggerAlert('error', 'Could not fetch inbox messages.');
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  useEffect(() => {
    if (token && isAdminView) {
      fetchMessages(token);
    }
  }, [token, isAdminView]);

  // Scroll Reveal Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [projects, experiences, certifications, isAdminView]);

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.detail || 'Invalid credentials');
        return;
      }
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', data.username);
      setToken(data.token);
      setAdminUsername(data.username);
      setShowLoginModal(false);
      setIsAdminView(true);
      setMobileMenuOpen(false);
      setLoginForm({ username: '', password: '' });
      fetchMessages(data.token);
    } catch {
      setLoginError('Server unreachable. Start FastAPI backend first.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (token) {
      fetch(`${API_URL}/admin/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken('');
    setIsAdminView(false);
    setMobileMenuOpen(false);
    setMessages([]);
  };

  const handleChangeCredentials = async (e) => {
    e.preventDefault();
    if (credForm.new_password !== credForm.confirm_password) {
      triggerAlert('error', 'New passwords do not match!');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin/credentials`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: credForm.current_password,
          new_username: credForm.new_username,
          new_password: credForm.new_password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        triggerAlert('error', data.detail || 'Failed to update credentials.');
        return;
      }
      localStorage.setItem('admin_user', data.username);
      setAdminUsername(data.username);
      setCredForm({ current_password: '', new_username: '', new_password: '', confirm_password: '' });
      triggerAlert('success', 'Username & password updated securely!');
    } catch {
      triggerAlert('error', 'Network error while updating credentials.');
    }
  };

  // Site Branding, Social Links, Resume & Theme Handlers
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        ...settingsForm,
        github_url: formatExternalUrl(settingsForm.github_url),
        linkedin_url: formatExternalUrl(settingsForm.linkedin_url),
        whatsapp_number: (settingsForm.whatsapp_number || '').trim(),
      };
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        handleLogout();
        setShowLoginModal(true);
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to save settings');
      }
      const updated = await res.json();
      setSiteSettings(updated);
      setSettingsForm(updated);
      triggerAlert('success', 'Site branding, links & theme saved!');
    } catch (err) {
      triggerAlert('error', err.message || 'Failed to update site branding.');
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      triggerAlert('error', 'Please select a PDF or DOCX resume file first.');
      return;
    }
    setResumeUploading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('resume_file', resumeFile);

      const res = await fetch(`${API_URL}/settings/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });
      const data = await res.json();
      if (!res.ok) {
        triggerAlert('error', data.detail || 'Failed to upload resume.');
        return;
      }
      setSiteSettings(data);
      setSettingsForm(data);
      setResumeFile(null);
      const inputEl = document.getElementById('resume-file-input');
      if (inputEl) inputEl.value = '';
      triggerAlert('success', 'Resume uploaded and published!');
    } catch {
      triggerAlert('error', 'Error uploading resume.');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your current resume?')) return;
    try {
      const res = await fetch(`${API_URL}/settings/resume`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setSiteSettings(updated);
      setSettingsForm(updated);
      triggerAlert('success', 'Resume deleted.');
    } catch {
      triggerAlert('error', 'Failed to delete resume.');
    }
  };

  const handleResetDefaultTheme = async () => {
    if (!window.confirm('Reset background and colors back to the original default style?')) return;
    try {
      const res = await fetch(`${API_URL}/settings/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const resetData = await res.json();
      setSiteSettings(resetData);
      setSettingsForm(resetData);
      triggerAlert('success', 'Restored to original default theme!');
    } catch {
      triggerAlert('error', 'Failed to reset settings.');
    }
  };

  // Save / Update Projects, Experiences, Certifications
  const handleSaveProject = async (e) => {
    e.preventDefault();
    const isEdit = editingProjectId !== null;
    const url = isEdit ? `${API_URL}/projects/${editingProjectId}` : `${API_URL}/projects`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newProject,
          github_url: formatExternalUrl(newProject.github_url) || null,
          live_url: formatExternalUrl(newProject.live_url) || null,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        handleLogout();
        setShowLoginModal(true);
        return;
      }
      if (!res.ok) {
        triggerAlert('error', data.detail || 'Failed to save project.');
        return;
      }
      setNewProject({ title: '', description: '', tech_stack: '', github_url: '', live_url: '' });
      setEditingProjectId(null);
      await fetchPublicData();
      triggerAlert('success', isEdit ? 'Project updated successfully!' : 'Project published successfully!');
    } catch {
      triggerAlert('error', 'Server error while saving project.');
    }
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    const isEdit = editingExpId !== null;
    const url = isEdit ? `${API_URL}/experiences/${editingExpId}` : `${API_URL}/experiences`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newExp,
          display_order: Number(newExp.display_order) || 1,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        handleLogout();
        setShowLoginModal(true);
        return;
      }
      if (!res.ok) {
        triggerAlert('error', data.detail || 'Failed to save experience.');
        return;
      }
      setNewExp({ role: '', company: '', location: '', duration: '', description: '', display_order: 1 });
      setEditingExpId(null);
      await fetchPublicData();
      triggerAlert('success', isEdit ? 'Experience updated successfully!' : 'Experience added successfully!');
    } catch {
      triggerAlert('error', 'Server error while saving experience.');
    }
  };

  const handleSaveCertification = async (e) => {
    e.preventDefault();
    setCertUploading(true);
    const isEdit = editingCertId !== null;
    const url = isEdit ? `${API_URL}/certifications/${editingCertId}` : `${API_URL}/certifications`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const formPayload = new FormData();
      formPayload.append('title', newCert.title);
      formPayload.append('issuer', newCert.issuer);
      formPayload.append('issue_date', newCert.issue_date);
      formPayload.append('credential_url', formatExternalUrl(newCert.credential_url));
      if (newCert.file) {
        formPayload.append('certificate_file', newCert.file);
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });
      const data = await res.json();
      if (res.status === 401) {
        handleLogout();
        setShowLoginModal(true);
        return;
      }
      if (!res.ok) {
        triggerAlert('error', data.detail || 'Error saving certificate.');
        return;
      }
      setNewCert({ title: '', issuer: '', issue_date: '', credential_url: '', file: null });
      setEditingCertId(null);
      const fileInput = document.getElementById('cert-file-input');
      if (fileInput) fileInput.value = '';
      await fetchPublicData();
      triggerAlert('success', isEdit ? 'Certification updated successfully!' : 'Certification saved successfully!');
    } catch {
      triggerAlert('error', 'Server error while saving certification.');
    } finally {
      setCertUploading(false);
    }
  };

  const handleDelete = async (endpoint, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        handleLogout();
        setShowLoginModal(true);
        return;
      }
      if (!res.ok) {
        triggerAlert('error', 'Failed to delete item.');
        return;
      }
      if (endpoint === 'projects' && editingProjectId === id) {
        setEditingProjectId(null);
        setNewProject({ title: '', description: '', tech_stack: '', github_url: '', live_url: '' });
      }
      if (endpoint === 'experiences' && editingExpId === id) {
        setEditingExpId(null);
        setNewExp({ role: '', company: '', location: '', duration: '', description: '', display_order: 1 });
      }
      if (endpoint === 'certifications' && editingCertId === id) {
        setEditingCertId(null);
        setNewCert({ title: '', issuer: '', issue_date: '', credential_url: '', file: null });
      }
      if (endpoint === 'messages') {
        fetchMessages();
      } else {
        fetchPublicData();
      }
      triggerAlert('success', 'Item deleted successfully.');
    } catch {
      triggerAlert('error', 'Server unreachable.');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setContactNotice({ type: '', text: '' });
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      setContactNotice({ type: 'success', text: 'Message sent! I will respond shortly.' });
      setFormData({ name: '', email: '', message: '' });
      if (token) fetchMessages();
    } catch {
      setContactNotice({ type: 'error', text: 'Failed to send message. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  const scrollToSection = (id) => {
    setIsAdminView(false);
    setActiveNav(id);
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const formattedProjectCount = String(projects.length).padStart(2, '0');
  const whatsappLink = buildWhatsAppUrl(siteSettings.whatsapp_number, siteSettings.first_name);
  const resolvedResumeUrl = formatExternalUrl(siteSettings.resume_url);

  return (
    <div className="app-wrapper">
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>

      {/* NAVBAR WITH MOBILE HAMBURGER MENU */}
      <nav className="navbar">
        <div className="nav-inner">
          <span className="logo" onClick={() => scrollToSection('about')}>
            {siteSettings.first_name?.charAt(0) || 'N'}
            {siteSettings.last_name?.charAt(0) || 'S'}
            <span className="dot">.</span>
          </span>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          {/* Desktop & Collapsible Mobile Navigation Links */}
          <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            {['about', 'projects', 'experience', 'certifications', 'contact'].map((item) => (
              <button
                key={item}
                className={`nav-btn ${!isAdminView && activeNav === item ? 'active' : ''}`}
                onClick={() => scrollToSection(item)}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
            {token ? (
              <button
                className={`admin-nav-btn ${isAdminView ? 'active' : ''}`}
                onClick={() => {
                  setSettingsForm(siteSettings);
                  setIsAdminView(!isAdminView);
                  setMobileMenuOpen(false);
                }}
              >
                {isAdminView ? '← View Portfolio' : 'Dashboard'}
              </button>
            ) : (
              <button
                className="admin-nav-btn"
                onClick={() => {
                  setLoginForm({ username: '', password: '' });
                  setLoginError('');
                  setShowLoginModal(true);
                  setMobileMenuOpen(false);
                }}
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ==================== ADMIN WORKSPACE ==================== */}
      {isAdminView && token ? (
        <main className="container admin-workspace">
          <div className="admin-topbar">
            <div>
              <span className="eyebrow">Authenticated as @{adminUsername}</span>
              <h2>Portfolio Control Panel</h2>
            </div>
            <button className="btn-danger" onClick={handleLogout}>
              Sign Out
            </button>
          </div>

          {alertBox.text && (
            <div className={`alert-banner ${alertBox.type}`}>{alertBox.text}</div>
          )}

          <div className="admin-layout">
            <aside className="admin-sidebar">
              {[
                { key: 'projects', label: 'Projects', count: projects.length },
                { key: 'experiences', label: 'Experience', count: experiences.length },
                { key: 'certifications', label: 'Certifications', count: certifications.length },
                { key: 'site_branding', label: 'Site Branding', count: null },
                { key: 'messages', label: 'Inbox', count: messages.length },
                { key: 'security', label: 'Security', count: null },
              ].map((item) => (
                <button
                  key={item.key}
                  className={`sidebar-item ${adminTab === item.key ? 'active' : ''}`}
                  onClick={() => setAdminTab(item.key)}
                >
                  <span>{item.label}</span>
                  {item.count !== null && <span className="sidebar-badge">{item.count}</span>}
                </button>
              ))}
            </aside>

            <div className="admin-content">
              {/* TAB 1: PROJECTS */}
              {adminTab === 'projects' && (
                <div className="admin-split">
                  <form className="panel-card form-stack" onSubmit={handleSaveProject}>
                    <h3>{editingProjectId ? 'Edit Project' : 'Add New Project'}</h3>
                    <div className="field-group">
                      <label>Project Title *</label>
                      <input
                        type="text"
                        placeholder="e.g., Full-Stack Portfolio Website"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Tech Stack * (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g., Python, FastAPI, PostgreSQL, React"
                        value={newProject.tech_stack}
                        onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Description *</label>
                      <textarea
                        rows="3"
                        placeholder="Briefly describe architecture and features..."
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-row">
                      <div className="field-group">
                        <label>GitHub URL</label>
                        <input
                          type="text"
                          placeholder="github.com/..."
                          value={newProject.github_url}
                          onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                        />
                      </div>
                      <div className="field-group">
                        <label>Live URL</label>
                        <input
                          type="text"
                          placeholder="your-app.streamlit.app"
                          value={newProject.live_url}
                          onChange={(e) => setNewProject({ ...newProject, live_url: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-btn-row">
                      <button type="submit" className="btn-primary full-btn">
                        {editingProjectId ? 'Update Project' : 'Publish Project'}
                      </button>
                      {editingProjectId && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setEditingProjectId(null);
                            setNewProject({ title: '', description: '', tech_stack: '', github_url: '', live_url: '' });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="panel-card">
                    <h3>Published Projects ({projects.length})</h3>
                    <div className="record-list">
                      {projects.length === 0 ? (
                        <p className="empty-state">No projects added yet.</p>
                      ) : (
                        projects.map((p) => (
                          <div key={p.id} className={`record-row ${editingProjectId === p.id ? 'editing-active' : ''}`}>
                            <div className="record-info">
                              <strong>{p.title}</strong>
                              <span>{p.tech_stack}</span>
                            </div>
                            <div className="row-actions">
                              <button
                                type="button"
                                className="btn-edit-sm"
                                onClick={() => {
                                  setEditingProjectId(p.id);
                                  setNewProject({
                                    title: p.title || '',
                                    description: p.description || '',
                                    tech_stack: p.tech_stack || '',
                                    github_url: p.github_url || '',
                                    live_url: p.live_url || '',
                                  });
                                }}
                              >
                                Edit
                              </button>
                              <button type="button" className="btn-danger-sm" onClick={() => handleDelete('projects', p.id)}>
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXPERIENCE */}
              {adminTab === 'experiences' && (
                <div className="admin-split">
                  <form className="panel-card form-stack" onSubmit={handleSaveExperience}>
                    <h3>{editingExpId ? 'Edit Work Experience' : 'Add Work Experience'}</h3>
                    <div className="field-row">
                      <div className="field-group">
                        <label>Job Role *</label>
                        <input
                          type="text"
                          placeholder="e.g., Sales Coordinator & Odoo ERP Specialist"
                          value={newExp.role}
                          onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                          required
                        />
                      </div>
                      <div className="field-group">
                        <label>Position Order (1 = Top/Current) *</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={newExp.display_order}
                          onChange={(e) => setNewExp({ ...newExp, display_order: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="field-group">
                      <label>Company Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Tamkeen Digital Solutions"
                        value={newExp.company}
                        onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-row">
                      <div className="field-group">
                        <label>Location (City, Country) *</label>
                        <input
                          type="text"
                          placeholder="e.g., Muscat, Oman or Kochi, India"
                          value={newExp.location}
                          onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                          required
                        />
                      </div>
                      <div className="field-group">
                        <label>Duration *</label>
                        <input
                          type="text"
                          placeholder="e.g., Apr 2026 - Present"
                          value={newExp.duration}
                          onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="field-group">
                      <label>Responsibilities * (Paste bullet points or one point per line)</label>
                      <textarea
                        rows="5"
                        placeholder={"• Configured and customized Odoo ERP modules (Sales, Inventory, Accounting)\n• Coordinated B2B client onboarding and technical support workflows\n• Automated reporting dashboards using Python and SQL"}
                        value={newExp.description}
                        onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-btn-row">
                      <button type="submit" className="btn-primary full-btn">
                        {editingExpId ? 'Update Experience' : 'Save Experience'}
                      </button>
                      {editingExpId && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setEditingExpId(null);
                            setNewExp({ role: '', company: '', location: '', duration: '', description: '', display_order: 1 });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="panel-card">
                    <h3>Career History ({experiences.length})</h3>
                    <div className="record-list">
                      {experiences.length === 0 ? (
                        <p className="empty-state">No experience records yet.</p>
                      ) : (
                        experiences.map((exp) => (
                          <div key={exp.id} className={`record-row ${editingExpId === exp.id ? 'editing-active' : ''}`}>
                            <div className="record-info">
                              <strong>#{exp.display_order} &bull; {exp.role}</strong>
                              <span>{exp.company} &bull; {exp.location} &bull; {exp.duration}</span>
                            </div>
                            <div className="row-actions">
                              <button
                                type="button"
                                className="btn-edit-sm"
                                onClick={() => {
                                  setEditingExpId(exp.id);
                                  setNewExp({
                                    role: exp.role || '',
                                    company: exp.company || '',
                                    location: exp.location || '',
                                    duration: exp.duration || '',
                                    description: exp.description || '',
                                    display_order: exp.display_order || 1,
                                  });
                                }}
                              >
                                Edit
                              </button>
                              <button type="button" className="btn-danger-sm" onClick={() => handleDelete('experiences', exp.id)}>
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CERTIFICATIONS */}
              {adminTab === 'certifications' && (
                <div className="admin-split">
                  <form className="panel-card form-stack" onSubmit={handleSaveCertification}>
                    <h3>{editingCertId ? 'Edit Certification' : 'Add Certification (PDF / JPG / PNG)'}</h3>
                    <div className="field-group">
                      <label>Certification Title *</label>
                      <input
                        type="text"
                        placeholder="e.g., AWS Cloud Practitioner Essentials"
                        value={newCert.title}
                        onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-row">
                      <div className="field-group">
                        <label>Issuing Organization *</label>
                        <input
                          type="text"
                          placeholder="e.g., Amazon Web Services"
                          value={newCert.issuer}
                          onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                          required
                        />
                      </div>
                      <div className="field-group">
                        <label>Year / Date *</label>
                        <input
                          type="text"
                          placeholder="e.g., 2026"
                          value={newCert.issue_date}
                          onChange={(e) => setNewCert({ ...newCert, issue_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="field-group">
                      <label>{editingCertId ? 'Upload / Replace Certificate File (PDF, JPG, PNG)' : 'Upload Certificate File (PDF, JPG, PNG)'}</label>
                      <input
                        id="cert-file-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="file-input"
                        onChange={(e) => setNewCert({ ...newCert, file: e.target.files[0] || null })}
                      />
                    </div>
                    <div className="field-group">
                      <label>External Verification Link (optional — leave blank if uploading file)</label>
                      <input
                        type="text"
                        placeholder="e.g., credly.com/badges/..."
                        value={newCert.credential_url}
                        onChange={(e) => setNewCert({ ...newCert, credential_url: e.target.value })}
                      />
                    </div>
                    <div className="form-btn-row">
                      <button type="submit" className="btn-primary full-btn" disabled={certUploading}>
                        {certUploading ? 'Saving...' : editingCertId ? 'Update Certification' : 'Save Certification'}
                      </button>
                      {editingCertId && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => {
                            setEditingCertId(null);
                            setNewCert({ title: '', issuer: '', issue_date: '', credential_url: '', file: null });
                            const fileInput = document.getElementById('cert-file-input');
                            if (fileInput) fileInput.value = '';
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="panel-card">
                    <h3>Saved Credentials ({certifications.length})</h3>
                    <div className="record-list">
                      {certifications.length === 0 ? (
                        <p className="empty-state">No certifications added yet.</p>
                      ) : (
                        certifications.map((c) => (
                          <div key={c.id} className={`record-row ${editingCertId === c.id ? 'editing-active' : ''}`}>
                            <div className="record-info">
                              <strong>{c.title}</strong>
                              <span>
                                {c.issuer} ({c.issue_date})
                                {c.certificate_data && (
                                  <>
                                    {' • '}
                                    <button
                                      type="button"
                                      className="inline-link-btn"
                                      onClick={() => setPreviewCert(c)}
                                    >
                                      Preview File
                                    </button>
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="row-actions">
                              <button
                                type="button"
                                className="btn-edit-sm"
                                onClick={() => {
                                  setEditingCertId(c.id);
                                  setNewCert({
                                    title: c.title || '',
                                    issuer: c.issuer || '',
                                    issue_date: c.issue_date || '',
                                    credential_url: c.credential_url || '',
                                    file: null,
                                  });
                                }}
                              >
                                Edit
                              </button>
                              <button type="button" className="btn-danger-sm" onClick={() => handleDelete('certifications', c.id)}>
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SITE BRANDING */}
              {adminTab === 'site_branding' && (
                <div className="admin-split">
                  <form className="panel-card form-stack" onSubmit={handleSaveSettings}>
                    <h3>Profile Identity &amp; Contact Channels</h3>
                    <div className="field-group">
                      <label>Availability Status Pill *</label>
                      <input
                        type="text"
                        value={settingsForm.status_text}
                        onChange={(e) => setSettingsForm({ ...settingsForm, status_text: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-row">
                      <div className="field-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          value={settingsForm.first_name}
                          onChange={(e) => setSettingsForm({ ...settingsForm, first_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="field-group">
                        <label>Last Name (Gradient Highlight) *</label>
                        <input
                          type="text"
                          value={settingsForm.last_name}
                          onChange={(e) => setSettingsForm({ ...settingsForm, last_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="field-group">
                      <label>Headline / Roles *</label>
                      <input
                        type="text"
                        value={settingsForm.subtitle}
                        onChange={(e) => setSettingsForm({ ...settingsForm, subtitle: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Executive Bio Summary *</label>
                      <textarea
                        rows="3"
                        value={settingsForm.bio}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-row">
                      <div className="field-group">
                        <label>GitHub Profile URL</label>
                        <input
                          type="text"
                          placeholder="github.com/NikeshSahadevan"
                          value={settingsForm.github_url || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, github_url: e.target.value })}
                        />
                      </div>
                      <div className="field-group">
                        <label>LinkedIn Profile URL</label>
                        <input
                          type="text"
                          placeholder="linkedin.com/in/nikesh-sahadevan"
                          value={settingsForm.linkedin_url || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, linkedin_url: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="field-group">
                      <label>WhatsApp Number (with country code, e.g., +91 9633361830)</label>
                      <input
                        type="text"
                        placeholder="+91 9633361830"
                        value={settingsForm.whatsapp_number || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn-primary full-btn">Save Profile &amp; Contact Links</button>
                  </form>

                  <div className="form-stack">
                    {/* RESUME MANAGER */}
                    <div className="panel-card form-stack">
                      <h3>Resume / CV Manager (PDF / DOCX)</h3>
                      {resolvedResumeUrl ? (
                        <div className="record-row">
                          <div className="record-info">
                            <strong>Current Resume Active</strong>
                            <a href={resolvedResumeUrl} target="_blank" rel="noreferrer" className="inline-link">
                              Open / Download Uploaded Resume &#8599;
                            </a>
                          </div>
                          <button type="button" className="btn-danger-sm" onClick={handleDeleteResume}>
                            Delete Resume
                          </button>
                        </div>
                      ) : (
                        <p className="empty-state">No resume uploaded yet.</p>
                      )}

                      <form onSubmit={handleUploadResume} className="form-stack">
                        <div className="field-group">
                          <label>{resolvedResumeUrl ? 'Replace with New Resume' : 'Upload Resume File'}</label>
                          <input
                            id="resume-file-input"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="file-input"
                            onChange={(e) => setResumeFile(e.target.files[0] || null)}
                          />
                        </div>
                        <button type="submit" className="btn-primary" disabled={resumeUploading}>
                          {resumeUploading ? 'Uploading Resume...' : 'Upload Resume'}
                        </button>
                      </form>
                    </div>

                    {/* THEME CUSTOMIZER */}
                    <div className="panel-card form-stack">
                      <h3>Appearance &amp; Theme</h3>
                      <div className="field-group">
                        <label>Quick Style Presets</label>
                        <div className="preset-grid">
                          {THEME_PRESETS.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              className="preset-btn"
                              onClick={() =>
                                setSettingsForm({
                                  ...settingsForm,
                                  bg_color: preset.bg_color,
                                  accent_color: preset.accent_color,
                                  accent_secondary: preset.accent_secondary,
                                })
                              }
                            >
                              <span
                                className="swatch-dot"
                                style={{ background: `linear-gradient(135deg, ${preset.accent_color}, ${preset.accent_secondary})` }}
                              ></span>
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="color-picker-grid">
                        <div className="field-group">
                          <label>Background</label>
                          <input
                            type="color"
                            className="color-box"
                            value={settingsForm.bg_color}
                            onChange={(e) => setSettingsForm({ ...settingsForm, bg_color: e.target.value })}
                          />
                        </div>
                        <div className="field-group">
                          <label>Primary Accent</label>
                          <input
                            type="color"
                            className="color-box"
                            value={settingsForm.accent_color}
                            onChange={(e) => setSettingsForm({ ...settingsForm, accent_color: e.target.value })}
                          />
                        </div>
                        <div className="field-group">
                          <label>Secondary</label>
                          <input
                            type="color"
                            className="color-box"
                            value={settingsForm.accent_secondary}
                            onChange={(e) => setSettingsForm({ ...settingsForm, accent_secondary: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="theme-actions">
                        <button type="button" className="btn-primary" onClick={handleSaveSettings}>
                          Apply &amp; Save Theme
                        </button>
                        <button type="button" className="btn-secondary" onClick={handleResetDefaultTheme}>
                          Reset to Original Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: INBOX */}
              {adminTab === 'messages' && (
                <div className="panel-card">
                  <h3>Visitor Inquiries ({messages.length})</h3>
                  <div className="record-list">
                    {messages.length === 0 ? (
                      <p className="empty-state">Inbox is empty.</p>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id} className="record-row message-row">
                          <div className="record-info">
                            <strong>{m.name} <small>({m.email})</small></strong>
                            <p className="msg-body">{m.message}</p>
                          </div>
                          <button className="btn-danger-sm" onClick={() => handleDelete('messages', m.id)}>
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SECURITY */}
              {adminTab === 'security' && (
                <div className="panel-card security-card">
                  <h3>Change Admin Username &amp; Password</h3>
                  <p className="muted-sub">
                    Credentials are encrypted with SHA-256 and stored securely in PostgreSQL.
                  </p>
                  <form className="form-stack" onSubmit={handleChangeCredentials} autoComplete="off">
                    <div className="field-group">
                      <label>Current Password *</label>
                      <input
                        type="password"
                        name="sec_curr_pass"
                        autoComplete="new-password"
                        placeholder="Enter current password"
                        value={credForm.current_password}
                        onChange={(e) => setCredForm({ ...credForm, current_password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>New Username *</label>
                      <input
                        type="text"
                        name="sec_new_user"
                        autoComplete="off"
                        placeholder="Minimum 3 characters"
                        value={credForm.new_username}
                        onChange={(e) => setCredForm({ ...credForm, new_username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-row">
                      <div className="field-group">
                        <label>New Password *</label>
                        <input
                          type="password"
                          name="sec_new_pass"
                          autoComplete="new-password"
                          placeholder="Minimum 6 characters"
                          value={credForm.new_password}
                          onChange={(e) => setCredForm({ ...credForm, new_password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="field-group">
                        <label>Confirm New Password *</label>
                        <input
                          type="password"
                          name="sec_conf_pass"
                          autoComplete="new-password"
                          placeholder="Re-enter new password"
                          value={credForm.confirm_password}
                          onChange={(e) => setCredForm({ ...credForm, confirm_password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary">Update Credentials</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        /* ==================== PUBLIC PORTFOLIO VIEW ==================== */
        <main className="container">
          {apiError && <div className="alert-banner error">{apiError}</div>}

          {/* HERO SECTION */}
          <header id="about" className="hero reveal">
            <div className="status-pill">
              <span className="pulse-dot"></span> {siteSettings.status_text}
            </div>
            <h1>
              {siteSettings.first_name}{' '}
              <span className="gradient-text">{siteSettings.last_name}</span>
            </h1>
            <p className="subtitle">{siteSettings.subtitle}</p>
            <p className="bio">{siteSettings.bio}</p>

            <div className="hero-actions">
              <button className="btn-primary" onClick={() => scrollToSection('projects')}>
                Explore Work
              </button>
              <button className="btn-secondary" onClick={() => scrollToSection('contact')}>
                Get In Touch
              </button>
            </div>

            <div className="social-dock">
              {siteSettings.github_url && (
                <a
                  href={formatExternalUrl(siteSettings.github_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="dock-btn"
                >
                  <GitHubIcon />
                  <span>GitHub</span>
                  <ExternalLinkIcon />
                </a>
              )}
              {siteSettings.linkedin_url && (
                <a
                  href={formatExternalUrl(siteSettings.linkedin_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="dock-btn linkedin-btn"
                >
                  <LinkedInIcon />
                  <span>LinkedIn</span>
                  <ExternalLinkIcon />
                </a>
              )}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="dock-btn whatsapp-dock-btn"
                >
                  <WhatsAppIcon />
                  <span>WhatsApp</span>
                  <ExternalLinkIcon />
                </a>
              )}
              {resolvedResumeUrl && (
                <a
                  href={resolvedResumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="dock-btn resume-btn"
                >
                  <ResumeIcon />
                  <span>Download CV</span>
                </a>
              )}
            </div>
          </header>

          {/* PROJECTS SECTION */}
          <section id="projects" className="section">
            <div className="section-header reveal">
              <div>
                <span className="eyebrow">Selected Work</span>
                <h2>Featured Projects</h2>
              </div>
              <div className="section-meta-bar">
                <span className="count-badge">
                  <span className="pulse-dot"></span>
                  {formattedProjectCount} {projects.length === 1 ? 'Total Project' : 'Total Projects'}
                </span>
                {siteSettings.github_url && (
                  <a
                    href={formatExternalUrl(siteSettings.github_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="repo-link-pill"
                  >
                    <GitHubIcon />
                    <span>GitHub Repositories</span>
                    <ExternalLinkIcon />
                  </a>
                )}
              </div>
            </div>

            {loading ? (
              <p className="empty-state">Loading projects...</p>
            ) : (
              <div className="grid">
                {projects.length === 0 ? (
                  <p className="empty-state">No projects added yet.</p>
                ) : (
                  projects.map((proj) => (
                    <article
                      key={proj.id}
                      className="card project-card reveal"
                      onClick={() => setSelectedProject(proj)}
                    >
                      <div className="card-top">
                        <span className="folder-icon">&#9672;</span>
                        <div className="card-links" onClick={(e) => e.stopPropagation()}>
                          {proj.github_url && (
                            <a
                              href={formatExternalUrl(proj.github_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="icon-link"
                              title="Source Code"
                            >
                              <GitHubIcon />
                              <span>Code</span>
                            </a>
                          )}
                          {proj.live_url && (
                            <a
                              href={formatExternalUrl(proj.live_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="icon-link"
                              title="Live Demo"
                            >
                              <span>Live</span>
                              <ExternalLinkIcon />
                            </a>
                          )}
                        </div>
                      </div>
                      <h3>{proj.title}</h3>
                      <p className="card-desc">{proj.description}</p>
                      <div className="tech-tags">
                        {proj.tech_stack?.split(',').map((tech, idx) => (
                          <span key={idx} className="tag">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}
          </section>

          {/* WORK EXPERIENCE SECTION WITH COMPANY, LOCATION & BULLET POINTS */}
          <section id="experience" className="section">
            <div className="section-header reveal">
              <div>
                <span className="eyebrow">Career Path</span>
                <h2>Work Experience</h2>
              </div>
            </div>

            <div className="timeline">
              {experiences.map((exp) => (
                <div key={exp.id} className="timeline-item reveal">
                  <div className="timeline-marker"></div>
                  <div className="card timeline-card">
                    <div className="exp-header">
                      <div>
                        <h3>{exp.role}</h3>
                        <div className="company-location-row">
                          <span className="company-name">{exp.company}</span>
                          {exp.location && (
                            <span className="location-pill">
                              <LocationPinIcon />
                              <span>{exp.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="duration-badge">
                        {exp.duration}
                      </span>
                    </div>
                    {renderBulletList(exp.description)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CERTIFICATIONS SECTION */}
          <section id="certifications" className="section">
            <div className="section-header reveal">
              <div>
                <span className="eyebrow">Credentials</span>
                <h2>Certifications</h2>
              </div>
            </div>

            <div className="grid">
              {certifications.map((cert) => (
                <div key={cert.id} className="card cert-card reveal">
                  <div className="cert-badge-icon">&#10003;</div>
                  <div>
                    <h3>{cert.title}</h3>
                    <p className="cert-meta">
                      {cert.issuer} &bull; {cert.issue_date}
                    </p>
                    {cert.certificate_data ? (
                      <button
                        type="button"
                        className="cert-action-link"
                        onClick={() => setPreviewCert(cert)}
                      >
                        <ResumeIcon />
                        <span>View Certificate</span>
                      </button>
                    ) : cert.credential_url ? (
                      <a
                        href={formatExternalUrl(cert.credential_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="cert-action-link"
                      >
                        <ResumeIcon />
                        <span>View Certificate</span>
                        <ExternalLinkIcon />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CONTACT SECTION */}
          <section id="contact" className="section">
            <div className="contact-box reveal">
              <div className="contact-info">
                <span className="eyebrow">Let's Connect</span>
                <h2>Start a Conversation</h2>
                <p>
                  Have a project, role, or collaboration in mind? Drop a message here or reach out
                  directly on WhatsApp for a quick chat.
                </p>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="whatsapp-cta-btn"
                  >
                    <WhatsAppIcon />
                    <span>Chat on WhatsApp</span>
                    <ExternalLinkIcon />
                  </a>
                )}
              </div>

              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="input-row">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <textarea
                  rows="4"
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
                <button type="submit" className="btn-primary" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
                {contactNotice.text && (
                  <div className={`alert-banner ${contactNotice.type}`}>{contactNotice.text}</div>
                )}
              </form>
            </div>
          </section>
        </main>
      )}

      {/* ==================== VIEW-ONLY PROTECTED CERTIFICATE MODAL ==================== */}
      {previewCert && (
        <div
          className="modal-backdrop"
          onClick={() => setPreviewCert(null)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="modal-card cert-viewer-modal"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <button className="modal-close" onClick={() => setPreviewCert(null)}>
              &times;
            </button>
            <span className="eyebrow">{previewCert.issuer} &bull; {previewCert.issue_date}</span>
            <h3>{previewCert.title}</h3>

            <div className="cert-preview-frame protected-viewer" onContextMenu={(e) => e.preventDefault()}>
              <img
                src={previewCert.certificate_data}
                alt={previewCert.title}
                className="cert-preview-img"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
              <div className="viewer-shield" onContextMenu={(e) => e.preventDefault()}></div>
            </div>
            <p className="view-only-note">Verified Credential &bull; View-Only Mode</p>
          </div>
        </div>
      )}

      {/* SECURE ADMIN LOGIN MODAL */}
      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="modal-card login-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              &times;
            </button>
            <span className="eyebrow">Administrator Access</span>
            <h2>Sign In</h2>
            <p className="modal-desc">Enter your authorized credentials to continue.</p>
            <form onSubmit={handleLogin} className="form-stack" autoComplete="off">
              <div className="field-group">
                <label>Username</label>
                <input
                  type="text"
                  name="portfolio_admin_user"
                  autoComplete="off"
                  placeholder="Enter username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  autoFocus
                  required
                />
              </div>
              <div className="field-group">
                <label>Password</label>
                <input
                  type="password"
                  name="portfolio_admin_pass"
                  autoComplete="new-password"
                  placeholder="Enter password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              {loginError && <div className="alert-banner error">{loginError}</div>}
              <button type="submit" className="btn-primary full-btn" disabled={loginLoading}>
                {loginLoading ? 'Authenticating...' : 'Login to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT DETAIL POPUP MODAL */}
      {selectedProject && (
        <div className="modal-backdrop" onClick={() => setSelectedProject(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProject(null)}>
              &times;
            </button>
            <span className="eyebrow">Project Overview</span>
            <h2>{selectedProject.title}</h2>
            <p className="modal-desc">{selectedProject.description}</p>
            <div className="tech-tags">
              {selectedProject.tech_stack?.split(',').map((tech, idx) => (
                <span key={idx} className="tag">
                  {tech.trim()}
                </span>
              ))}
            </div>
            <div className="modal-actions">
              {selectedProject.github_url && (
                <a
                  href={formatExternalUrl(selectedProject.github_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary icon-btn-flex"
                >
                  <GitHubIcon />
                  <span>View Source Code</span>
                </a>
              )}
              {selectedProject.live_url && (
                <a
                  href={formatExternalUrl(selectedProject.live_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary icon-btn-flex"
                >
                  <span>Launch Live App</span>
                  <ExternalLinkIcon />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFESSIONAL FOOTER */}
      <footer className="footer">
        <div className="footer-dock">
          {siteSettings.github_url && (
            <a href={formatExternalUrl(siteSettings.github_url)} target="_blank" rel="noreferrer" className="footer-icon-link">
              <GitHubIcon />
              <span>GitHub</span>
            </a>
          )}
          {siteSettings.linkedin_url && (
            <a href={formatExternalUrl(siteSettings.linkedin_url)} target="_blank" rel="noreferrer" className="footer-icon-link">
              <LinkedInIcon />
              <span>LinkedIn</span>
            </a>
          )}
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="footer-icon-link">
              <WhatsAppIcon />
              <span>WhatsApp</span>
            </a>
          )}
          {resolvedResumeUrl && (
            <a href={resolvedResumeUrl} target="_blank" rel="noreferrer" className="footer-icon-link">
              <ResumeIcon />
              <span>Resume</span>
            </a>
          )}
        </div>
        <p>
          &copy; {new Date().getFullYear()} {siteSettings.first_name} {siteSettings.last_name} &bull; Built with FastAPI, PostgreSQL &amp; React
        </p>
      </footer>
    </div>
  );
}

export default App;