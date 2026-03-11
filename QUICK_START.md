# Quick Start Guide (5 Minutes)

Get the Smart Doubt Platform running in minutes!

## What You Need
- Node.js installed
- MongoDB Atlas account (free tier available)
- Terminal/Command prompt

## Step 1: MongoDB Connection String (2 min)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster → Select free tier → Wait to deploy
3. Click "Connect" → "Drivers" → Copy connection string
4. Copy: `mongodb+srv://username:password@cluster.mongodb.net/smart_doubt_db?retryWrites=true&w=majority`

## Step 2: Backend (.env File) (1 min)

1. Open `backend/.env` (create from `.env.example` if needed)
2. Paste your MongoDB URI
3. Add: `JWT_SECRET=mysecretkey123456`
4. Save!

```env
MONGODB_URI=your_mongodb_string_here
JWT_SECRET=mysecretkey123456
PORT=5000
NODE_ENV=development
```

## Step 3: Start Backend (1 min)

```bash
cd backend
npm install
npm run dev
```

See `✓ MongoDB connected` and `✓ Server running on port 5000`?
**Success!** Keep this running.

## Step 4: Start Frontend (1 min)

```bash
# New terminal, go back to project root
cd ..
npm install
npm run dev
```

See `Local: http://localhost:5173`?
**Open it in browser!**

## Step 5: Test It

### Register
- Click "Register"
- Email: `test@example.com`
- Password: `test123`
- Role: Student
- Submit

### Post a Doubt
- You're now logged in
- Click "Post New Doubt"
- Pick a subject (create one in admin panel first if needed)
- Add title & description
- Submit

### Try Knowledge Base
- Click "Knowledge Base" in navbar
- No login needed!

---

## Troubleshooting (30 seconds)

| Problem | Fix |
|---------|-----|
| `Cannot connect to MongoDB` | Check connection string in .env |
| `CORS error` | Backend must run on 5000 |
| `Port already in use` | Change PORT in .env to 5001 |
| `Blank page` | Check browser console (F12) for errors |
| `Module not found` | Run `npm install` in that directory |

---

## Next: Full Setup

Read `SETUP.md` for complete instructions with:
- Role-based workflows
- Admin dashboard
- Faculty answering system
- Advanced features

---

**Ready?** Start the backend and frontend now!
