# System Architecture & Developer Guide

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (5173)                     │
│  - Components (Navbar, Cards, Forms)                         │
│  - Pages (Login, Dashboard, Knowledge Base)                  │
│  - Context API (Auth state management)                       │
│  - Axios (HTTP client with interceptors)                     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/JSON
                         ↓
┌─────────────────────────────────────────────────────────────┐
│               Express.js Backend (5000)                      │
│  - CORS middleware (allows frontend requests)               │
│  - JWT verification middleware                              │
│  - Role-based access control middleware                      │
│  - RESTful API routes & controllers                          │
└────────────────────────┬────────────────────────────────────┘
                         │ Mongoose Driver
                         ↓
┌─────────────────────────────────────────────────────────────┐
│             MongoDB Atlas (Cloud Database)                   │
│  - Collections: users, subjects, doubts                      │
│  - Indexes for fast queries                                  │
│  - Replication & backup (Atlas handles)                      │
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

### Frontend Components Hierarchy

```
App.jsx (Router setup)
├── Navbar.jsx (All pages)
└── Routes
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── StudentDashboard.jsx
    │   ├── DashboardStats.jsx
    │   ├── DoubtCard.jsx (reused)
    │   └── Link to PostDoubtPage
    ├── FacultyDashboard.jsx
    │   ├── DoubtCard.jsx (reused)
    │   └── AnswerForm.jsx
    ├── AdminDashboard.jsx
    │   └── DashboardStats.jsx
    ├── PostDoubtPage.jsx
    ├── KnowledgeBasePage.jsx
    │   ├── SearchBar.jsx
    │   └── DoubtCard.jsx (reused)
    └── 404 Not Found
```

### Backend Route Structure

```
Express Server
├── CORS Middleware (all requests)
├── JSON Parser Middleware (all requests)
├── Auth Routes (/api/auth)
│   ├── POST /register (public)
│   └── POST /login (public)
├── Doubt Routes (/api/doubts)
│   ├── POST / (protected: student)
│   ├── GET /my (protected: student)
│   ├── GET /open (protected: faculty)
│   ├── PUT /claim/:id (protected: faculty)
│   ├── PUT /answer/:id (protected: faculty)
│   ├── GET /knowledge-base (public)
│   ├── GET /all (protected: admin)
│   └── DELETE /:id (protected: admin)
├── Subject Routes (/api/subjects)
│   ├── GET / (public)
│   ├── POST / (protected: admin)
│   └── DELETE /:id (protected: admin)
├── User Routes (/api/users)
│   ├── GET / (protected: admin)
│   └── DELETE /:id (protected: admin)
└── Admin Routes (/api/admin)
    └── GET /stats (protected: admin)
```

## Data Models

### User Schema

