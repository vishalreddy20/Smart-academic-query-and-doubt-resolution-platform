# Smart Academic Query & Doubt Resolution Platform

## A PROJECT REPORT

Submitted by

**MOKSHAGNA ALAPARTHI** [RA2311056010044]
**NAYANA DINESH** [RA2311056010017]
**HIYA JAIN** [RA2311056010008]

Under the Guidance of

**Dr. Prabhu Kavin**
Assistant Professor, Department of Data Science and Business Systems

in partial fulfillment of the requirements for the degree of

**BACHELOR OF TECHNOLOGY** in **COMPUTER SCIENCE AND ENGINEERING**
with specialization in Data Science

---

**DEPARTMENT OF DATA SCIENCE AND BUSINESS SYSTEMS**
**COLLEGE OF ENGINEERING AND TECHNOLOGY**
**SRM INSTITUTE OF SCIENCE AND TECHNOLOGY**
**KATTANKULATHUR – 603 203**
**MAY 2026**

---

## BONAFIDE CERTIFICATE

Certified that 21CSS301T Full Stack Development report titled **"Smart Academic Query & Doubt Resolution Platform"** is the bonafide work of **"Mokshagna Alaparthi [RA2311056010044], Nayana Dinesh [RA2311056010017], Hiya Jain [RA2311056010008]"** who carried out the project work under my supervision. Certified further, that to the best of my knowledge the work reported here in does not form any other project report or dissertation on the basis of which a degree or award was conferred on an earlier occasion on this or any other candidate.

| | |
|:---|:---|
| **SIGNATURE** | **SIGNATURE** |
| **Dr. Prabhu Kavin** | **Dr. Kavitha V.** |
| ASSISTANT PROFESSOR | PROFESSOR, HEAD OF THE DEPARTMENT |
| Department of Data Science and Business Systems, | Department of Data Science and Business Systems, |
| School of Computing, | School of Computing, |
| SRM Institute of Science and Technology | SRM Institute of Science and Technology |

---

## ACKNOWLEDGEMENT

We express our humble gratitude to **Dr. C. Muthamizhchelvan**, Vice-Chancellor, SRM Institute of Science and Technology, for the facilities extended for the project work and his continued support.

We extend our sincere thanks to **Dr. Leenus Jesu Martin M**, Dean-CET, SRM Institute of Science and Technology, for his invaluable support.

We wish to thank **Dr. Revathi Venkataraman**, Professor and Chairperson, School of Computing, SRM Institute of Science and Technology, for her support throughout the project work.

We are incredibly grateful to our Head of the Department, Professor **Dr. Kavitha V.**, Department of Data Science and Business Systems, SRM Institute of Science and Technology, for her suggestions and encouragement at all the stages of the project work.

Our inexpressible respect and thanks to our guide, **Dr. Prabhu Kavin**, Assistant Professor, Department of Data Science and Business Systems, SRM Institute of Science and Technology, for providing us with an opportunity to pursue our project under her mentorship. Her passion for solving problems and making a difference in the world has always been inspiring.

We sincerely thank all the staff members of Data Science and Business Systems, School of Computing, S.R.M Institute of Science and Technology, for their help during the project.

Finally, we would like to thank our parents, family members, and friends for their unconditional love, constant support and encouragement.

**Mokshagna Alaparthi – RA2311056010044**
**Nayana Dinesh – RA2311056010017**
**Hiya Jain – RA2311056010008**

---

## ABSTRACT

The Smart Academic Query & Doubt Resolution Platform is a comprehensive full-stack web application developed using the MERN stack (MongoDB, Express.js, React, Node.js) that bridges the gap between students seeking academic assistance and faculty tutors who can provide expert solutions. The platform enables students to post subject-tagged academic doubts, which are then claimed and resolved by approved tutors through a structured workflow with priority queuing based on subscription tiers (Free, Premium, Pro).

With increasing academic pressure on engineering students and limited one-on-one faculty interaction time, there exists a clear need for a structured, on-demand academic support system. This platform addresses that need by providing a real-time doubt posting and resolution pipeline, a searchable Knowledge Base of previously resolved queries, and a tiered subscription model with Razorpay payment integration for monetized premium features.

The system implements role-based access control across three user types — Students, Tutors, and Administrators — each with dedicated dashboards. Security is enforced through JWT-based authentication with OTP email verification, Helmet.js for HTTP header hardening, express-rate-limit for API throttling, and express-mongo-sanitize for injection prevention. The frontend is built with React.js (v18) styled using Tailwind CSS with Framer Motion animations, while the backend is powered by Node.js and Express.js with MongoDB Atlas as the cloud database. The application is deployed with the frontend on Vercel and the backend on Render, with source code maintained on GitHub.

---

## TABLE OF CONTENTS

