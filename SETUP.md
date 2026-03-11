# Complete MERN Stack Setup Guide

This guide provides step-by-step instructions to set up and run the Smart Academic Query & Doubt Resolution Platform.

## Prerequisites

Ensure you have:
- **Node.js** v14 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Git** (optional, for version control)

Verify installation:
```bash
node --version
npm --version
```

## Step 1: MongoDB Setup

### Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or login with your account
3. Create a new project
4. Build a database cluster (select free tier)
5. Choose a region closest to you
6. Wait for cluster to deploy (5-10 minutes)

### Get Connection String

1. Click "Connect" on your cluster
2. Select "Drivers" → "Node.js"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `myFirstDatabase` with `smart_doubt_db`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smart_doubt_db?retryWrites=true&w=majority
```

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies
```bash
npm install
```

This installs:
- express (web framework)
- mongoose (MongoDB driver)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- cors (cross-origin support)
- dotenv (environment variables)

### 2.3 Create Environment File
```bash
cp .env.example .env
```

### 2.4 Edit .env File

Open `backend/.env` and add:

```env
MONGODB_URI=mongodb+srv://yourname:yourpassword@cluster0.xxxxx.mongodb.net/smart_doubt_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_12345_change_in_production
PORT=5000
NODE_ENV=development
```

⚠️ **Important**:
- Replace `yourname` and `yourpassword` with MongoDB Atlas credentials
- Use a strong random string for JWT_SECRET
- Never commit `.env` to git

### 2.5 Start Backend Server
```bash
npm run dev
```

Expected output:
```
✓ MongoDB connected successfully
✓ Server running on port 5000
```

**Keep this terminal open!** Backend must run while using the app.

### 2.6 Verify Backend

Open new terminal and run:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status":"Backend running"}
```

## Step 3: Frontend Setup

