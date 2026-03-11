# Deployment & Setup Checklist

## Project Summary
**Smart Academic Query and Doubt Resolution Platform** - A full-stack MERN application for academic collaboration.

**Tech Stack:**
- Frontend: React 19 + Vite + TypeScript + Tailwind CSS + React Router
- Backend: Express.js + MongoDB + Mongoose + JWT Auth
- Database: MongoDB (local: localhost:27017)
- Node.js: v22.15+, npm 10+

---

## Development Environment Setup

### Prerequisites
- Node.js 22.15+ installed
- MongoDB running locally on `localhost:27017`
- Git installed and configured

### Local Development Setup

1. **Install Frontend Dependencies**
   ```bash
   cd c:\Users\reddy\Downloads\mern1\project
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   # backend/.env (already configured)
   MONGODB_URI=mongodb://localhost:27017/academic-doubt-db
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRY=7d
   FRONTEND_URL=http://localhost:5175
   ADMIN_SECRET_CODE=ADMIN123
   # Email configuration (optional, uses nodemailer)
   # Payment configuration (optional, uses Razorpay)
   ```

4. **Start Backend Server** (from `backend/` directory)
   ```bash
   npm run dev
   # OR
   node server.js
   # Runs on localhost:5000
   ```

5. **Start Frontend Dev Server** (from `project/` directory)
   ```bash
   npm run dev
   # Runs on localhost:5173, 5174, 5175... (auto-increments on port conflicts)
   ```

6. **Access Application**
   - Frontend: http://localhost:5173 (or assigned port)
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

---

## Core API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (requires name, email, password, role)
- `POST /api/auth/login` - User login (email, password)
- `POST /api/auth/verify-otp` - Verify OTP for email confirmation
- `POST /api/auth/resend-otp` - Resend OTP to email
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token

### Subjects
- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Create subject (admin only)
- `PUT /api/subjects/:id` - Update subject (admin only)
- `DELETE /api/subjects/:id` - Delete subject (admin only)

### Doubts (Questions)
- `GET /api/doubts` - Get user's doubts
- `POST /api/doubts` - Post a new doubt
- `GET /api/doubts/:id` - Get doubt details
- `PUT /api/doubts/:id` - Update doubt
- `DELETE /api/doubts/:id` - Delete doubt
- `POST /api/doubts/:id/claim` - Claim doubt as tutor/admin
- `POST /api/doubts/:id/resolve` - Mark doubt as resolved

### Admin Management
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - List all users
- `POST /api/admin/doubts/:id/approve` - Approve doubt
- `POST /api/admin/doubts/:id/reject` - Reject doubt
- `PUT /api/admin/users/:id` - Update user role/status

---

## Building for Production

### Frontend Production Build
```bash
# From project root
npm run build
# Output: dist/ directory with optimized files
# Size: ~270 KB (gzipped: ~81 KB)
```

### Backend Configuration
Update `backend/.env` for production:
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=production_secret_key_at_least_32_chars
JWT_EXPIRY=7d
ADMIN_SECRET_CODE=strong_admin_code
NODE_ENV=production
```

---

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel)**
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy automatically on main branch push

**Backend (Railway or Render)**
1. Connect GitHub repo
2. Set start command: `cd backend && npm start`
3. Configure MongoDB atlas connection
4. Set environment variables

### Option 2: Docker Containerization

**Create Dockerfile (root)**
```dockerfile
FROM node:22-alpine
WORKDIR /app

# Install backend deps and build frontend
COPY package*.json ./
RUN npm install
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Build frontend
RUN npm run build

# Start both services
CMD ["sh", "-c", "cd backend && node server.js"]
```

**Deploy with Docker:**
```bash
docker build -t academic-doubt-platform .
docker run -p 5000:5000 --env-file .env academic-doubt-platform
```

### Option 3: Traditional Server (AWS EC2, DigitalOcean, etc.)

1. **SSH into server and clone repo**
   ```bash
   git clone https://github.com/yourusername/repo.git
   cd repo
   ```

2. **Install dependencies and build**
   ```bash
   npm install
   cd backend && npm install && cd ..
   npm run build
   ```

3. **Install PM2 for process management**
   ```bash
   npm install -g pm2
   ```

4. **Start with PM2**
   ```bash
   pm2 start "cd backend && node server.js" --name academic-backend
   pm2 start "npm run dev" --name academic-frontend
   pm2 save
   ```

5. **Configure reverse proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location /api {
           proxy_pass http://localhost:5000;
       }
       
       location / {
           proxy_pass http://localhost:5173;
       }
   }
   ```

---

## Pre-Deployment Testing Checklist

