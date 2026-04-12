# Stitch Design Visual Mapping & Implementation Roadmap

**Status:** ✅ Design System Ready | 🔄 Implementation In Progress | 📋 Fully Documented

---

## 📸 Visual Design Reference

All high-fidelity design screenshots are located in: `/stitch/*/screen.png`

Each folder contains:
- `screen.png` - Full-page visual design screenshot
- `code.html` - Complete HTML/Tailwind implementation
- Ready to convert to React component

---

## 🗺️ Page Implementation Roadmap

### 1. **LoginPage** ✅ COMPLETE

**Location:** `src/pages/LoginPage.jsx`  
**Stitch Reference:** `stitch/login/screen.png` + `stitch/login/code.html`

**Design Elements Applied:**
- ✅ Split desktop layout (editorial gradient left, form right)
- ✅ Mobile single-column responsive
- ✅ Material Symbols icons (history_edu, visibility)
- ✅ Premium color tokens (primary, secondary, surface-container-*)
- ✅ Ghost shadows and frosted glass effects
- ✅ Semantic form styling

**Features Implemented:**
```jsx
Form Inputs:
  - Email input with institutional placeholder
  - Password input with show/hide toggle
  - Remember me checkbox
  - Forgot password link

Actions:
  - Sign In button (btn-primary gradient)
  - Create account link (secondary CTA)

States:
  - Loading state
  - Error display
  - Disabled form during submission
```

**API Integration:**
```jsx
✅ loginUser() - Authenticated login
✅ OTP modal support - For verification
✅ Navigation routes - /student, /tutor, /admin
✅ Auth context - Token storage
```

---

### 2. **RegisterPage** ⏳ READY

**Location:** `src/pages/RegisterPage.jsx`  
**Stitch Reference:** `stitch/register/screen.png` + `stitch/register/code.html`

**To Implement:**
```jsx
Form Fields:
  - Full Name input
  - Email input
  - Password input
  - Confirm password input
  - Role selector (Student, Faculty, Admin) - RadioGroup or Select
  - Terms & conditions checkbox

Password Requirements:
  - At least 8 characters
  - Password strength indicator (visual bar)
  - Validation feedback inline

Validation:
  - Required field indicators (red asterisks)
  - Inline error messages below fields
  - Real-time validation (debounced)

Actions:
  - Create Account button (btn-primary)
  - Already have account? Login link

States:
  - Loading during submission
  - Success confirmation
  - Field validation errors
  - Duplicate email error
```

**API Integration Pattern:**
```jsx
// Similar to LoginPage
API.post('/auth/register', {
  name: formData.name,
  email: formData.email,
  password: formData.password,
  role: formData.role
})
```

---

### 3. **StudentDashboard** ⏳ READY

**Location:** `src/pages/StudentDashboard.jsx`  
**Stitch Reference:** `stitch/student_dashboard/screen.png` + `stitch/student_dashboard/code.html`

**Key Components:**
```jsx
Layout:
  - Fixed left sidebar (72px wide, hidden on mobile)
  - Fixed top navbar
  - Main content area with max-width 1440px

Sidebar:
  - Logo: "The Curator - Academic Intelligence"
  - Navigation:
    - My Queries (active)
    - Faculty Queue
    - Performance
    - Library
    - Direct Messages
  - Bottom section:
    - Submit Inquiry button (btn-primary gradient)
    - Support link
    - Sign Out link

Top Navigation Bar:
  - Left: "The Academic Curator" branding
  - Center: Navigation tabs (Desktop/Dashboard, Archive, Resources)
  - Right: Search bar + Notifications + Settings + Profile avatar

KPI Section (Upper):
  [4 stat cards in grid]
  - Total Doubts | Open | In Progress | Resolved
  - Use StatCard component with icons & colors

Doubt Queue:
  - Filter tabs: All, Open, Claimed, Resolved
  - Search filter
  - Doubt cards showing:
    - Title + preview
    - Subject tag
    - Status badge (color-coded)
    - Timestamp
    - Last update indicator

Empty State:
  [When no doubts]
  - Icon
  - "No queries yet"
  - CTA: "Post your first doubt"
```

**Components to Create:**
```jsx
<SidebarNav />
<TopNavBar />
<StatCard icon={icon} label="label" value={123} />
<DoubtCard doubt={doubt} />
<FilterTabs tabs={tabs} active={active} />
```

