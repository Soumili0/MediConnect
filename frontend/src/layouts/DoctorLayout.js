import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const TITLES = {
  '/doctor': 'Doctor Dashboard',
  '/doctor/appointments': 'My Appointments',
  '/doctor/patients': 'My Patients',
  '/doctor/prescriptions': 'Prescriptions',
};

export default function DoctorLayout() {
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Doctor';
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
