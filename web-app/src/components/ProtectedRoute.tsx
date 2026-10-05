import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    requiredRole?: 'EMPLOYEE' | 'HRD_ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // Redirect ke dashboard masing-masing jika role tidak sesuai
        return <Navigate to={user?.role === 'HRD_ADMIN' ? '/admin/dashboard' : '/employee/profile'} replace />;
    }

    return <Outlet />;
};