```javascript
{
  _id: ObjectId (auto-generated),
  name: String,
  email: String (unique),
  password: String (hashed with bcryptjs),
  role: String (enum: 'student', 'faculty', 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

**Password Handling**:
- Hashed using bcryptjs with 10 salt rounds
- Never returned in API responses
- Compared during login using `matchPassword()` method

### Subject Schema

```javascript
{
  _id: ObjectId,
  subjectName: String (unique),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Doubt Schema

```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: User),
  subjectId: ObjectId (ref: Subject),
  title: String,
  description: String,
  status: String (enum: 'OPEN', 'CLAIMED', 'RESOLVED'),
  facultyId: ObjectId (ref: User, nullable),
  answer: String,
  createdAt: Date,
  updatedAt: Date,
  // Indexes
  _fullyIndexed: true // text index on title + description
}
```

**Status Lifecycle**:
```
┌──────────────────────────────────────────────────┐
│  Student posts doubt                              │
│  Status: OPEN                                     │
│  facultyId: null                                  │
│  answer: empty                                    │
└────────┬─────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────┐
│  Faculty claims doubt                             │
│  Status: CLAIMED                                  │
│  facultyId: assigned                              │
│  answer: empty                                    │
└────────┬─────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────┐
│  Faculty submits answer                           │
│  Status: RESOLVED                                 │
│  facultyId: assigned                              │
│  answer: filled                                   │
└──────────────────────────────────────────────────┘
```

## Authentication & Authorization Flow

### Login Flow

```
User enters credentials
        ↓
POST /api/auth/login {email, password}
        ↓
Backend verifies email exists in DB
        ↓
Backend compares password hash
        ↓
IF valid:
  - Generate JWT with {id, role}
  - Return {token, user}
  - Frontend stores in localStorage
ELSE:
  - Return 401 error
```

### Protected Request Flow

```
Frontend has token in localStorage
        ↓
User makes API request
        ↓
Axios interceptor adds:
  Authorization: `Bearer <token>`
        ↓
Backend receives request
        ↓
verifyToken middleware extracts token
        ↓
JWT.verify() checks token validity
        ↓
IF valid:
  - Decode token
  - Attach user to req.user
  - Next middleware/route
ELSE:
  - Return 401 Unauthorized
        ↓
Route handler checks req.user.role
        ↓
authorize() middleware enforces role
        ↓
IF role matches:
  - Execute route handler
ELSE:
  - Return 403 Forbidden
```

## File Organization & Patterns

### Adding a New Feature (Example: Comments on Doubts)

1. **Update Backend**:
   ```
   backend/models/Comment.js (new schema)
   backend/routes/comments.js (new routes)
   Add routes to server.js
   ```

2. **Update Frontend**:
   ```
   src/services/api.js (add API calls)
   src/components/CommentSection.jsx (new component)
   Add to relevant pages
   ```

### Naming Conventions

**Backend**:
- Files: `camelCase.js`
- Routes: `/api/pluralNouns` (e.g., `/api/doubts`)
- Methods: Verbs (POST=create, GET=read, PUT=update, DELETE=delete)
- Variables: `camelCase`

**Frontend**:
- Files: `PascalCase.jsx` (components), `camelCase.js` (utilities)
- Components: `PascalCase`
- Functions: `camelCase`
- Hooks: `useHookName`
- Constants: `SCREAMING_SNAKE_CASE`

### Error Handling Pattern

**Backend**:
```javascript
try {
  // Operation
  const result = await Model.findById(id);
  if (!result) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.json({ data: result });
} catch (error) {
  console.error('Operation error:', error);
  res.status(500).json({ message: 'Server error' });
}
```

**Frontend**:
```javascript
try {
  setLoading(true);
  setError('');
  const { data } = await apiCall();
  setState(data);
} catch (err) {
  setError(err.response?.data?.message || 'Error occurred');
} finally {
  setLoading(false);
}
```

## API Request/Response Examples

### Register User

**Request**:
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Post a Doubt

**Request**:
```
POST /api/doubts
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "subjectId": "507f191e810c19729de860ea",
  "title": "How to solve quadratic equations?",
  "description": "I'm struggling with the quadratic formula..."
}
```

**Response (201)**:
```json
{
  "message": "Doubt posted successfully",
  "doubt": {
    "_id": "507f1f77bcf86cd799439012",
    "studentId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "subjectId": {
      "_id": "507f191e810c19729de860ea",
      "subjectName": "Mathematics"
    },
    "title": "How to solve quadratic equations?",
    "description": "...",
    "status": "OPEN",
    "facultyId": null,
    "answer": "",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Deployment Considerations

### Environment Variables for Production

```env
# Backend (.env)
MONGODB_URI=mongodb+srv://user:pass@prod.mongodb.net/db
JWT_SECRET=your_very_strong_secret_key_123456789
PORT=5000
NODE_ENV=production

# Frontend (.env.production)
VITE_API_URL=https://api.yourdomain.com
```

### Database Indexes for Performance

```javascript
// MongoDB automatically creates:
// - Primary key on _id
// - Unique index on User.email
// - Unique index on Subject.subjectName
// - Text index on Doubt.title and Doubt.description

// To add manually in MongoDB Atlas:
db.doubts.createIndex({ "createdAt": -1 })
db.doubts.createIndex({ "status": 1 })
```

## Performance Optimization

### Frontend Optimization
- Components use React.memo() where applicable
- Debounced search in SearchBar (500ms)
- Lazy loading of routes possible with React.lazy()
- Tailwind CSS for production-ready styling

### Backend Optimization
- MongoDB text indexes on frequently searched fields
- JWT tokens valid for 7 days (reduces auth queries)
- CORS headers cached by browser
- No N+1 queries (using .populate())

## Testing Scenarios

### Happy Path: Student → Faculty → Resolution
1. Student registers
2. Student posts doubt
3. Faculty claims doubt
4. Faculty answers doubt
5. Student views answer in dashboard
6. User searches in knowledge base

### Error Scenarios
1. Invalid login credentials → 401
2. Faculty tries to answer unclaimed doubt → 403
3. Student tries to access admin panel → 403
4. MongoDB connection fails → 500
5. Missing required fields → 400

## Browser Developer Tools Tips

### Check Token in Console
```javascript
JSON.parse(localStorage.getItem('user'))
```

### Test API Calls
```javascript
// In console
const token = JSON.parse(localStorage.getItem('user')).token;
fetch('http://localhost:5000/api/doubts/my', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json()).then(d => console.log(d))
```

### Clear All Data
```javascript
localStorage.clear();
location.reload();
```

## Common Modifications

### Change API Timeout
Edit `src/services/api.js`:
```javascript
API.defaults.timeout = 10000; // 10 seconds
```

### Change Token Expiry
Edit `backend/routes/auth.js`:
```javascript
jwt.sign(data, secret, { expiresIn: '30d' }) // 30 days
```

### Add New Role
1. Add to User enum: `enum: ['student', 'faculty', 'admin', 'newRole']`
2. Add authorization middleware in routes
3. Add dashboard component for role
4. Add route in App.jsx

---

**Ready to build?** Start by reading code comments and experimenting with modifications!
