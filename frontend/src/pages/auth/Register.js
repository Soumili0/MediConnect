import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = () => {
    const len = form.password.length;
    if (len === 0) return null;
    if (len < 6)  return { level: 1, label: 'Too short', color: '#ef4444' };
    if (len < 10) return { level: 2, label: 'Weak',      color: '#f59e0b' };
    if (len < 14) return { level: 3, label: 'Good',      color: '#3b82f6' };
    return          { level: 4, label: 'Strong',     color: '#10b981' };
  };
  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register(form); // backend always creates PATIENT
      const data = res.data.data;
      login(data);
      toast.success(`Welcome to MediConnect, ${data.firstName}! 🎉`);
      navigate('/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 50, height: 50, background: 'rgba(255,255,255,0.15)',
              borderRadius: 13, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 26,
            }}>🏥</div>
            <span style={{ color: '#fff', fontSize: 27, fontWeight: 800, letterSpacing: -0.5 }}>
              MediConnect
            </span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
            Hospital & Appointment Management System
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ borderRadius: 18, padding: 28 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 44, height: 44, background: '#ecfdf5', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>👤</div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Patient Registration</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Create your account to book appointments
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-control" placeholder="John"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-control" placeholder="Doe"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  required />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input className="form-control" type="email" placeholder="john@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input className="form-control" placeholder="+91 98765 43210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password * (min 6 characters)</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 44 }}
                  required minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
                    color: 'var(--text-muted)',
                  }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Strength bar */}
              {strength && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength.level ? strength.color : '#e2e8f0',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
                padding: '12px', fontSize: 15, fontWeight: 600,
                border: 'none', borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff', marginTop: 8, transition: 'opacity 0.2s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '⏳ Creating account...' : '✅ Create Patient Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>

        {/* Info note */}
        <div style={{
          marginTop: 14, padding: '12px 16px',
          background: 'rgba(255,255,255,0.08)', borderRadius: 10,
          fontSize: 12, lineHeight: 1.8,
          color: 'rgba(255,255,255,0.6)',
        }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#fff', fontWeight: 600 }}>ℹ️ Account Types</span>
          </div>
          <div>👤 <strong style={{ color: '#a5f3fc' }}>Patient</strong> — Register here</div>
          <div>👨‍⚕️ <strong style={{ color: '#6ee7b7' }}>Doctor</strong> — Account created by Admin</div>
          <div>👨‍💼 <strong style={{ color: '#c4b5fd' }}>Admin</strong> — System account only</div>
        </div>

      </div>
    </div>
  );
}
