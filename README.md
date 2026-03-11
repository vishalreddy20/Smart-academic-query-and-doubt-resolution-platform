# Smart Academic Query & Doubt Resolution Platform

A comprehensive full-stack MERN application for managing academic doubts and questions. Students post doubts, faculty members answer them, and admins oversee the entire system.

## Tech Stack

- **Frontend**: React 18, React Router DOM, Axios, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Architecture**: RESTful API with role-based access control
- **Database**: MongoDB (Atlas recommended)

## Features

### Student Role
- Create and post academic doubts with title and detailed description
- View personal doubt history with status tracking
- Search and browse resolved doubts in the Knowledge Base
- See faculty answers once their doubt is resolved
- Real-time status updates (OPEN → CLAIMED → RESOLVED)

### Faculty Role
- View all open doubts available to answer
- Claim doubts to work on them
- Provide detailed answers to claimed doubts
- Track answered doubts
- See student questions and context

### Admin Role
- Dashboard with comprehensive statistics
- User management (view all users, delete users)
- Doubt management (view all doubts, delete doubts)
- Subject management (create, view, delete subjects)
- Monitor platform activity and engagement

### Public Features
- Knowledge Base accessible without login
- Search resolved doubts by keywords
- View previously answered questions

## Project Structure

```
project/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema with bcrypt password hashing
│   │   ├── Subject.js         # Subject schema
│   │   └── Doubt.js           # Doubt schema with text indexing
│   ├── routes/
│   │   ├── auth.js            # Login/Register endpoints
│   │   ├── doubts.js          # Doubt CRUD operations
│   │   ├── subjects.js        # Subject management
│   │   ├── users.js           # User management (admin)
│   │   └── admin.js           # Admin statistics
│   ├── middleware/
│   │   └── auth.js            # JWT verification & RBAC
│   ├── server.js              # Express server configuration
│   ├── package.json
│   └── .env.example
└── src/
    ├── contexts/
    │   └── AuthContext.jsx    # Global auth state management
    ├── services/
    │   └── api.js             # Axios API client with interceptors
    ├── components/
    │   ├── Navbar.jsx         # Navigation with role-based links
    │   ├── DoubtCard.jsx      # Reusable doubt display component
    │   ├── AnswerForm.jsx     # Faculty answer submission
    │   ├── SearchBar.jsx      # Debounced search input
    │   └── DashboardStats.jsx # Statistics display
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── StudentDashboard.jsx
    │   ├── FacultyDashboard.jsx
    │   ├── AdminDashboard.jsx
    │   ├── PostDoubtPage.jsx
    │   └── KnowledgeBasePage.jsx
    ├── App.jsx
    ├── main.jsx
    └── index.css
```

## Setup Instructions

### Prerequisites
- Node.js (v14+) and npm installed
- MongoDB (local or Atlas account)
- Git

### Backend Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure .env file**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_doubt_db?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_key_change_in_production
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_SECURE=true
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-gmail-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

   Gmail setup notes:
   1. Turn on 2-Step Verification for the Gmail account.
   2. Generate an App Password from Google Account settings.
   3. Use that App Password in `EMAIL_PASSWORD`.
   4. Keep `EMAIL_FROM` equal to the Gmail address unless you have a verified alias.

4. **Start the backend server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to project root and install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Verify Setup

1. Open `http://localhost:5173` in browser
2. Check backend is running: `http://localhost:5000/api/health`
3. Verify MongoDB connection in backend console

## Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| JWT_SECRET | Secret key for JWT signing | `your_secret_key_here` |
| PORT | Backend server port | `5000` |
| FRONTEND_URL | Frontend origin for reset links and CORS | `http://localhost:5173` |
| NODE_ENV | Environment mode | `development` or `production` |
| EMAIL_SERVICE | Mail provider shortcut | `gmail` |
| EMAIL_HOST | SMTP host | `smtp.gmail.com` |
| EMAIL_PORT | SMTP port | `465` |
| EMAIL_SECURE | Use TLS/SSL transport | `true` |
| EMAIL_USER | Sender Gmail account | `your-email@gmail.com` |
| EMAIL_PASSWORD | Gmail App Password | `abcd efgh ijkl mnop` |
| EMAIL_FROM | Visible sender email | `your-email@gmail.com` |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Doubts (Student)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/doubts` | Student | Create new doubt |
| GET | `/api/doubts/my` | Student | Get student's doubts |

### Doubts (Faculty)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/doubts/open` | Faculty | Get open doubts |
| PUT | `/api/doubts/claim/:id` | Faculty | Claim a doubt |
| PUT | `/api/doubts/answer/:id` | Faculty | Submit answer |

