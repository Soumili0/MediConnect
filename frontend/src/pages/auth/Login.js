import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const QUICK_LOGINS = [
  {
    label: 'Admin',
    icon: '👨‍💼',
    email: 'admin@mediconnect.com',
    password: 'admin123',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.10)',
    border: 'rgba(124,58,237,0.30)',
  },
  {
    label: 'Doctor',
    icon: '👨‍⚕️',
    email: 'arjun.sharma@mediconnect.com',
    password: 'LIC001',
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.10)',
    border: 'rgba(8,145,178,0.30)',
  },
  {
    label: 'Patient',
    icon: '👤',
    email: '',
    password: '',
    color: '#059669',
    bg: 'rgba(5,150,105,0.10)',
    border: 'rgba(5,150,105,0.30)',
    registerLink: true,
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const data = res.data.data;
      login(data);
      toast.success(`Welcome back, ${data.firstName}! 👋`);
      if (data.role === 'ADMIN')        navigate('/admin');
      else if (data.role === 'DOCTOR')  navigate('/doctor');
      else                              navigate('/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    if (acc.registerLink) { navigate('/register'); return; }
    setForm({ email: acc.email, password: acc.password });
    toast.info(`${acc.label} credentials filled ✓`, { autoClose: 1500 });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 52, height: 52, background: 'rgba(255,255,255,0.15)',
              borderRadius: 14, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 26,
            }}>🏥</div>
            <span style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
              MediConnect
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
            Hospital & Appointment Management System
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ borderRadius: 18, padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 22 }}>
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 44 }}
                  required
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 16, color: 'var(--text-muted)',
                  }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
                padding: '12px', fontSize: 15, fontWeight: 600,
                border: 'none', borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff', marginTop: 4,
                opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
              }}>
              {loading ? '⏳ Signing in...' : '🔐 Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ margin: '22px 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Quick Login
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Role cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {QUICK_LOGINS.map(acc => (
              <button key={acc.label} type="button" onClick={() => fillDemo(acc)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '12px 8px', borderRadius: 12,
                  border: `1.5px solid ${acc.border}`,
                  background: acc.bg, cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: 24 }}>{acc.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: acc.color }}>
                  {acc.label}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
                  {acc.registerLink ? '➕ Register' : 'Fill credentials'}
                </span>
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            New patient?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create account
            </Link>
          </p>
        </div>

        {/* Credentials hint */}
        <div style={{
          marginTop: 16, padding: '14px 16px',
          background: 'rgba(255,255,255,0.08)', borderRadius: 12,
          fontSize: 12, lineHeight: 2, color: 'rgba(255,255,255,0.6)',
        }}>
          <div style={{ color: '#fff', fontWeight: 600, marginBottom: 2 }}>📋 Demo Credentials</div>
          <div>
            👨‍💼 <strong style={{ color: '#c4b5fd' }}>Admin</strong>
            {' '}— admin@mediconnect.com /{' '}
            <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4 }}>
              admin123
            </code>
          </div>
          <div>
            👨‍⚕️ <strong style={{ color: '#67e8f9' }}>Doctor</strong>
            {' '}— arjun.sharma@mediconnect.com /{' '}
            <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 4 }}>
              LIC001
            </code>
          </div>
          <div>
            👤 <strong style={{ color: '#6ee7b7' }}>Patient</strong>
            {' '}— Register a new account
          </div>
        </div>

      </div>
    </div>
  );
}
