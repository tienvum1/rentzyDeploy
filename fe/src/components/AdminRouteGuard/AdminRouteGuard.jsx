import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRouteGuard = ({ children }) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    // Wait for auth loading to complete
    if (isLoading) {
        console.log('AdminRouteGuard: Loading auth...');
        return null; // Or a loading spinner
    }

    console.log('AdminRouteGuard Check:');
    console.log('  isAuthenticated:', isAuthenticated);
    console.log('  user:', user);
    console.log('  user.role:', user?.role);

    // Check if authenticated AND user exists AND user has role 'admin'
    const isAdmin = isAuthenticated  && 
                   user.role && user.role.includes('admin');

    if (isAdmin) {
        console.log('AdminRouteGuard: Access granted.');
        // If user is an admin, render the children (the route content)
        return children ? children : <Outlet />;
    } else {
        console.log('AdminRouteGuard: Access denied, redirecting to /login.');
        // If not admin, redirect to login page
        return <Navigate to="/login" replace />;
    }
};

export default AdminRouteGuard; 