### Frontend Testing
- [ ] Build completes without errors (`npm run build`)
- [ ] No TypeScript/ESLint errors (`get_errors` returns 0)
- [ ] All routes load correctly
- [ ] Login/registration flow works
- [ ] OTP verification is functional
- [ ] Password reset pages accessible
- [ ] Dashboard renders for all user roles
- [ ] Responsive design works on mobile

### Backend Testing
- [ ] Health endpoint responds (`GET /api/health`)
- [ ] Subjects load from database
- [ ] User registration successful
- [ ] OTP email service configured
- [ ] JWT token generation works
- [ ] Protected routes reject invalid tokens
- [ ] Admin endpoints require authorization
- [ ] Error handling returns proper status codes

### Integration Testing
- [ ] Frontend connects to backend API
- [ ] CORS headers allow frontend origin
- [ ] Session persistence in localStorage works
- [ ] Role-based routing prevents unauthorized access
- [ ] API contracts match frontend expectations

### Database Verification
- [ ] MongoDB is running and connected
- [ ] Subjects collection has 8+ documents
- [ ] Admin user is pre-seeded
- [ ] User registration creates documents correctly
- [ ] Doubts CRUD operations work

---

## Current Status Summary

### ✅ Completed
- [x] Frontend build passing (1542 modules, 269.92 KB)
- [x] Backend server running (MongoDB connected)
- [x] API endpoints validated (health, subjects, register)
- [x] Authentication flow implemented
- [x] Password reset pages added
- [x] CORS configured for local development
- [x] Git repository clean and synced to GitHub
- [x] All 8 subjects seeded in database
- [x] Role-based dashboard routing implemented

### ⚠️ Partially Complete
- [ ] Full E2E browser testing (manual testing recommended)
- [ ] Email service live configuration (currently stubs)
- [ ] Razorpay payment integration (keys are placeholders)
- [ ] OTP inline verification (requires minor UX tweak)

### 📋 Not Yet Started
- [ ] SSL/HTTPS certificate setup
- [ ] CI/CD pipeline configuration
- [ ] Load testing and performance optimization
- [ ] Mobile app development (future phase)

---

## Running Both Services Simultaneously

### Windows PowerShell (Two Terminals)

**Terminal 1 - Backend**
```powershell
cd c:\Users\reddy\Downloads\mern1\project\backend
npm run dev
# Listens on http://localhost:5000
```

**Terminal 2 - Frontend**
```powershell
cd c:\Users\reddy\Downloads\mern1\project
npm run dev
# Listens on http://localhost:5173+
```

### Linux/Mac (Single Terminal with Background Jobs)
```bash
cd project
npm install
cd backend && npm install && cd ..

# Terminal 1
npm run dev &

# Terminal 2
cd backend && npm run dev &

# Bring to foreground if needed
fg %1  # or fg %2
```

---

## Environment Variables Reference

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/academic-doubt-db
JWT_SECRET=supersecretjwtkey123
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:5175
ADMIN_SECRET_CODE=ADMIN123
NODE_ENV=development

# Email (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Razorpay (optional)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

## Troubleshooting

### MongoDB Connection Issues
```powershell
# Check if MongoDB is running
mongosh --eval "db.version()"

# If not running, start MongoDB
# Windows: mongod (via MongoDB installer)
# Mac: brew services start mongodb-community
```

### Port Already in Use
```powershell
# Kill process on port 5000
Get-NetTCPConnection -LocalPort 5000 -State Listen | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# Kill process on port 5173
taskkill /PID <pid> /F
```

### Build Failures
```bash
# Clear cache and reinstall
rm -r node_modules
npm install && npm run build
```

### CORS Errors
Verify `FRONTEND_URL` in `.env` matches your frontend origin.

---

## Next Steps for Production

1. **Test in production environment** - Use staging server first
2. **Configure email service** - Set up Gmail/SendGrid credentials
3. **Set up payment gateway** - Add Razorpay production keys
4. **Enable HTTPS/SSL** - Use Let's Encrypt for free certificates
5. **Set up CI/CD** - GitHub Actions or GitLab CI
6. **Monitor and logs** - Use services like Sentry or LogRocket
7. **Database backups** - Configure MongoDB Atlas automated backups

---

## Quick Links
- GitHub: https://github.com/vishalreddy20/Smart-academic-query-and-doubt-resolution-platform
- Documentation: See ARCHITECTURE.md, README.md
- API Testing: Use Postman or curl
- Database: MongoDB Compass for GUI access

---

**Last Updated:** March 11, 2026
**Version:** 1.0.0
**Status:** Ready for Deployment
