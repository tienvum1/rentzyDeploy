import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path if necessary

const OwnerRouteGuard = ({ children }) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    // Wait for auth loading to complete
    if (isLoading) {
        console.log('OwnerRouteGuard: Loading auth...');
        return null; // Or a loading spinner
    }

    console.log('OwnerRouteGuard Check:');
    console.log('  isAuthenticated:', isAuthenticated);
    console.log('  user:', user);
    console.log('  user.role:', user?.role);
    console.log('  phê duyệt cho thuê xe  owner_request_status:', user?.owner_request_status);

    // Check if authenticated AND user exists AND user has role 'owner' AND owner_request_owner_status is 'approved'
    const isApprovedOwner = isAuthenticated && user && 
                            user.role && user.role.includes('owner') && 
                            user.owner_request_status == 'approved';

                            
    if (isApprovedOwner) {
        console.log('OwnerRouteGuard: Access granted.');
        // If user is an approved owner, render the children (the route content)
        return children ? children : <Outlet />;
    } else {
        console.log('OwnerRouteGuard: Access denied, redirecting to /consignForm.');
        // If not, redirect to the consign form page
        // Consider redirecting to home or a specific denial page if they are 'pending' or other status
        return <Navigate to="/consignForm" replace />;
    }
};

export default OwnerRouteGuard; 