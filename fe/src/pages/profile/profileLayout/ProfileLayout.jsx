import React from "react";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/footer/Footer";
import ProfileSidebar from "../ProfileSidebar";
import "./ProfileLayout.css";

const ProfileLayout = ({ children }) => (
  <>
    <Header />
    <div className="profile-layout-row">
      <div className="profile-sidebar-wrap">
        <ProfileSidebar />
      </div>
      <main className="profile-main-content">
        {children}
      </main>
    </div>
    <Footer />
  </>
);

export default ProfileLayout; 