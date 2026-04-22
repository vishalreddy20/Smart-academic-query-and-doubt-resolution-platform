# Smart Academic Query & Doubt Resolution Platform
### with Team Members Management Module

A full-stack MERN application combining a Smart Academic Doubt Platform with a Team Management feature for college assignments.

---

## 🚀 Features

### Doubt Resolution Platform
- Student doubt posting with subject tagging
- Faculty/Tutor response system
- Admin dashboard with analytics
- JWT-based authentication with OTP email verification
- Subscription/payment integration

### Team Management Module (Assignment)
- Add team members with profile photo upload
- View all members in a responsive card grid
- Detailed member profile page
- RESTful API with file upload support

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router DOM, Axios, Tailwind CSS |
| Backend | Node.js, Express.js, Multer |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + bcryptjs |

---

## ⚙️ Installation

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
# Frontend dependencies (project root)
npm install

# Backend dependencies
cd backend
npm install
```

### 2. Configure Environment

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smartdoubts
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## ▶️ Running the App

Open **two terminals**:

```bash
# Terminal 1 — Backend (from project root)
cd backend
npm run dev
# → Server running on http://localhost:5000

# Terminal 2 — Frontend (from project root)
npm run dev
# → Vite dev server on http://localhost:5173
```

---

## 🌐 Application URLs

| URL | Page |
|-----|------|
| `http://localhost:5173/` | Landing / Dashboard |
| `http://localhost:5173/login` | Login |
| `http://localhost:5173/register` | Student Registration |
| `http://localhost:5173/student` | Student Dashboard |
| `http://localhost:5173/tutor` | Faculty Dashboard |
| `http://localhost:5173/admin` | Admin Dashboard |
| `http://localhost:5173/team` | **Team Home Page** |
| `http://localhost:5173/team/add` | **Add Member** |
| `http://localhost:5173/team/view` | **View All Members** |
| `http://localhost:5173/team/members/:id` | **Member Details** |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request OTP |

### Users / Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users (admin) |
| GET | `/api/admin/users/:id` | Get single user |

### Doubts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/doubts` | Post a new doubt |
| GET | `/api/doubts` | List doubts |
| GET | `/api/doubts/:id` | Get doubt details |

### Members (Team Assignment)
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/members` | Add a member (multipart/form-data) |
| **GET** | `/api/members` | Get all members |
| **GET** | `/api/members/:id` | Get single member |

### Uploads
| URL | Description |
|-----|-------------|
| `GET /uploads/<filename>` | Serve uploaded profile images |

---

## 📦 Member API – Request Body (POST /api/members)

Use `Content-Type: multipart/form-data`:

| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✅ |
| `rollNumber` | string | ✅ |
| `year` | string | ✅ |
| `degree` | string | ✅ |
| `aboutProject` | string | ✅ |
| `hobbies` | string (comma-sep) | ❌ |
| `certificate` | string | ❌ |
| `internship` | string | ❌ |
| `aboutYourAim` | string | ❌ |
| `image` | file (jpg/png/webp) | ❌ |

---

## 📂 Project Structure

```
project/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Subject.js
│   │   └── Member.js          ← NEW
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doubtRoutes.js
│   │   └── members.js         ← NEW
│   ├── uploads/               ← NEW (member photos)
│   └── server.js
└── src/
    ├── pages/
    │   ├── LandingPage.jsx
    │   ├── StudentDashboard.jsx
    │   ├── TeamHomePage.jsx    ← NEW
    │   ├── AddMemberPage.jsx   ← NEW
    │   ├── ViewMembersPage.jsx ← NEW
    │   └── MemberDetailsPage.jsx ← NEW
    └── App.jsx
```

---

## 👥 Team

**Team Innovators** — Smart Academic Query & Doubt Resolution Platform

---

## 📄 License

MIT
