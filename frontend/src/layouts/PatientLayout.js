import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const TITLES = {
  '/patient': 'My Dashboard',
  '/patient/doctors': 'Find Doctors',
  '/patient/appointments': 'My Appointments',
  '/patient/prescriptions': 'My Prescriptions',
  '/patient/records': 'Medical Records',
  '/patient/profile': 'My Profile',
};

export default function PatientLayout() {
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Patient';
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