| Section | Page |
|:---|:---|
| ABSTRACT | 3 |
| TABLE OF CONTENTS | 4 |
| **CHAPTER 1 – INTRODUCTION** | |
| 1.1 Problem Statement | 5 |
| 1.2 Objectives of the Project | 5 |
| 1.3 Scope of the Application | 6 |
| **CHAPTER 2 – TECHNOLOGY STACK** | |
| 2.1 Frontend – React.js | 7 |
| 2.2 Backend – Node.js & Express.js | 7 |
| 2.3 Database – MongoDB | 8 |
| 2.4 Tools Used | 8 |
| **CHAPTER 3 – SYSTEM DESIGN** | |
| 3.1 Architecture Diagram (MERN Stack) | 9 |
| 3.2 ER Diagram / Database Schema | 10 |
| **CHAPTER 4 – MODULE DESCRIPTION** | |
| 4.1 Authentication Module | 12 |
| 4.2 Doubt Management Module | 12 |
| 4.3 Tutor Resolution Module | 13 |
| 4.4 Subscription & Payment Module | 13 |
| 4.5 Admin Management Module | 14 |
| 4.6 Knowledge Base Module | 14 |
| 4.7 Team Members Module | 14 |
| **CHAPTER 5 – IMPLEMENTATION DETAILS** | |
| 5.1 Overview of Features Developed | 15 |
| 5.2 Code Structure (Folder Breakdown) | 16 |
| 5.3 Key Logic and Snippets | 17 |
| **CHAPTER 6 – DEPLOYMENT DETAILS** | |
| 6.1 GitHub Repository | 18 |
| 6.2 Vercel Frontend Deployment | 18 |
| 6.3 Backend Deployment on Render | 19 |
| **CHAPTER 7 – PROJECT IMPLEMENTATION STATUS** | 20 |
| **REFERENCES** | 21 |
| **APPENDIX – SCREENSHOTS** | 22 |

---

## CHAPTER 1 – INTRODUCTION

### 1.1 Problem Statement

Engineering students frequently encounter academic doubts across a wide range of subjects — from Data Structures and Algorithms to Machine Learning — that cannot always be resolved within the constraints of classroom hours. Faculty office hours are limited, peer responses are often unreliable, and existing Q&A platforms like Stack Overflow are not tailored to university-level Indian B.Tech curricula.

There is a critical need for a dedicated, structured, and monetizable platform where students can post curriculum-specific doubts with proper subject tagging, difficulty classification, and priority queuing, and where verified faculty tutors can claim, resolve, and earn from providing high-quality solutions. The Smart Academic Query & Doubt Resolution Platform addresses this gap by providing a complete doubt lifecycle management system — from posting to resolution to rating — built on modern web technologies with role-based access, payment integration, and a searchable knowledge base.

### 1.2 Objectives of the Project

- To design and develop a secure, responsive full-stack web application using the MERN stack for academic doubt resolution.
- To implement a doubt lifecycle workflow with status transitions: open → claimed → in-progress → submitted → resolved, with support for dispute and reopen scenarios.
- To build a priority queue system where premium and pro subscribers' doubts are served before free-tier doubts, using MongoDB compound indexes.
- To integrate Razorpay payment gateway for subscription-based monetization with three tiers: Free (5 doubts/month), Premium (50 doubts/month), and Pro (200 doubts/month).
- To implement secure user authentication using JWT tokens with OTP-based email verification via Nodemailer.
- To provide role-based dashboards for Students (post doubts, track status), Tutors (claim and resolve doubts, track earnings), and Administrators (manage users, subjects, and platform analytics).
- To build a searchable Knowledge Base of resolved doubts using MongoDB full-text indexing.
- To deploy the application with a publicly accessible frontend (Vercel) and a robust backend API (Render).

### 1.3 Scope of the Application

The Smart Academic Query & Doubt Resolution Platform is scoped as a comprehensive academic support system for Indian B.Tech CSE students and faculty. The current scope includes:

- **User registration and login** with JWT-based authentication, bcryptjs password hashing (salt rounds = 10), and 6-digit OTP email verification with auto-expiry (5 min TTL).
- **Doubt posting** with subject selection (10 pre-seeded CSE subjects), difficulty classification (easy/medium/hard), and optional file attachments.
- **Tutor workflow** — claim open doubts, submit solutions, and receive 1–5 star ratings with written feedback from students.
- **Priority queue** — doubts are served to tutors sorted by subscription tier priority (pro > premium > free), then FIFO within the same tier.
- **Subscription plans** — Free, Premium, and Pro tiers with Razorpay checkout integration, HMAC SHA256 signature verification, and automatic subscription activation.
- **Admin panel** — user management (approve/reject tutors, activate/deactivate accounts), subject CRUD, and platform-wide analytics via MongoDB aggregation pipeline.
- **Knowledge Base** — public, searchable archive of resolved doubts using MongoDB `$text` index on title, description, and tags.
- **Team Members module** — a separate CRUD module for managing project team profiles with Multer-based image uploads.
- **Responsive UI** accessible on both desktop and mobile browsers, styled with Tailwind CSS.

Features outside the current scope include real-time chat, video tutoring, native mobile apps, and multi-language support — these are earmarked for future iterations.

---

## CHAPTER 2 – TECHNOLOGY STACK

### 2.1 Frontend – React.js

The frontend is built using **React.js (v18.3.1)** with the following technologies:

