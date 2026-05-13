# 🏥 MediCare — Full-Stack Healthcare Platform

A comprehensive, production-ready healthcare web application with telemedicine, EHR, maternal health, disease management, and more.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### 1. Clone & Install

```bash
# Install all dependencies (both frontend & backend)
npm install          # installs concurrently at root
npm run install:all  # installs backend & frontend deps
```

### 2. Configure Environment

**Backend** — copy and edit:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare_db
JWT_SECRET=change_this_to_a_long_random_string
JWT_REFRESH_SECRET=change_this_to_another_long_random_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

**Frontend** — copy and edit:
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the App

```bash
# Run both servers simultaneously (from root)
npm run dev

# Or run individually:
npm run dev:backend   # Backend on http://localhost:5000
npm run dev:frontend  # Frontend on http://localhost:5173
```

---

## 📁 Project Structure

```
healthcare-app/
├── package.json                 # Root scripts (concurrently)
├── README.md
│
├── backend/
│   ├── server.js                # Express entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   ├── VitalSign.js
│   │   ├── Medication.js
│   │   ├── HealthRecord.js
│   │   ├── Workshop.js
│   │   ├── ScreeningEvent.js
│   │   └── EducationalContent.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── appointment.controller.js
│   │   ├── vital.controller.js
│   │   ├── medication.controller.js
│   │   ├── record.controller.js
│   │   ├── workshop.controller.js
│   │   ├── screening.controller.js
│   │   └── education.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── appointment.routes.js
│   │   ├── vital.routes.js
│   │   ├── medication.routes.js
│   │   ├── record.routes.js
│   │   ├── workshop.routes.js
│   │   ├── screening.routes.js
│   │   └── education.routes.js
│   └── middleware/
│       ├── auth.js              # JWT verification
│       └── role.js              # Role-based access
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx              # Routes & auth guards
        ├── styles/
        │   └── global.css
        ├── context/
        │   └── AuthContext.jsx  # Auth state & token management
        ├── lib/
        │   └── api.js           # Axios instance + all API calls
        ├── hooks/
        │   └── index.js         # useFetch, useForm
        └── pages/
            ├── auth/
            │   ├── LoginPage.jsx
            │   ├── RegisterPage.jsx
            │   └── Auth.module.css
            └── dashboard/
                ├── DashboardLayout.jsx  # Sidebar navigation
                ├── DashboardLayout.module.css
                ├── Overview.jsx         # Dashboard home
                ├── Overview.module.css
                └── modules/
                    ├── Module.module.css    # Shared styles
                    ├── Telemedicine.jsx
                    ├── DiseaseManagement.jsx
                    ├── MaternalHealth.jsx
                    ├── HealthScreening.jsx
                    ├── SymptomChecker.jsx   # AI-powered (Claude API)
                    ├── EHRSystem.jsx
                    ├── Rehabilitation.jsx
                    ├── WasteManagement.jsx
                    ├── HealthLiteracy.jsx   # Like/comment system
                    └── Profile.jsx
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public |
| GET  | `/api/auth/me` | Authenticated |
| POST | `/api/auth/logout` | Authenticated |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/users` | Admin |
| GET | `/api/users/doctors` | Authenticated |
| GET | `/api/users/:id` | Authenticated |
| PUT | `/api/users/:id` | Owner / Admin |

### Appointments
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/appointments` | Authenticated |
| GET  | `/api/appointments` | Authenticated (filtered by role) |
| GET  | `/api/appointments/:id` | Authenticated |
| PUT  | `/api/appointments/:id` | Authenticated |
| PATCH| `/api/appointments/:id/cancel` | Authenticated |

### Vitals, Medications, Records, Workshops, Screenings, Education
Full CRUD at `/api/vitals`, `/api/medications`, `/api/records`, `/api/workshops`, `/api/screenings`, `/api/education`

Special endpoints:
- `POST /api/workshops/:id/register` — Register for workshop
- `POST /api/workshops/:id/unregister` — Unregister
- `POST /api/screenings/:id/register` — Register for screening
- `POST /api/education/:id/like` — Toggle like
- `POST /api/education/:id/comments` — Add comment
- `DELETE /api/education/:id/comments/:commentId` — Delete comment

---

## 👥 Roles & Permissions

| Feature | Patient | Doctor | Admin |
|---------|---------|--------|-------|
| Book appointments | ✅ | ✅ | ✅ |
| Confirm/complete appts | ❌ | ✅ | ✅ |
| View own records | ✅ | ✅ | ✅ |
| Create health records | ✅ | ✅ | ✅ |
| Create workshops | ❌ | ✅ | ✅ |
| Create screenings | ❌ | ✅ | ✅ |
| Publish education | ❌ | ✅ | ✅ |
| Manage all users | ❌ | ❌ | ✅ |

---

## ✨ Features

- **🔐 JWT Auth** — Access + Refresh token rotation with auto-refresh interceptor
- **📹 Telemedicine** — Book, confirm, complete virtual/in-person appointments
- **🫀 Disease Management** — Medication tracking + vital signs monitoring
- **🤱 Maternal Health** — Antenatal visit records with gestational tracking
- **🔬 Health Screening** — Community events with registration system
- **🩺 Symptom Checker** — Claude AI-powered triage and recommendations
- **📋 EHR System** — Full electronic health records with summary view
- **🧘 Rehabilitation** — Workshop registration for recovery programs
- **♻️ Waste Management** — Medical waste categorisation and disposal guide
- **📚 Health Literacy** — Educational content with likes & comments
- **👤 Profile** — Editable user profile with role-specific fields

---

## 🛠 Tech Stack

**Frontend:** React 18, Vite, React Router v6, Axios, CSS Modules  
**Backend:** Node.js, Express, Mongoose, JWT (jsonwebtoken), bcryptjs  
**Database:** MongoDB  
**AI:** Anthropic Claude API (Symptom Checker)