**API Integration:**
```jsx
useEffect(() => {
  API.get('/doubts/my').then(data => setDoubts(data));
  API.get('/statistics').then(data => setStats(data));
}, [])
```

---

### 4. **PostDoubtPage** ⏳ READY

**Location:** `src/pages/PostDoubtPage.jsx`  
**Stitch Reference:** `stitch/post_doubt/screen.png` + `stitch/post_doubt/code.html`

**Form Layout:**
```jsx
Breadcrumb:
  Dashboard > Post Doubt

Header:
  Title: "Submit New Academic Query"
  Subtitle: "Provide a detailed overview of your academic roadblock..."

Main Form (Left side):
  1. Academic Department
     - Select dropdown (required)
     - Options: Physics, Economics, Literature, Engineering, etc.
  
  2. Urgency Signal
     - Toggle buttons: Normal | High Priority
  
  3. Doubt Title
     - Text input (required)
     - Character limit indicator
     - Placeholder: "Be specific about your question"
  
  4. Detailed Description
     - Textarea (required, large)
     - Character limit and guidance
     - Rich text editor support (optional)
  
  5. File Attachment (Optional)
     - Drag-drop zone for images/documents
     - Show uploaded file preview

Form Actions:
  - Primary: "Submit Doubt"
  - Secondary: "Save as Draft"
  - Tertiary: "Discard & Return"

Right Side (Desktop):
  Form tips panel with:
  - "Write clearly..." tip
  - Example queries
  - Character limits

Validation:
  - Required field indicators
  - Inline error messages
  - Submit disabled until valid

Success State:
  - Confirmation modal
  - "Your doubt has been posted"
  - CTA: "View in Dashboard"
```

**API Integration:**
```jsx
API.post('/doubts', {
  subjectId: formData.department,
  title: formData.title,
  description: formData.description,
  priority: formData.urgency,
  attachments: formData.files
})
```

---

### 5. **FacultyDashboard** ⏳ READY

**Location:** `src/pages/FacultyDashboard.jsx`  
**Stitch Reference:** `stitch/faculty_dashboard/screen.png` + `stitch/faculty_dashboard/code.html`

**Similar to StudentDashboard but with:**

```jsx
KPI Cards (Different metrics):
  - Unclaimed Doubts
  - Claimed by Me
  - Resolved Today
  - Average Response Time

Queue Sections:
  1. OPEN DOUBTS (Queue to claim)
     [List of unclaimed doubts]
     - Priority indicator
     - Subject category
     - Claim button
  
  2. MY CLAIMED DOUBTS (In progress)
     [Doubts assigned to me]
     - Response input area
     - Answer textarea
     - Submit answer button
  
  3. PERFORMANCE PANEL
     - Response time graph
     - Resolution count
     - Rating
```

**API Integration:**
```jsx
API.get('/doubts/open')           // Unclaimed doubts
API.get('/doubts/claimed-by-me')  // My assignments
API.post('/doubts/:id/claim')     // Claim a doubt
API.put('/doubts/:id/answer')     // Submit answer
```

---

### 6. **KnowledgeBasePage** ⏳ READY

**Location:** `src/pages/KnowledgeBasePage.jsx`  
**Stitch Reference:** `stitch/knowledge_base/screen.png` + `stitch/knowledge_base/code.html`

**Layout:**
```jsx
Hero Section:
  - Large search bar (prominent)
  - Placeholder: "Search insights..."
  - Debounced search (500ms)

Filter Chips (Below search):
  - Subject filter
  - Difficulty (Easy, Medium, Hard)
  - Recency (Last week, Month, All time)
  - Most helpful (Sort toggle)

Results Section:
  Grid or List view with:
  - Doubt card showing:
    - Title (clickable)
    - Subject tag
    - Short answer preview
    - Helpful votes count
    - Timestamp
    - Faculty name

No Results State:
  - Icon
  - "No results found"
  - "Try adjusting filters or search term"

Pagination or Infinite Scroll:
  [Load more button at bottom]
```

**API Integration:**
```jsx
API.get('/doubts/knowledge-base', {
  search: query,
  subject: selectedSubject,
  difficulty: selectedDifficulty,
  sort: sortBy,
  page: pageNumber
})
```

---

### 7. **AdminDashboard** ⏳ READY