- **React.js (v18.3.1)** — Core UI framework using functional components and React Hooks (`useState`, `useEffect`, `useContext`).
- **React Router DOM (v6.15)** — Client-side routing with nested routes, protected routes via `<ProtectedRoute>` component, and dynamic URL parameters (e.g., `/doubt/:id`, `/team/members/:id`).
- **Tailwind CSS (v3.4.1)** — Utility-first CSS framework with `@tailwindcss/forms` plugin for styled form elements.
- **Axios (v1.6)** — Promise-based HTTP client with centralized instance (`services/api.js`) and automatic JWT header injection.
- **Framer Motion (v12.35)** — Production-ready animation library powering page transitions and micro-interactions on the landing page.
- **Lucide React (v0.344)** — Modern SVG icon library used across all dashboard components.
- **tsParticles (v3.9)** — Particle animation engine for dynamic background effects on the landing and auth pages.
- **Vite (v5.4.2)** — Next-generation build tool with near-instant HMR and optimized production bundles.

### 2.2 Backend – Node.js & Express.js

The backend runs on **Node.js (v18 LTS)** with **Express.js (v4.18)**:

- **Express.js (v4.18)** — RESTful API framework with 40+ endpoints across 6 route modules.
- **Mongoose (v7.5)** — MongoDB ODM with 9 schema models, pre-save hooks, instance methods, text indexes, and compound indexes.
- **jsonwebtoken (v9.0)** — JWT issuance (7-day expiry) and verification middleware.
- **bcryptjs (v2.4)** — Password hashing with salt rounds = 10.
- **Helmet (v7.0)** — HTTP security headers (XSS, clickjacking, MIME sniffing protection).
- **express-rate-limit (v8.3)** — Global: 300 req/15 min; Auth: 50 req/15 min.
- **express-mongo-sanitize (v2.2)** — MongoDB operator injection prevention.
- **Morgan (v1.10)** — HTTP request logging for debugging and audit trails.
- **Nodemailer (v6.9)** — Gmail SMTP email delivery for OTP verification.
- **Multer (v1.4)** — `multipart/form-data` handling for team member image uploads.
- **Razorpay SDK (v2.9)** — Payment gateway integration for subscription billing.
- **express-async-handler (v1.2)** — Async error handling without try-catch boilerplate.
- **express-validator (v7.0)** — Input validation and sanitization middleware.
- **dotenv (v16.3)** — Environment variable management.
- **cors (v2.8)** — Cross-origin request handling with origin whitelist.

### 2.3 Database – MongoDB

The platform uses **MongoDB Atlas** (cloud-hosted M0 cluster):

- **9 collections**: users, otps, doubts, subjects, payments, subscriptions, plans, reviews, members.
- **Text indexes** on doubt `title`, `description`, and `tags` for full-text search.
- **Compound indexes** on `studentId+status`, `subjectId+status`, and `status+priorityScore+queuedAt` for priority queue ordering.
- **TTL index** on OTP `expiresAt` for automatic 5-minute document expiry and cleanup.

### 2.4 Tools Used

| Tool / Platform | Purpose |
|:---|:---|
| GitHub | Version control and source code repository |
| Vercel | Frontend hosting with CI/CD from GitHub |
| Render | Backend API hosting (Node.js web service) |
| MongoDB Atlas | Cloud-hosted database (free M0 cluster) |
| Postman | API testing and endpoint documentation |
| VS Code | Primary code editor with ESLint and Prettier |
| Nodemon | Backend auto-restart during development |
| Vite | Frontend dev server with HMR |

---

## CHAPTER 3 – SYSTEM DESIGN

### 3.1 Architecture Diagram (MERN Stack)

