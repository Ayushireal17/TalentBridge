# 🌉 TalentBridge AI-Powered Career Platform

> **An intelligent recruitment platform that connects candidates and recruiters through AI-powered career assistance, resume analysis, job matching, and hiring workflows.**

<p align="center">
  Built with <b>Next.js</b>, <b>Laravel</b>, <b>Google Gemini AI</b>, <b>Three.js</b>, and <b>MySQL</b>.
</p>

---

# ✨ Overview

TalentBridge is an AI-powered recruitment platform designed to simplify the hiring journey for both candidates and recruiters.

Candidates can build professional resumes, analyze ATS compatibility, prepare for interviews, generate AI-powered cover letters, and discover jobs tailored to their skills.

Recruiters can post job openings, manage applicants, and leverage AI to identify the most suitable candidates efficiently.

---

# 🚀 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 14 • React • Tailwind CSS • Bootstrap 5 • Three.js • Framer Motion |
| **Backend** | Laravel 12 • PHP 8.2 • Laravel Sanctum |
| **AI** | Google Gemini 1.5 Flash |
| **Database** | MySQL 8.x |
| **Email** | PHPMailer (SMTP / Gmail) |
| **Development** | XAMPP • Composer • npm |

---

# ✨ Features

## 👨‍💼 Candidate

- 🤖 AI Career Assistant (BridgeAI)
- 📄 Resume Builder with PDF Export
- 📊 AI Resume Analysis & ATS Score
- 🎯 Smart AI Job Matching
- ✉️ AI Cover Letter Generator
- 🎤 AI Interview Preparation
- 💾 Save Jobs
- 📨 Apply for Jobs
- 👤 Profile Management

---

## 🏢 Recruiter

- 📢 Create & Manage Job Listings
- 🤖 AI Candidate Ranking
- 📂 Applicant Management
- 📄 Resume Review
- 📈 Recruiter Dashboard

---

## 🛡️ Admin

- 👥 User Management
- 💼 Job Management
- 📊 Analytics Dashboard
- ⚙️ Platform Monitoring

---

## 🧠 AI Modules

- Resume Parser (PDF & Image)
- ATS Compatibility Analysis
- Personalized Job Recommendations
- AI Career Chatbot
- AI Cover Letter Generation
- AI Interview Question Generation
- AI Candidate Ranking

---

# 📁 Project Structure

```text
TalentBridge/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
│
├── backend/
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   └── config/
│
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/TalentBridge.git

cd TalentBridge
```

---

## 2️⃣ Backend Setup

```bash
cd backend

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate --seed

php artisan storage:link

php artisan serve
```

Start the queue worker in another terminal:

```bash
php artisan queue:work --queue=ai
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend

npm install

cp .env.local.example .env.local

npm run dev
```

---

# 🔑 Environment Variables

## Backend (`backend/.env`)

```env
APP_NAME=TalentBridge

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=talentbridge
DB_USERNAME=root
DB_PASSWORD=

GEMINI_API_KEY=

MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
```

---

## Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

# 👥 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@talentbridge.ai | SecurePass123 |
| **Candidate** | Register a new account | — |
| **Recruiter** | Register as Recruiter | — |

---

# 🔑 Get a Gemini API Key

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account.
3. Click **Create API Key**.
4. Copy the generated key.
5. Add it to your backend `.env` file:

```env
GEMINI_API_KEY=YOUR_API_KEY
```

---

# 📧 Gmail SMTP Setup

1. Enable **2-Step Verification** on your Google account.
2. Open **Google Account → Security → App Passwords**.
3. Generate an App Password for **Mail**.
4. Configure your `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
```

---

# 🛣️ Roadmap

- [x] Authentication System
- [x] Resume Builder
- [x] Resume Parser
- [x] ATS Analysis
- [x] AI Job Matching
- [x] AI Career Chatbot
- [x] Cover Letter Generator
- [x] Interview Preparation
- [x] Recruiter Dashboard
- [ ] Real-time Chat
- [ ] Video Interviews
- [ ] Resume Version History
- [ ] Multi-language Support

---

# 💙 Acknowledgements

- Google Gemini AI
- Laravel
- Next.js
- React
- Three.js
- Tailwind CSS
- Framer Motion

---

<p align="center">
Made with ❤️ to bridge the gap between talent and opportunity by Ayushi Chowdhury
</p>
