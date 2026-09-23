import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_MENU = [
  { label: 'Dashboard', icon: '📊', path: '/admin' },
  { label: 'Doctors', icon: '👨‍⚕️', path: '/admin/doctors' },
  { label: 'Patients', icon: '👤', path: '/admin/patients' },
  { label: 'Departments', icon: '🏥', path: '/admin/departments' },
  { label: 'Appointments', icon: '📅', path: '/admin/appointments' },
];

const DOCTOR_MENU = [
  { label: 'Dashboard', icon: '📊', path: '/doctor' },
  { label: 'Appointments', icon: '📅', path: '/doctor/appointments' },
  { label: 'Patients', icon: '👤', path: '/doctor/patients' },
  { label: 'Prescriptions', icon: '💊', path: '/doctor/prescriptions' },
];

const PATIENT_MENU = [
  { label: 'Dashboard', icon: '📊', path: '/patient' },
  { label: 'Find Doctors', icon: '🔍', path: '/patient/doctors' },
  { label: 'Appointments', icon: '📅', path: '/patient/appointments' },
  { label: 'Prescriptions', icon: '💊', path: '/patient/prescriptions' },
  { label: 'Medical Records', icon: '📋', path: '/patient/records' },
  { label: 'My Profile', icon: '👤', path: '/patient/profile' },
];

const MENUS = { ADMIN: ADMIN_MENU, DOCTOR: DOCTOR_MENU, PATIENT: PATIENT_MENU };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menu = MENUS[user?.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏥</div>
        <span>MediConnect</span>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Main Menu</div>
        {menu.map((item) => (
          <button
            key={item.path}
            className={`sidebar-item${location.pathname === item.path ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: '16px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding: '8px 16px', marginBottom: 8 }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{user?.role}</div>
        </div>
        <button
          className="sidebar-item"
          onClick={() => { logout(); navigate('/login'); }}
          style={{ color: '#f87171' }}
        >
          <span className="item-icon">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