The platform follows a **three-tier MERN stack architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│              (React.js SPA — Hosted on Vercel)                  │
│                                                                  │
│  React 18 │ React Router v6 │ Tailwind CSS │ Framer Motion      │
│  Axios │ Lucide React │ tsParticles │ AuthContext (Context API)  │
│                                                                  │
│  Pages: Landing, Login, Register, Student Dashboard,             │
│  Tutor Dashboard, Admin Dashboard, Post Doubt, Doubt Detail,    │
│  Knowledge Base, Subscription, Profile, Team Management          │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS REST API Calls (Axios + JWT Bearer)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
│           (Node.js + Express.js — Hosted on Render)             │
│                                                                  │
│  Express 4.18 │ Helmet │ CORS │ Morgan │ Rate Limiter           │
│  JWT Auth Middleware │ Role-Based Authorization │ Multer         │
│  express-mongo-sanitize │ express-validator │ Nodemailer         │
│                                                                  │
│  Routes: /api/auth (9) │ /api/doubts (8) │ /api/payments (6)    │
│  /api/admin (10) │ /api/analytics │ /api/members │ /api/health  │
│                                                                  │
│  Controllers: authController │ doubtController │ adminController │
│  paymentController │ analyticsController                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │ Mongoose ODM Queries (BSON over TLS)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│               (MongoDB Atlas — Cloud M0 Cluster)                │
│                                                                  │
│  Collections: users │ otps │ doubts │ subjects │ payments        │
│  subscriptions │ plans │ reviews │ members                       │
│                                                                  │
│  Indexes: Text (title, description, tags) │ Compound             │
│  (studentId+status, subjectId+status, priority queue)            │
│  TTL Index on OTP expiresAt                                      │
└─────────────────────────────────────────────────────────────────┘
```

**Deployment Flow:**
```
User Browser → Vercel (React SPA) → HTTPS REST → Render (Express API) → MongoDB Atlas
```

### 3.2 ER Diagram / Database Schema

The database comprises **9 collections** with the following relationships:

```
┌──────────────────────┐        ┌──────────────────────────┐
│       USERS           │        │         DOUBTS            │
├──────────────────────┤        ├──────────────────────────┤
│ _id: ObjectId (PK)    │──┐     │ _id: ObjectId (PK)       │
│ name: String           │  │     │ studentId: ObjectId (FK)──→ USERS
│ email: String (unique) │  │     │ tutorId: ObjectId (FK)────→ USERS
│ password: String       │  │     │ subjectId: ObjectId (FK)──→ SUBJECTS
│ phone: String          │  │     │ title: String             │
│ role: Enum [student,   │  │     │ description: String       │
│   tutor, admin]        │  │     │ difficulty: Enum          │
│ isVerified: Boolean    │  │     │ status: Enum [open,       │
│ isApproved: Boolean    │  │     │   claimed, in-progress,   │
│ isActive: Boolean      │  │     │   submitted, resolved,    │
│ college: String        │  │     │   disputed]               │
│ branch: String         │  │     │ solution: String          │
│ graduationYear: String │  │     │ attachments: [String]     │
│ expertise: [String]    │  │     │ studentRating: Number     │
│ subscriptionTier: Enum │  │     │ priorityScore: Number     │
│ isPremiumActive: Bool  │  │     │ tags: [String]            │
│ rating: Number         │  │     │ views: Number             │
│ totalDoubtsResolved    │  │     │ slaBreached: Boolean      │
│ totalEarnings: Number  │  │     │ responseTime: Number      │
│ bankDetails: Object    │  │     │ createdAt: Date           │
│ createdAt: Date        │  │     └──────────────────────────┘
└──────────────────────┘  │
                           │     ┌──────────────────────────┐
  ┌───────────────────┐    │     │       SUBJECTS            │
  │       OTPs         │    │     ├──────────────────────────┤
  ├───────────────────┤    │     │ _id: ObjectId (PK)       │
  │ email: String      │───┘     │ name: String (unique)     │
  │ otp: String (hash) │         │ branch: String (CSE)      │
  │ attempts: Number   │         │ description: String       │
  │ purpose: Enum      │         │ isActive: Boolean         │
  │ expiresAt: Date    │         │ doubtsCount: Number       │
  │ (TTL auto-delete)  │         └──────────────────────────┘
  └───────────────────┘
                                 ┌──────────────────────────┐
  ┌───────────────────────┐      │      PAYMENTS             │
  │    SUBSCRIPTIONS       │      ├──────────────────────────┤
  ├───────────────────────┤      │ userId: ObjectId (FK)─────→ USERS
  │ userId: ObjectId (FK)  │      │ orderId: String (unique)  │
  │ planType: Enum         │      │ amount: Number (INR)      │
  │ status: Enum           │      │ paymentStatus: Enum       │
  │ startDate / endDate    │      │ paymentMethod: Enum       │
  │ autoRenew: Boolean     │      │ signature: String         │
  │ maxDoubtsPerMonth      │      │ refundStatus: Enum        │
  │ features: Object       │      └──────────────────────────┘
  └───────────────────────┘
                                 ┌──────────────────────────┐
  ┌───────────────────────┐      │       REVIEWS             │
  │       PLANS            │      ├──────────────────────────┤
  ├───────────────────────┤      │ doubtId: ObjectId (FK)    │
  │ name: Enum [free,      │      │ tutorId: ObjectId (FK)    │
  │   premium, pro]        │      │ studentId: ObjectId (FK)  │
  │ price: Number (INR)    │      │ rating: Number (1–5)      │
  │ doubtLimit: Number     │      │ comment: String           │
  │ queuePriority: Number  │      │ reviewType: Enum          │
  │ features: Object       │      └──────────────────────────┘
  └───────────────────────┘
                                 ┌──────────────────────────┐
                                 │       MEMBERS             │
                                 ├──────────────────────────┤
                                 │ name: String              │
                                 │ rollNumber: String        │
                                 │ year / degree: String     │
                                 │ aboutProject: String      │
                                 │ hobbies: [String]         │
                                 │ image: String             │
                                 └──────────────────────────┘
