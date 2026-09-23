import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title }) {
  const { user } = useAuth();
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>{title || 'Dashboard'}</h2>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'none' }}>{now}</span>
      </div>
      <div className="topbar-right">
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{now}</div>
        <div className="topbar-user">
          <div className="avatar">{initials}</div>
          <div className="topbar-user-info">
            <h4>{user?.firstName} {user?.lastName}</h4>
            <p>{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
