# MERN Project Complete Setup Checklist

## ✅ Phase 1: Environment Configuration (DONE)

### API Key & Security
- [x] Stitch MCP API key moved to environment variable: `STITCH_API_KEY`
- [x] MCP config file created: `.vscode/mcp-stitch-config.json`
- ⚠️ **ACTION REQUIRED**: Rotate your exposed API key in Google Cloud Console immediately

### Environment Files
- [x] Frontend `.env` configured:
  ```
  VITE_API_URL=http://localhost:5000/api
  ```
- [x] Backend `.env` configured with placeholders:
  ```
  PORT=5000
  NODE_ENV=development
  MONGODB_URI=mongodb://localhost:27017/tutorify_db
  JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345!@#$%
  JWT_EXPIRE=7d
  ```

---

## ✅ Phase 2: Dependencies (VERIFIED)

### Backend Packages ✓
- express, mongoose, cors, bcryptjs, jsonwebtoken, dotenv
- express-validator, helmet, morgan, multer
- nodemailer, razorpay, aws-sdk, nodemon

### Frontend Packages ✓
- react 18.3, react-dom, react-router-dom
- axios, tailwindcss, vite
- framer-motion, lucide-react, @tsparticles

---

## 📋 Phase 3: Pre-Launch Checklist

### Database
- [ ] MongoDB connection string set in backend/.env
- [ ] Choose: Local MongoDB or MongoDB Atlas cloud
- [ ] Test connection: Run backend in dev mode and check logs

### Backend Startup
```bash
cd backend
npm install  # if needed
npm start    # or npm run dev with nodemon
```
Expected: Server running on http://localhost:5000

### Frontend Startup
```bash
npm install  # if needed
npm run dev
```
Expected: Vite dev server on http://localhost:5173

### Authentication Test
1. Register new user (student role)
2. Login with credentials
3. Check localStorage for JWT token
4. Post a doubt
5. Verify API calls in Network tab

---

## 🔐 Phase 4: Security Before Production

### Critical Updates Needed
- [ ] Change JWT_SECRET to a strong, random value
- [ ] Update MongoDB URI to production cluster
- [ ] Set NODE_ENV=production
- [ ] Configure CORS to production domain only
- [ ] Set email service credentials (Nodemailer)
- [ ] Enable HTTPS in production
- [ ] Rotate all API keys (Stitch, Razorpay, AWS, etc.)

### Backend Security Headers
- [x] Helmet.js configured (check server.js)
- [x] CORS configured (check server.js)
- [x] Rate limiting available (check middleware)
- [x] Input sanitization available

---

## 🚀 Phase 5: Ready to Build UI with Stitch

Use the **Premium Stitch AI Prompt** provided earlier to generate:
1. Landing page
2. Login/Register pages
3. Student, Faculty, Admin dashboards
4. Post doubt, Search, Admin management pages

**MCP Server Ready**: Stitch MCP is now safely configured via environment variable.

---

## 📦 Deployment Checklist (Future)

- [ ] Build frontend: `npm run build:full`
- [ ] Output in `/dist` folder
- [ ] Deploy to Vercel/Netlify (frontend)
- [ ] Deploy to Railway/Render/Heroku (backend)
- [ ] Update VITE_API_URL to production API endpoint
- [ ] Enable HTTPS everywhere
- [ ] Set up monitoring/logging
- [ ] Backup MongoDB regularly

---

## 🔗 Quick Commands

```bash
# Frontend dev
npm run dev

# Frontend build
npm run build

# Backend dev (with nodemon)
cd backend && npm start

# Kill all node processes
taskkill /IM node.exe /F

# Check ports in use
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

---

## 📞 Troubleshooting

**Frontend won't connect to backend:**
- Check VITE_API_URL in .env
- Verify backend is running on :5000
- Check CORS configuration in backend/server.js

**MongoDB connection failed:**
- Verify MongoDB URI in backend/.env
- Ensure MongoDB service running (local) or Atlas cluster accessible
- Check firewall/IP whitelist (Atlas)

**JWT token errors:**
- Clear localStorage: DevTools Console → `localStorage.clear()`
- Re-login
- Verify JWT_SECRET matches between registration and login

**API 403 Forbidden:**
- Check user role matches route requirements
- Verify token is valid and not expired
- Check middleware authorization in routes

---

**Status**: All necessary setup complete. Ready to generate UI designs with Stitch MCP.