```

**Key Relationships:**
- USERS `1 ─── M` DOUBTS (student posts, tutor resolves)
- SUBJECTS `1 ─── M` DOUBTS (each subject has many doubts)
- USERS `1 ─── 1` SUBSCRIPTIONS (one active subscription per user)
- USERS `1 ─── M` PAYMENTS (payment history)
- DOUBTS `1 ─── M` REVIEWS (solution ratings)
- OTPs → USERS (linked by email, auto-deleted via TTL)

---

## CHAPTER 4 – MODULE DESCRIPTION

### 4.1 Authentication Module

Handles user registration, login, OTP verification, and session management.

- **Registration:** Users provide name, email, password, and select a role (student/tutor). Password is hashed using bcryptjs (salt = 10). A 6-digit OTP is generated, hashed, and emailed via Nodemailer. OTP records auto-expire after 5 minutes (MongoDB TTL index), with a maximum of 5 verification attempts.
- **Login:** On credential verification, a JWT is issued (7-day expiry) containing user ID and role. The `lastLogin` timestamp is updated.
- **Protected Routes:** `verifyToken` middleware extracts the Bearer token, verifies via `jwt.verify()`, fetches latest user data from MongoDB, and checks `isActive` status. `authorize(...roles)` enforces role-based permissions. Additional gates: `requireApprovedAccount`, `requireVerifiedEmail`, `requirePremium`.
- **Admin Registration:** Requires a secret admin code (`ADMIN_SECRET_CODE`) in addition to standard fields.
- **Password Reset:** Forgot-password flow generates a crypto token emailed to the user, with a dedicated reset page (`/reset-password/:token`).
- **Frontend Auth State:** `AuthContext.jsx` (React Context API) manages JWT persistence in `localStorage` and provides user data globally.

### 4.2 Doubt Management Module (Student)

The core module enabling students to post and track academic doubts.

- **Post Doubt:** Students select a subject (from 10 pre-seeded CSE subjects), enter a title, description, difficulty level (easy/medium/hard), and optional tags/attachments. The doubt is assigned a `priorityScore` based on the student's subscription tier (free=1, premium=2, pro=3).
- **Doubt Tracking:** Students view their posted doubts with real-time status indicators (open/claimed/in-progress/submitted/resolved/disputed). The Doubt Detail page (`/doubt/:id`) shows the full doubt, tutor solution, and rating interface.
- **Rating:** After a tutor submits a solution, students rate it (1–5 stars) with optional written feedback. This updates the tutor's aggregate rating.

### 4.3 Tutor Resolution Module

Enables approved tutors to claim and resolve student doubts.

- **Open Queue:** Tutors see a priority-sorted list of open doubts (pro-tier first, then premium, then free — FIFO within each tier). Each card shows title, subject, difficulty, and posting time.
- **Claim Workflow:** Tutors claim a doubt, changing status to `claimed`. They then submit a written solution (and optional files), transitioning status to `submitted`. The student reviews and either accepts (→ `resolved`) or disputes.
- **SLA Tracking:** The schema tracks `claimedAt`, `submittedAt`, `responseTime` (minutes), and `slaBreached` flag for monitoring tutor performance against plan guarantees.
- **Earnings & Stats:** The tutor dashboard displays total doubts resolved, average rating, and total earnings.

### 4.4 Subscription & Payment Module

Handles tiered subscription plans and Razorpay payment processing.

- **Plans:** Three tiers defined in the `Plans` collection — Free (₹0, 5 doubts/month, priority 1), Premium (₹X, 50 doubts/month, priority 2), Pro (₹X, 200 doubts/month, priority 3). Each tier has a feature matrix (file upload, priority queue, analytics access, guaranteed SLA).
- **Payment Flow:** (1) Frontend calls `POST /api/payments/create-order` → backend creates Razorpay order via SDK. (2) Razorpay checkout modal opens on client. (3) On success, frontend sends `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` to `POST /api/payments/verify` → backend validates HMAC SHA256 signature and activates subscription.
- **Subscription Management:** Active subscription tracking with auto-renew, cancellation, and refund support.

### 4.5 Admin Management Module

Provides platform administration capabilities.

- **User Management:** List all users, approve/reject pending tutor applications, activate/deactivate user accounts, delete users.
- **Subject Management:** Create, list, and delete academic subjects. On startup, 10 CSE subjects are auto-seeded (DSA, OOP, DBMS, OS, CN, TOC, Compiler Design, SE, ML, Cloud Computing).
- **Platform Analytics:** MongoDB aggregation pipeline computes total users by role, doubt counts by status, revenue metrics, and time-series data. Displayed on the admin dashboard.

### 4.6 Knowledge Base Module

A public, searchable archive of resolved academic doubts.

- **Full-Text Search:** MongoDB `$text` index on doubt `title`, `description`, and `tags` enables fast keyword search across all resolved doubts.
- **Subject Filtering:** Users can filter by subject category.
- **Public Access:** Available to all users including unauthenticated visitors at `/knowledge-base`.

### 4.7 Team Members Module (Assignment)

A separate CRUD module for managing project team member profiles.

- **Add Member:** Form captures name, roll number, year, degree, about project, hobbies, certificates, internships, aim, and profile image (uploaded via Multer to `uploads/` directory).
- **View Members:** Responsive card grid displaying all members with avatars, names, and key details.
- **Member Details:** Detailed profile view with colored hobby tags and two-step deletion confirmation.
- **Image Handling:** Multer stores images locally; served statically with CORS headers. Cleanup on member deletion.

---

## CHAPTER 5 – IMPLEMENTATION DETAILS

### 5.1 Overview of Features Developed

| Feature | Status | Technology Used |
|:---|:---|:---|
| User Registration with OTP Email Verification | ✅ Completed | Node.js, Nodemailer, bcryptjs, MongoDB TTL Index |
| User Login & JWT Issuance (7-day expiry) | ✅ Completed | Express.js, jsonwebtoken, bcryptjs |
| Protected Routes with Role-Based Authorization | ✅ Completed | JWT Middleware, `authorize()` + `verifyToken()` |
| Admin Registration (Secret Code Gated) | ✅ Completed | Express.js, Custom Admin Secret Validation |
| Password Reset Flow (Forgot + Reset) | ✅ Completed | Nodemailer, Crypto Token Generation |
| Doubt Posting with Subject Tagging & Priority | ✅ Completed | React, Express, MongoDB, Mongoose Refs |
| Doubt Claiming & Solution Submission (Tutor) | ✅ Completed | Express.js, Status FSM (open→claimed→submitted→resolved) |
| Priority Queue (Free/Premium/Pro Ordering) | ✅ Completed | MongoDB Compound Index, `priorityScore` Field |
| Doubt Rating & Student Feedback | ✅ Completed | React Star Rating, MongoDB Update |
| Knowledge Base (Full-Text Search) | ✅ Completed | MongoDB Text Index (`$text`), Express Search API |
| Subscription Plans (Free, Premium, Pro) | ✅ Completed | Razorpay SDK, Plans Collection, Subscription Collection |
| Payment Order Creation & Verification | ✅ Completed | Razorpay `orders.create()`, HMAC SHA256 Verify |
| Student Dashboard with Stats | ✅ Completed | React, Tailwind CSS, Axios |
| Tutor Dashboard with Priority Queue | ✅ Completed | React, Priority-Sorted API Response |
| Admin Dashboard (Users, Subjects, Stats) | ✅ Completed | React, Admin Controller, Analytics Controller |
| Platform Analytics API | ✅ Completed | MongoDB Aggregation Pipeline |
| Team Members CRUD Module | ✅ Completed | React, Express, Multer, MongoDB |
| Responsive Design (Mobile + Desktop) | ✅ Completed | Tailwind CSS Breakpoints |
| API Rate Limiting | ✅ Completed | express-rate-limit (Global: 300/15m, Auth: 50/15m) |
| Security Hardening | ✅ Completed | Helmet, mongo-sanitize, CORS Whitelist |
| Animated Landing Page | ✅ Completed | Framer Motion, tsParticles |
| Frontend Deployment (Vercel) | ✅ Completed | Vercel CI/CD from GitHub |
| Backend Deployment (Render) | ✅ Completed | Render Web Service, `render.yaml` |

### 5.2 Code Structure (Folder Breakdown)

**Frontend Structure (`src/`)**

| Folder / File | Description |
|:---|:---|
| `src/App.jsx` | Root component: `BrowserRouter`, 18 route definitions, role-based redirect logic, loading spinner |
| `src/main.tsx` | React entry point wrapping `<App>` with `AuthProvider` |
| `src/pages/` | **16 page components:** LandingPage, LoginPage, RegisterPage, AdminRegisterPage, ForgotPasswordPage, ResetPasswordPage, StudentDashboard, FacultyDashboard (Tutor), AdminDashboard, PostDoubtPage, DoubtDetailPage, KnowledgeBasePage, SubscriptionPage, ProfilePage, TeamHomePage, AddMemberPage, ViewMembersPage, MemberDetailsPage |
| `src/components/` | **16 reusable components:** Navbar, SidebarNav, TopNavBar, ProtectedRoute, OTPModal, DoubtCard, AnswerForm, DashboardStats, SearchBar, Button, Card, Input, Select, Textarea, Badge, Modal |
| `src/contexts/AuthContext.jsx` | React Context API: JWT persistence in localStorage, user state, loading flag |
| `src/services/api.js` | Centralized Axios instance with JWT header injection; 21+ API functions across Auth, Doubts, Payments, Admin |
| `src/index.css` | Tailwind CSS directives (`@tailwind base/components/utilities`) |

**Backend Structure (`backend/`)**

| Folder / File | Description |
|:---|:---|
| `server.js` | Express app init, Helmet, Morgan, CORS whitelist, rate limiters, MongoDB connection, auto-seeding (admin + 10 CSE subjects), route mounting, static file serving, error handlers |
| `models/` | **9 Mongoose schemas:** User (30+ fields, pre-save hash, `matchPassword()`), Doubt (status FSM, priority queue, SLA, text+compound indexes), Subject, Payment, Subscription, Plan, OTP (TTL), Review, Member |
| `controllers/` | **5 controllers:** authController (register, login, OTP, password reset), doubtController (CRUD, claim, solve, rate, search), paymentController (Razorpay order, verify, refund), adminController (users, subjects), analyticsController (aggregation stats) |
| `middleware/` | `auth.js` (verifyToken, authorize, requireApprovedAccount, requireVerifiedEmail, requirePremium), `errorHandler.js` (global error + 404) |
| `utils/` | `emailService.js` (Nodemailer SMTP), `otpService.js` (generate, hash, verify, cleanup cron), `jwtService.js` (token generation), `assignmentService.js` (tutor matching) |
| `routes/` | **6 route modules:** authRoutes (9 endpoints), doubtRoutes (8), paymentRoutes (6), adminRoutes (10), analyticsRoutes, members (CRUD + Multer) |

### 5.3 Key Logic and Snippets

#### 5.3.1 JWT Authentication Middleware

The `verifyToken` middleware in `middleware/auth.js` extracts the Bearer token from the `Authorization` header, verifies it via `jwt.verify(token, JWT_SECRET)`, fetches the latest user document from MongoDB, checks `isActive` status, and attaches user data to `req.user.userData`. The `authorize(...roles)` higher-order function then checks `req.user.role` against permitted roles. Additional layers (`requirePremium`, `requireVerifiedEmail`) enforce subscription and email verification gates at the route level.

#### 5.3.2 Priority Queue & SLA Tracking

Each doubt receives a `priorityScore` based on the student's plan (free=1, premium=2, pro=3). The compound index `{ status: 1, priorityScore: -1, queuedAt: 1 }` ensures tutors see pro-tier doubts first, then premium, then free — with FIFO ordering within each tier. SLA fields (`responseTime`, `slaBreached`) track whether tutor responses meet plan-specific time guarantees.

#### 5.3.3 Razorpay Payment Verification

After Razorpay checkout on the frontend, the backend receives `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. Verification uses `crypto.createHmac('sha256', RAZORPAY_SECRET).update(order_id + "|" + payment_id).digest('hex')` and compares against the received signature. On match, the payment record is updated to `success` and the user's subscription is activated.

