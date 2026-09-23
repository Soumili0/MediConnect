import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const TITLES = {
  '/admin': 'Admin Dashboard',
  '/admin/doctors': 'Manage Doctors',
  '/admin/patients': 'Manage Patients',
  '/admin/departments': 'Manage Departments',
  '/admin/appointments': 'Manage Appointments',
};

export default function AdminLayout() {
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Admin';
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} />
        <div className="page-content"><Outlet /></div>
      </div>
    </div>
  );
}