### 3.1 Navigate to Project Root
```bash
cd ..
```
(Go back to project root if you're in backend directory)

### 3.2 Install Dependencies
```bash
npm install
```

This installs:
- react & react-dom (UI library)
- react-router-dom (routing)
- axios (HTTP client)
- tailwindcss (styling)
- lucide-react (icons)

### 3.3 Start Frontend Server

**In a new terminal** (keep backend running), run:
```bash
npm run dev
```

Expected output:
```
  Local:   http://localhost:5173/
```

### 3.4 Access Application

Open browser and go to: **http://localhost:5173**

You should see the Smart Doubts platform homepage.

## Step 4: Create Test Data

### 4.1 Register Users

1. Click **Register**
2. Create first user:
   - Name: `Test Student`
   - Email: `student@test.com`
   - Password: `password123`
   - Role: **Student**
   - Click Register

3. Login with this student account
4. Go back and register second user:
   - Name: `Test Faculty`
   - Email: `faculty@test.com`
   - Password: `password123`
   - Role: **Faculty**

5. Create admin account manually:
   - Open MongoDB Atlas
   - Go to Collections
   - Click "Insert Document"
   - Add user with role: `admin`

Or use the provided test credentials after registration.

### 4.2 Create Subjects (As Admin)

1. Login as admin
2. Go to Admin Dashboard
3. Click "Subjects" tab
4. Add subjects:
   - Mathematics
   - Physics
   - Chemistry
   - Computer Science

## Step 5: Test Application Flow

### Test Student Workflow

1. **Login**: Use student@test.com / password123
2. **Post Doubt**: Click "Post New Doubt"
   - Select subject: Mathematics
   - Title: "How to solve quadratic equations?"
   - Description: "I'm having trouble understanding the quadratic formula..."
   - Click "Post Doubt"
3. **View Dashboard**: See your posted doubt
4. **Status**: Doubt should show as "OPEN"

### Test Faculty Workflow

1. **Login**: Logout and login as faculty@test.com / password123
2. **View Open Doubts**: Dashboard shows student's doubt
3. **Claim Doubt**: Click "Claim & Answer"
4. **Provide Answer**: Enter detailed answer about quadratic equations
5. **Submit**: Click "Submit Answer"
6. **Status**: Doubt status changes to "RESOLVED"

### Test Student Feedback

1. **Logout**: Logout faculty account
2. **Login**: Login back as student
3. **View Answer**: Your doubt now shows "RESOLVED" with faculty's answer
4. **Expand**: Click "View Answer" to see complete response

### Test Knowledge Base

1. **Public Access**: Click "Knowledge Base" (no login required!)
2. **Search**: Search for "quadratic"
3. **View Results**: See resolved doubt with answer
4. **Test Accessibility**: Logout and try again - still accessible!

## Step 6: Understanding File Structure

```
project/
├── backend/                 ← Backend server files
│   ├── models/             ← Database schemas
│   │   ├── User.js
│   │   ├── Subject.js
│   │   └── Doubt.js
│   ├── routes/             ← API endpoints
│   │   ├── auth.js         → /api/auth/login, /api/auth/register
│   │   ├── doubts.js       → /api/doubts/*
│   │   ├── subjects.js     → /api/subjects/*
│   │   ├── users.js        → /api/users/*
│   │   └── admin.js        → /api/admin/stats
│   ├── middleware/         ← Authentication & Authorization
│   │   └── auth.js         → JWT verification, Role checking
│   ├── server.js           ← Main server file
│   ├── package.json        ← Dependencies
│   └── .env                ← Configuration (create this!)
│
├── src/                    ← Frontend source code
│   ├── contexts/           ← Global state
│   │   └── AuthContext.jsx → User authentication state
│   ├── services/           ← API calls
│   │   └── api.js          → Axios configuration
│   ├── components/         ← Reusable components
│   │   ├── Navbar.jsx
│   │   ├── DoubtCard.jsx
│   │   ├── AnswerForm.jsx
│   │   ├── SearchBar.jsx
│   │   └── DashboardStats.jsx
│   ├── pages/              ← Full page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── FacultyDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── PostDoubtPage.jsx
│   │   └── KnowledgeBasePage.jsx
│   ├── App.jsx             ← Main app with routing
│   ├── main.jsx            ← Entry point
│   └── index.css           ← Global styles
│
├── package.json            ← Frontend dependencies
├── README.md               ← Project documentation
└── SETUP.md                ← This file!
```

## Common Issues & Solutions

### Issue: "MongoDB connection error"
**Solution**:
- Check connection string in .env
- Ensure IP is whitelisted in MongoDB Atlas (0.0.0.0/0 for development)
- Verify password has no special characters (or URL-encode them)

### Issue: "CORS error" in browser
**Solution**:
- Ensure backend is running on port 5000
- Check CORS configuration in backend/server.js
- Verify frontend is on localhost:5173

### Issue: "Cannot find module 'mongoose'"
**Solution**:
```bash
cd backend
npm install mongoose
```

### Issue: Port 5000 already in use
**Solution**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process (Mac/Linux)
kill -9 <PID>
```

### Issue: API calls return 401 Unauthorized
**Solution**:
- Clear localStorage: Open console → `localStorage.clear()` → refresh
- Re-login to get new token
- Check JWT_SECRET is same in .env

## Next Steps

1. **Explore the code**: Open files to understand structure
2. **Modify styling**: Edit Tailwind classes in components
3. **Add features**: Read code patterns and extend functionality
4. **Deploy**: Follow production deployment guide

## Useful Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server
```

### Frontend
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Architecture Overview

```
User Browser (React)
        ↓
    Axios API Call
        ↓
Express Backend (Port 5000)
        ↓
JWT Verification & RBAC Middleware
        ↓
Route Handler (Controller Logic)
        ↓
Mongoose Model (Database Schema)
        ↓
MongoDB Atlas (Cloud Database)
```

### Data Flow Example: Student Posts Doubt

1. **User clicks "Post Doubt"** → StudentDashboard.jsx
2. **Form submission** → calls `postDoubt()` from api.js
3. **Axios adds JWT token** → Authorization header
4. **Express receives request** → /api/doubts (POST)
5. **Middleware verifies JWT** → checks if student role
6. **Controller processes** → creates new Doubt document
7. **Mongoose saves to MongoDB** → doubt stored
8. **Response returned** → frontend shows success message
9. **Student sees doubt** → in dashboard with OPEN status

## Performance Tips

- Backend uses MongoDB indexes for fast searches
- Frontend uses React hooks for efficient re-renders
- JWT tokens expire in 7 days (configurable)
- Text search on title/description for knowledge base

## Security Checklist

- ✓ Passwords hashed with bcryptjs (10 salt rounds)
- ✓ JWT tokens for stateless authentication
- ✓ Role-based access control on all protected routes
- ✓ CORS enabled only for frontend origin
- ✓ Input validation on client and server
- ✓ MongoDB injection prevention via Mongoose

## Contact & Support

For issues:
1. Check MongoDB connection
2. Verify all services are running (backend on 5000, frontend on 5173)
3. Clear browser cache and localStorage
4. Check console for detailed error messages

---

**You're all set!** Start exploring the Smart Academic Query & Doubt Resolution Platform.
