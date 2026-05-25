# SecureClass BYOD

> **Securing and Increasing Productivity in BYOD Classrooms**

A full-stack academic project that helps educational institutions manage and monitor BYOD (Bring Your Own Device) classroom environments — improving security and student productivity through real-time monitoring, website blocking, and analytics.

---

## 🌟 Features

### Teacher Features
- 📊 **Analytics Dashboard** — Real-time stats: total students, active today, blocked sites, productivity score
- 🏫 **Classroom Management** — Create, edit, delete classrooms with auto-generated join codes
- 👨‍🎓 **Student Monitoring** — View all enrolled students with per-student productivity scores
- 🔒 **Website Blocking** — Block distracting websites per classroom in real time
- 📈 **Activity Monitor** — Live auto-refreshing feed of student browsing activity
- 📢 **Announcements** — Send announcements to specific classrooms
- 📉 **Reports** — Charts: daily trends, top websites, student productivity breakdown

### Student Features
- 🎓 **Join Classrooms** — Join via 6-character class code
- 🌐 **Browse Website** — Check if a site is blocked before visiting; log activity
- 🚫 **Access Blocked Page** — Animated full-screen blocked page for restricted sites
- 📋 **My Activity** — Paginated personal activity history with productivity stats

---

## 🛠 Tech Stack

### Backend
| Technology | Version |
|---|---|
| PHP | 8.2+ |
| Laravel | 11 |
| Laravel Sanctum | Token Auth |
| SQLite | (default) / MySQL |
| REST API | Architecture |

### Frontend
| Technology | Version |
|---|---|
| React | 18.3 |
| Vite | 8 |
| Tailwind CSS | 3.4 |
| Framer Motion | 12 |
| Chart.js | 4.5 |
| React Router DOM | 6 |
| Axios | 1.x |
| Lucide React | 0.525 |

---

## 📁 Project Structure

```
byod/
├── backend/                    # Laravel 11 REST API
│   ├── app/
│   │   ├── Http/Controllers/   # API Controllers
│   │   └── Models/             # Eloquent Models
│   ├── database/
│   │   ├── migrations/         # DB Schema
│   │   └── seeders/            # Demo Data
│   └── routes/
│       └── api.php             # API Routes
│
└── frontend/                   # React + Vite SPA
    └── src/
        ├── pages/
        │   ├── auth/           # Login, Register
        │   ├── teacher/        # 8 Teacher pages
        │   └── student/        # 4 Student pages
        ├── layouts/            # TeacherLayout, StudentLayout
        ├── context/            # AuthContext, ToastContext
        ├── services/           # Axios API service
        └── routes/             # ProtectedRoute guard
```

---

## ⚙️ Installation Guide

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm

---

### 1. Clone / Open the Project

```bash
cd C:\Users\safwa\Desktop\byod
```

---

### 2. Backend Setup (Laravel)

```bash
cd backend
```

**Install dependencies:**
```bash
composer install
```

**Environment setup:**
```bash
cp .env.example .env
php artisan key:generate
```

**Configure database** (`.env`):

*Option A — SQLite (default, no setup needed):*
```env
DB_CONNECTION=sqlite
```

*Option B — MySQL:*
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=secureclass_byod
DB_USERNAME=root
DB_PASSWORD=your_password
```

**Run migrations & seed demo data:**
```bash
php artisan migrate:fresh --seed
```

**Start the API server:**
```bash
php artisan serve
```
> API runs on: `http://localhost:8000`

---

### 3. Frontend Setup (React)

```bash
cd ../frontend
```

**Install dependencies:**
```bash
npm install --legacy-peer-deps
```

**Start the dev server:**
```bash
npm run dev
```
> App runs on: `http://localhost:5173` (or `5174` if 5173 is in use)

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Teacher** | teacher@example.com | password |
| **Student 1** | student1@example.com | password |
| **Student 2** | student2@example.com | password |
| ... | student3–10@example.com | password |

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/register            Register new user
POST   /api/login               Login
POST   /api/logout              Logout (auth required)
GET    /api/user                Get current user
```

### Dashboard
```
GET    /api/dashboard/stats     Teacher dashboard stats
GET    /api/dashboard/overview  Activity trends + recent feed
```

### Classrooms
```
GET    /api/classrooms          List classrooms
POST   /api/classrooms          Create classroom
GET    /api/classrooms/{id}     Get classroom details
PUT    /api/classrooms/{id}     Update classroom
DELETE /api/classrooms/{id}     Delete classroom
POST   /api/classrooms/join     Join classroom (student)
GET    /api/classrooms/{id}/students    Student list with productivity
```

### Activity
```
POST   /api/activity/store          Log activity (checks if blocked)
POST   /api/activity/check-site     Check if site is blocked
GET    /api/my-activities           Personal activity history
GET    /api/classrooms/{id}/activities  Classroom activity feed
```

### Blocked Sites
```
GET    /api/classrooms/{id}/blocked-sites   List blocked sites
POST   /api/block-site                      Block a website
DELETE /api/blocked-sites/{id}              Unblock a website
```

### Announcements
```
GET    /api/classrooms/{id}/announcements   List announcements
POST   /api/announcements                   Create announcement
DELETE /api/announcements/{id}              Delete announcement
```

### Reports
```
GET    /api/classrooms/{id}/reports    Full analytics report
```

### Devices
```
GET    /api/devices                      My devices
GET    /api/classrooms/{id}/devices      Classroom devices (teacher)
```

---

## 🌱 Seeded Demo Data

- **1 teacher account** — Dr. Sarah Johnson
- **10 student accounts** — Alice, Bob, Carol, David, Emma, Frank, Grace, Henry, Iris, Jack
- **2 classrooms** — Computer Science 101 (code: `CS1010`), Web Development Advanced (code: `WD2025`)
- **5 blocked websites** — youtube.com, facebook.com, instagram.com, tiktok.com, twitter.com
- **3 announcements** across classrooms
- **7 days of activity data** — 350+ activity records with educational/non-educational breakdown

---

## 🔒 Security

- **Laravel Sanctum** Bearer token authentication
- **Password hashing** with bcrypt
- **Role-based access control** — teacher/student middleware guards
- **Input validation** on all API endpoints
- **Authorization checks** on all mutation endpoints
- **CORS configuration** for cross-origin frontend requests

---

## 📸 Screenshots

| Page | Description |
|---|---|
| Login | Split-screen with feature list + login form |
| Register | Role selector (Teacher/Student) + form |
| Teacher Dashboard | Stats cards + Chart.js analytics + activity feed |
| Classrooms | Grid view with join codes + CRUD modals |
| Activity Monitor | Live auto-refreshing table |
| Blocked Websites | Add/remove blocked domains per classroom |
| Reports | Bar/Line/Doughnut charts + student breakdown |
| Student Dashboard | Productivity bar + classroom list + announcements |
| Browse Website | URL checker + full-screen BLOCKED animation |

---

## 🚀 Running the Full Application

```bash
# Terminal 1 — Backend
cd backend
php artisan serve

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Then open: **http://localhost:5173** (or 5174)

---

## 📝 Notes

- The website blocking system is **simulated within the app** (no OS-level blocking) — suitable for a college academic project demonstration
- Auto-refresh in Activity Monitor polls every 10 seconds
- All charts use Chart.js 4 via react-chartjs-2
- Animations powered by Framer Motion 12

---

*SecureClass BYOD — College Academic Project | Laravel 11 + React 18*