#### 5.3.4 Auto-Seeding on Startup

The `seedData()` function in `server.js` runs on MongoDB connection. It creates a default admin user if none exists and synchronizes 10 Indian B.Tech CSE subjects (DSA, OOP, DBMS, OS, CN, TOC, Compiler Design, SE, ML, Cloud Computing) using `updateOne` with `{ upsert: true }` for idempotent execution.

---

## CHAPTER 6 – DEPLOYMENT DETAILS

### 6.1 GitHub Repository

The source code is maintained on GitHub as a monorepo with `src/` (frontend) and `backend/` directories.

- **GitHub Repository:** https://github.com/vishalreddy20/Smart-academic-query-and-doubt-resolution-platform
- **Branch Strategy:** `main` (production), `develop` (integration), `feature/*` (individual features)
- **Commit Convention:** Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)

### 6.2 Vercel Frontend Deployment

The React frontend is deployed on **Vercel** with continuous deployment from GitHub.

- **Build Command:** `npm run build`
- **Publish Directory:** `dist/` (Vite output)
- **Environment Variables:** `VITE_BACKEND_URL` → Render backend URL
- **Redirect Rule:** `vercel.json` rewrites all paths to `index.html` for React Router SPA support
- **Live Frontend URL:** https://smart-academic-query-and-doubt-reso.vercel.app/