**Location:** `src/pages/AdminDashboard.jsx`  
**Stitch Reference:** `stitch/admin_dashboard/screen.png` + `stitch/admin_dashboard/code.html`

**Layout:**
```jsx
KPI Cards Section:
  - Total Users
  - Students Count
  - Faculty Count
  - Total Doubts Posted
  - Resolution Rate %

Analytics Charts:
  1. Doubts by Subject (Bar/Pie chart)
  2. Status Distribution (Donut chart)
  3. Weekly Trend (Line chart)

Management Tables:
  
  1. USERS TABLE
     Columns: Name | Email | Role | Status | Actions
     Actions: Edit | Deactivate | Delete
  
  2. DOUBTS MODERATION TABLE
     Columns: Title | Student | Status | Date | Actions
     Actions: Review | Moderate | Flag

Quick Action Panel:
  - Subject Management
  - Create announcement
  - System settings
```

**API Integration:**
```jsx
API.get('/admin/stats')          // KPI data
API.get('/admin/analytics')      // Chart data
API.get('/admin/users')          // Users table
API.get('/admin/doubts')         // Moderation table
API.delete('/admin/users/:id')   // Delete user
```

---

### 8. **LandingPage** ⏳ READY

**Location:** `src/pages/LandingPage.jsx`  
**Stitch Reference:** `stitch/landing_page/screen.png` + `stitch/landing_page/code.html`

**Sections:**
```jsx
Hero Section:
  - Headline (editorial style)
  - Subheading
  - CTA buttons: "Get Started" + "Explore Knowledge Base"
  - Background illustration/gradient

How It Works:
  3-step flow:
  1. [Icon] Student posts → "Post doubts clearly"
  2. [Icon] Faculty resolves → "Get expert answers"
  3. [Icon] Admin monitors → "Ensure quality"

Features Grid:
  - Feature cards with icons and descriptions
  - 4-6 features showcasing platform benefits

Trust Section:
  - Platform stats
  - Active users count
  - Doubts resolved
  - Faculty experts

Testimonials:
  - Student testimonial card
  - Faculty testimonial card
  - Carousel or static display

Bottom CTA:
  - "Ready to join?" heading
  - "Get Started" large button
  - "Learn more" link

Footer:
  - Company links
  - Resources
  - Social media
```

**No API needed** (Static content marketing page)

---

## 📋 Component Hierarchy

```
App.jsx
├── Navbar.jsx
├── Routes
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── LandingPage.jsx
│   ├── StudentDashboard.jsx
│   │   ├── SidebarNav.jsx
│   │   ├── TopNavBar.jsx
│   │   ├── StatCard.jsx (reused)
│   │   └── DoubtCard.jsx (reused)
│   ├── FacultyDashboard.jsx
│   │   ├── SidebarNav.jsx (reused)
│   │   ├── TopNavBar.jsx (reused)
│   │   ├── StatCard.jsx (reused)
│   │   └── DoubtCard.jsx (reused)
│   ├── PostDoubtPage.jsx
│   │   └── FormField.jsx (reused)
│   ├── KnowledgeBasePage.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FilterChips.jsx
│   │   └── DoubtCard.jsx (reused)
│   ├── AdminDashboard.jsx
│   │   ├── StatCard.jsx (reused)
│   │   ├── Chart.jsx
│   │   └── DataTable.jsx
│   └── 404.jsx
└── Footer.jsx
```

## 🎯 Implementation Priority

**Phase 1 (Week 1)** - Core Dashboard
1. RegisterPage
2. StudentDashboard
3. SidebarNav + TopNavBar (shared components)

**Phase 2 (Week 2)** - Content & Interaction
4. PostDoubtPage
5. KnowledgeBasePage
6. FacultyDashboard

**Phase 3 (Week 3)** - Admin & Landing
7. AdminDashboard
8. LandingPage

---

## ✅ Quality Gate Checklist

Before deploying each page:

- [ ] Visual matches Stitch screenshot
- [ ] All color tokens used (no hardcoded colors)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Form validation working
- [ ] API calls integrated
- [ ] Loading states shown
- [ ] Error states displayed
- [ ] Empty states handled
- [ ] Accessibility: focus rings, WCAG contrast
- [ ] No console errors
- [ ] Performance: Lighthouse score >90

---

**Ready to start implementation? Proceed with RegisterPage next!** 🚀
