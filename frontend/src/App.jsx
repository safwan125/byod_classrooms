import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './routes/ProtectedRoute'

// Auth pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Layouts
import TeacherLayout from './layouts/TeacherLayout'
import StudentLayout from './layouts/StudentLayout'

// Teacher pages
import TeacherDashboard      from './pages/teacher/Dashboard'
import TeacherClassrooms     from './pages/teacher/Classrooms'
import TeacherStudents       from './pages/teacher/Students'
import TeacherActivityMonitor from './pages/teacher/ActivityMonitor'
import TeacherBlockedWebsites from './pages/teacher/BlockedWebsites'
import TeacherReports        from './pages/teacher/Reports'
import TeacherAnnouncements  from './pages/teacher/Announcements'
import TeacherSettings       from './pages/teacher/Settings'

// Student pages
import StudentDashboard  from './pages/student/Dashboard'
import JoinClassroom     from './pages/student/JoinClassroom'
import BrowseWebsite     from './pages/student/BrowseWebsite'
import MyActivity        from './pages/student/MyActivity'

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Teacher routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"        element={<TeacherDashboard />} />
              <Route path="classrooms"       element={<TeacherClassrooms />} />
              <Route path="students"         element={<TeacherStudents />} />
              <Route path="activity-monitor" element={<TeacherActivityMonitor />} />
              <Route path="blocked-websites" element={<TeacherBlockedWebsites />} />
              <Route path="reports"          element={<TeacherReports />} />
              <Route path="announcements"    element={<TeacherAnnouncements />} />
              <Route path="settings"         element={<TeacherSettings />} />
            </Route>

            {/* Student routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"       element={<StudentDashboard />} />
              <Route path="join-classroom"  element={<JoinClassroom />} />
              <Route path="browse"          element={<BrowseWebsite />} />
              <Route path="my-activity"     element={<MyActivity />} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