### 6.3 Backend Deployment on Render

The backend is deployed as a **Render Web Service** configured via `render.yaml`:

- **Build Command:** `npm install && npm --prefix backend install && npm run build`
- **Start Command:** `npm --prefix backend start` → `node server.js`
- **Environment Variables:**

| Variable | Description |
|:---|:---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `PORT` | Server port (default: 5000) |
| `FRONTEND_URL` | Vercel URL for CORS whitelist |
| `EMAIL_HOST` | SMTP host (`smtp.gmail.com`) |
| `EMAIL_PORT` | SMTP port (`465`) |
| `EMAIL_SECURE` | TLS enabled (`true`) |
| `EMAIL_USER` | Gmail address |
| `EMAIL_PASSWORD` | Gmail App Password |
| `EMAIL_FROM` | Sender address |
| `REQUIRE_EMAIL_OTP` | OTP toggle (`true`/`false`) |
| `OTP_EXPIRE_TIME` | OTP validity in minutes (`5`) |

- **Health Check:** `GET /api/health` → `{ "status": "Backend running", "timestamp": "..." }`

---

## CHAPTER 7 – PROJECT IMPLEMENTATION STATUS

| S.No | Feature / Component | Layer | Status | Remarks |
|:---|:---|:---|:---|:---|
| 1 | Project Setup & Environment Config | Both | ✅ Completed | Vite + Express boilerplate |
| 2 | MongoDB Atlas Connection & Auto-Seeding | Backend | ✅ Completed | Admin user + 10 CSE subjects |
| 3 | User Registration API with OTP | Backend | ✅ Completed | bcrypt + Nodemailer |
| 4 | OTP Verification & Email Activation | Backend | ✅ Completed | TTL auto-delete, max 5 attempts |
| 5 | User Login & JWT Issuance | Backend | ✅ Completed | 7-day expiry, role encoding |
| 6 | Auth Middleware (Token + Role + Status) | Backend | ✅ Completed | 5 middleware layers |
| 7 | Password Reset (Forgot + Reset) | Backend | ✅ Completed | Crypto token, email |
| 8 | Login / Register / OTP UI | Frontend | ✅ Completed | 3-step wizard, OTP modal |
| 9 | Auth Context (Global State) | Frontend | ✅ Completed | React Context + localStorage |
| 10 | Doubt Posting API | Backend | ✅ Completed | Subject tag, difficulty, priority |
| 11 | Doubt Claim & Solution Submission | Backend | ✅ Completed | Status FSM, SLA tracking |
| 12 | Doubt Rating & Feedback | Backend | ✅ Completed | 1–5 stars, feedback string |
| 13 | Full-Text Search API | Backend | ✅ Completed | MongoDB `$text` index |
| 14 | Post Doubt UI Page | Frontend | ✅ Completed | Subject dropdown, validation |
| 15 | Doubt Detail Page | Frontend | ✅ Completed | Solution view, rating UI |
| 16 | Student Dashboard | Frontend | ✅ Completed | Stats, doubts list, actions |
| 17 | Tutor Dashboard | Frontend | ✅ Completed | Priority queue, claimed doubts |
| 18 | Admin Dashboard | Frontend | ✅ Completed | User mgmt, subjects, analytics |
| 19 | Knowledge Base Page | Frontend | ✅ Completed | Search + subject filter |
| 20 | Subscription Plans (3 tiers) | Backend | ✅ Completed | Plans collection, feature matrix |
| 21 | Razorpay Payment Integration | Backend | ✅ Completed | HMAC SHA256 verification |
| 22 | Subscription UI Page | Frontend | ✅ Completed | Plan comparison, checkout |
| 23 | Profile Management | Frontend | ✅ Completed | Edit profile, change password |
| 24 | Platform Analytics API | Backend | ✅ Completed | Aggregation pipeline |
| 25 | Team Members CRUD | Both | ✅ Completed | Multer image upload |
| 26 | API Rate Limiting | Backend | ✅ Completed | 300/15m global, 50/15m auth |
| 27 | Security (Helmet, Sanitize) | Backend | ✅ Completed | XSS, injection, CORS |
| 28 | Responsive Design | Frontend | ✅ Completed | Tailwind breakpoints |
| 29 | Animated Landing Page | Frontend | ✅ Completed | Framer Motion, tsParticles |
| 30 | GitHub Repository | DevOps | ✅ Completed | Version controlled |
| 31 | Frontend Deployment (Vercel) | DevOps | ✅ Completed | CI/CD enabled |
| 32 | Backend Deployment (Render) | DevOps | ✅ Completed | render.yaml configured |

