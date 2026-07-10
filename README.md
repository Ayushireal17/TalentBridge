# TalentBridge — AI-Powered Career Platform

> Minimal · Playful · 3D · Interactive · Animated  
> Web3 / Technology / Startup design category

---

## Tech Stack
| Layer     | Technology |
|-----------|-----------|
| Frontend  | Next.js 14 App Router · React · Tailwind CSS · Bootstrap 5 · Three.js · Framer Motion |
| Backend   | Laravel 12 · PHP 8.2 · Sanctum Auth |
| AI        | Google Gemini 1.5 Flash |
| Email     | PHPMailer (SMTP / Gmail) |
| Database  | MySQL 8.x (port 3306) · XAMPP |

---

## Features
- 🔐 Role-based auth — Candidate / Recruiter / Admin (separate login)
- 🤖 BridgeAI Chatbot — career guidance powered by Gemini
- 📄 PDF + Image resume parser — instant AI summary & ATS score
- 🎯 AI job matching — % score per job
- ✉️  Cover letter generator — one click, any tone
- 🎤 Interview prep — AI questions + evaluation
- 💼 Recruiter tools — post jobs, rank candidates with AI
- 🏗️  Resume builder with PDF export
- 📧 Transactional emails via PHPMailer

---

## Quick Start

### 1 — Database
Open phpMyAdmin → create database: **talentbridge**

### 2 — Backend
```bash
cd backend
composer install
cp .env.example .env
# Edit .env — add DB_PASSWORD, GEMINI_API_KEY, MAIL_* settings
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan queue:table
php artisan migrate
php artisan storage:link
php artisan serve          # Terminal 1 → http://localhost:8000
php artisan queue:work --queue=ai   # Terminal 2
```

### 3 — Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local → NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev                # Terminal 3 → http://localhost:3000
```

---

## Default Credentials
| Role      | Email                       | Password       |
|-----------|-----------------------------|----------------|
| Admin     | admin@talentbridge.ai       | SecurePass123  |
| Candidate | (register via /auth/register) |               |
| Recruiter | (register via /auth/register?role=recruiter) | |

---

## Get Gemini API Key (Free)
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click **Create API Key**
4. Copy it into `backend/.env` → `GEMINI_API_KEY=`

---

## Gmail SMTP Setup
1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Create an App Password for "Mail"
4. Use your Gmail address as `MAIL_USERNAME` and the app password as `MAIL_PASSWORD`

---

## Project Structure
```
TalentBridge/
├── frontend/               # Next.js 14 App
│   ├── app/
│   │   ├── page.jsx        # Home page
│   │   ├── auth/           # Login · Register · Admin Login
│   │   ├── candidate/      # Dashboard · Resumes · Jobs · Interview · Cover Letters
│   │   ├── recruiter/      # Dashboard · Jobs · Applicants
│   │   └── admin/          # Dashboard · Users · Analytics
│   ├── components/
│   │   ├── layout/         # Navbar · Hero · Features · Footer
│   │   ├── chatbot/        # BridgeAIChatbot · ChatbotPreview
│   │   ├── resume/         # ResumeParserPreview
│   │   └── ui/             # TBLogo · ThreeCanvas
│   └── lib/                # api.js · auth.js
│
└── backend/                # Laravel 12 API
    ├── app/
    │   ├── Http/Controllers/
    │   │   ├── Auth/       # AuthController · PasswordResetController
    │   │   ├── AI/         # Chatbot · ResumeAnalysis · JobMatch · CoverLetter · InterviewPrep
    │   │   ├── Candidate/  # Resume · JobSearch · Application · SavedJob · Interview · ResumeBuilder
    │   │   ├── Recruiter/  # Job · Applicant
    │   │   └── Admin/      # User · Job · Analytics
    │   ├── Models/         # User · Job · Resume · Application · CoverLetter · etc.
    │   ├── Services/       # GeminiService · ResumeParserService · MailService
    │   └── Jobs/           # AnalyzeResume · GenerateInterviewQuestions · RankCandidates
    ├── database/
    │   ├── migrations/     # 10 clean migrations (no FK constraints)
    │   ├── factories/      # UserFactory · JobFactory
    │   └── seeders/        # DatabaseSeeder
    └── routes/api.php      # All API routes
```
