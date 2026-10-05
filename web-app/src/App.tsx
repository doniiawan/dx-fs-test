import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { EmployeeLayout } from '@/components/EmployeeLayout';
import { ProfilePage } from '@/pages/employee/ProfilePage';
import { AttendancePage } from '@/pages/employee/AttendancePage';
import { SummaryPage } from '@/pages/employee/SummaryPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Route - Employee */}
          <Route element={<ProtectedRoute requiredRole="EMPLOYEE" />}>
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="summary" element={<SummaryPage />} />
            </Route>
          </Route>

          {/* Protected Route - Admin HRD */}
          <Route element={<ProtectedRoute requiredRole="HRD_ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}