---

## REFERENCES

[1] MongoDB Documentation. (2024). *The MongoDB Manual.* https://www.mongodb.com/docs/

[2] Express.js. (2024). *Express 4.x API Reference.* https://expressjs.com/en/4x/api.html

[3] React Documentation. (2024). *React Docs — Getting Started.* https://react.dev/

[4] Node.js Foundation. (2024). *Node.js v18 LTS Documentation.* https://nodejs.org/en/docs/

[5] JWT.io. (2024). *JSON Web Tokens Introduction.* https://jwt.io/introduction/

[6] Tailwind CSS. (2024). *Tailwind CSS Documentation.* https://tailwindcss.com/docs/

[7] Vite. (2024). *Vite Next Generation Frontend Tooling.* https://vitejs.dev/guide/

[8] Vercel. (2024). *Vercel Documentation.* https://vercel.com/docs/

[9] Render. (2024). *Render Docs — Deploy a Node.js Web Service.* https://render.com/docs/

[10] bcryptjs npm. (2024). *bcryptjs — npm.* https://www.npmjs.com/package/bcryptjs

[11] Mongoose. (2024). *Mongoose v7 Documentation.* https://mongoosejs.com/docs/

[12] Razorpay. (2024). *Razorpay API Documentation.* https://razorpay.com/docs/api/

[13] Helmet.js. (2024). *Helmet — Express Security Middleware.* https://helmetjs.github.io/

[14] Framer Motion. (2024). *Framer Motion — Animation Library for React.* https://www.framer.com/motion/

[15] Nodemailer. (2024). *Nodemailer Documentation.* https://nodemailer.com/

[16] Multer npm. (2024). *Multer — Express File Upload Middleware.* https://www.npmjs.com/package/multer

---

## APPENDIX – SCREENSHOTS

### A.1 Landing Page
The Landing Page features an animated particle background (tsParticles), gradient hero text, Framer Motion scroll animations, and call-to-action buttons for Login and Registration. The navigation bar provides links to Knowledge Base, Login, and Register.

**[Screenshot: Landing Page]**

### A.2 Login Page
Centered card with email/password fields, login button, links to registration and forgot-password pages. Tailwind-styled with gradient background and form validation.

**[Screenshot: Login Page]**

### A.3 Registration Page (3-Step Wizard)
Step 1: Role selection (Student/Tutor). Step 2: Form with name, email, password, college, branch, graduation year. Step 3: OTP modal with 6-digit input, resend button with countdown timer.

**[Screenshot: Registration Page with OTP Modal]**

### A.4 Student Dashboard
Sidebar navigation, stats cards (total doubts, resolved, subscription tier), recent doubts list with status badges, quick-action buttons (Post Doubt, Knowledge Base).

**[Screenshot: Student Dashboard]**

### A.5 Post Doubt Page
Subject dropdown (10 CSE subjects from API), title field, description textarea, difficulty selector (Easy/Medium/Hard), optional file attachments, submit button with validation.

**[Screenshot: Post Doubt Page]**

### A.6 Doubt Detail Page
Full doubt view with title, subject tag, difficulty badge, description, student info. Tutor solution section (when available). Star rating interface with feedback textarea.

**[Screenshot: Doubt Detail Page]**

### A.7 Tutor Dashboard
Priority-sorted open doubts queue (pro → premium → free). Each doubt card shows title, subject, difficulty, posting time, "Claim" button. Claimed doubts section with solution submission form. Performance stats header.

**[Screenshot: Tutor Dashboard]**

### A.8 Admin Dashboard
Platform statistics (users by role, doubts by status, revenue). User management table with approve/reject/deactivate actions. Subject management panel. Analytics charts.

**[Screenshot: Admin Dashboard]**

### A.9 Knowledge Base Page
Public search interface with full-text search bar, subject filter dropdown, paginated card grid of resolved doubts with titles, subjects, and solution previews.

**[Screenshot: Knowledge Base]**

### A.10 Subscription Page
Three-column plan comparison (Free/Premium/Pro) showing price, doubt limit, queue priority, SLA, feature checklist. "Upgrade" button triggers Razorpay checkout modal.

**[Screenshot: Subscription Plans]**

### A.11 Team Members Module
Team Home page with navigation. Add Member form with image upload and preview. View Members responsive card grid. Member Details page with hobby tags and delete confirmation.

**[Screenshot: Team Members View]**

