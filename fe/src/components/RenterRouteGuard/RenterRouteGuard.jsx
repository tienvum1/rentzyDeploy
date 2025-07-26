import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserChatPage from "../../pages/profile/myAccount/UserChatPage";

const RenterRouteGuard = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const isRenter =
    isAuthenticated && user && user.role && user.role.includes("renter");

  return (
    <div>
      {isRenter && <UserChatPage />}
      {children ? children : <Outlet />}
    </div>
  );
};

export default RenterRouteGuard;