### Doubts (Public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/doubts/knowledge-base` | None | Search resolved doubts |

### Doubts (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/doubts/all` | Admin | Get all doubts |
| DELETE | `/api/doubts/:id` | Admin | Delete doubt |

### Subjects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/subjects` | None | Get all subjects |
| POST | `/api/subjects` | Admin | Create subject |
| DELETE | `/api/subjects/:id` | Admin | Delete subject |

### Users (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | Get all users |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Get platform statistics |

## Test Credentials

After registration, use these test accounts:

### Student Account
- **Email**: student@example.com
- **Password**: student123
- **Role**: Student

### Faculty Account
- **Email**: faculty@example.com
- **Password**: faculty123
- **Role**: Faculty

### Admin Account
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Admin

## Workflow Example

1. **Register**: Create student, faculty, or admin account
2. **Student Posts**: Student creates a doubt via "Post Doubt" page
3. **Faculty Claims**: Faculty views open doubts and claims one
4. **Faculty Answers**: Faculty provides detailed answer
5. **Student Views**: Student sees resolved doubt with answer
6. **Knowledge Base**: Any user can search resolved doubts
7. **Admin Oversees**: Admin manages users, subjects, and platform

## Security Features

- **Password Hashing**: bcryptjs with salt rounds = 10
- **JWT Authentication**: 7-day token expiry
- **Role-Based Access Control**: Middleware enforces permissions
- **Input Validation**: Client-side and server-side validation
- **CORS**: Frontend origin restricted to prevent cross-origin attacks
- **Protected Routes**: React Router prevents unauthorized navigation

## Database Models

### User
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: 'student', 'faculty', 'admin'),
  timestamps: true
}
```

### Subject
```javascript
{
  subjectName: String (unique, required),
  description: String,
  timestamps: true
}
```

### Doubt
```javascript
{
  studentId: ObjectId (ref: User),
  subjectId: ObjectId (ref: Subject),
  title: String (required),
  description: String (required),
  status: String (enum: 'OPEN', 'CLAIMED', 'RESOLVED'),
  facultyId: ObjectId (ref: User, optional),
  answer: String,
  timestamps: true,
  textIndex: { title, description }
}
```

## Development Tips

- Check browser console for API errors
- Check backend terminal for database connection issues
- Use MongoDB Atlas UI to verify data structure
- Clear localStorage if auth issues occur: `localStorage.clear()`
- Ensure CORS is properly configured for frontend URL

## Production Deployment

### Prepare for Production

1. **Backend**:
   - Change `NODE_ENV` to `production`
   - Set strong `JWT_SECRET`
   - Use MongoDB Atlas (not local)
   - Deploy on Heroku, Railway, or AWS

2. **Frontend**:
   - Build: `npm run build`
   - Deploy on Vercel, Netlify, or AWS S3

3. **Environment**:
   - Use environment variables from deployment platform
   - Never commit `.env` files
   - Update CORS origin to production frontend URL

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check connection string, network access in Atlas |
| CORS errors | Verify frontend URL in backend CORS config |
| JWT errors | Clear localStorage, re-login |
| API calls fail | Check backend is running on port 5000 |
| Subject list empty | Admin needs to create subjects first |

## Future Enhancements

- Email notifications for new doubts/answers
- Real-time updates with Socket.io
- Ratings and reviews for faculty answers
- Doubt categories and tagging
- Analytics dashboard
- Mobile app
- Multi-language support

## License

MIT License - Feel free to use this project for educational purposes.
