// src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './SideBar';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = (state) => {
    setIsSidebarOpen(state !== undefined ? state : !isSidebarOpen);
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-active' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} onToggle={handleToggleSidebar} />
      
      <div className="dashboard-main">
        <Navbar />
        <main className="dashboard-content">
          <div className="content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;