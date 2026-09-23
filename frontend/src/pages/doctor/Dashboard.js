import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI, appointmentAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
    doctorAPI.getByUserId(user.userId)
      .then(r => {
        const doc = r.data.data;
        setProfile(doc);
        return appointmentAPI.getByDoctor(doc.id);
      })
      .then(r => {
        setAppointments(r.data.data || []);
      })
      .catch(() => setProfileError(true))
      .finally(() => setLoading(false));
  }, [user.userId]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  // Doctor registered but profile not fully set up
  if (profileError || !profile) {
    return (
      <div className="fade-in">
        <div style={{
          background: 'linear-gradient(135deg, #0891b2, #0e7490)',
          borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff'
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>
            Welcome, Dr. {user?.firstName}! 👋
          </h2>
          <p style={{ opacity: 0.8, marginTop: 4, fontSize: 14 }}>Your account is pending setup by Admin.</p>
        </div>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Profile Setup Pending</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
            Your doctor profile has been created. An Admin will assign your <strong>department</strong>,
            <strong> specialization</strong>, and other details shortly.
            You'll be able to access all features once your profile is complete.
          </p>
          <div style={{
            display: 'inline-flex', gap: 12, padding: '14px 20px',
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
            fontSize: 13, color: '#166534'
          }}>
            <span>✅ Account created</span>
            <span>·</span>
            <span>📧 {user?.email}</span>
          </div>
        </div>
      </div>
    );
  }

  const today = appointments.filter(a => a.appointmentDate === new Date().toISOString().split('T')[0]);
  const pending = appointments.filter(a => a.status === 'PENDING');
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED');
  const completed = appointments.filter(a => a.status === 'COMPLETED');

  const isPending = profile.departmentName === 'Not Assigned' || profile.licenseNumber === 'PENDING';

  return (
    <div className="fade-in">
      {/* Setup warning banner */}
      {isPending && (
        <div style={{
          padding: '12px 20px', marginBottom: 20,
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 14
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <strong>Profile incomplete</strong> — Your department and specialization haven't been assigned yet.
            Please contact your Admin to complete your profile setup.
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0891b2, #0e7490)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff'
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Dr. {user?.firstName}! 👋
        </h2>
        <p style={{ opacity: 0.8, marginTop: 4, fontSize: 14 }}>
          {profile.specialization && profile.specialization !== 'General' ? profile.specialization : 'Doctor'}{' '}
          {profile.departmentName && profile.departmentName !== 'Not Assigned' ? `· ${profile.departmentName}` : ''}
        </p>
        <div style={{ display: 'flex', gap: 28, marginTop: 16, flexWrap: 'wrap' }}>
          <div><div style={{ fontSize: 28, fontWeight: 700 }}>{today.length}</div><div style={{ fontSize: 12, opacity: 0.7 }}>Today</div></div>
          <div><div style={{ fontSize: 28, fontWeight: 700 }}>{pending.length}</div><div style={{ fontSize: 12, opacity: 0.7 }}>Pending</div></div>
          <div><div style={{ fontSize: 28, fontWeight: 700 }}>{confirmed.length}</div><div style={{ fontSize: 12, opacity: 0.7 }}>Confirmed</div></div>
          <div><div style={{ fontSize: 28, fontWeight: 700 }}>{completed.length}</div><div style={{ fontSize: 12, opacity: 0.7 }}>Completed</div></div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {[
          { label: "Today's Patients", value: today.length, icon: '👥', bg: '#eff6ff' },
          { label: 'Total Appointments', value: appointments.length, icon: '📅', bg: '#ecfdf5' },
          { label: 'Pending', value: pending.length, icon: '⏳', bg: '#fffbeb' },
          { label: 'Completed', value: completed.length, icon: '✅', bg: '#f0fdf4' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="card" style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Today's Appointments</h3>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/doctor/appointments')}>
            View All →
          </button>
        </div>
        {today.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗓️</div>
            <h3>No appointments today</h3>
            <p>Enjoy your day!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th><th>Time</th><th>Type</th><th>Reason</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {today.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                          {a.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{a.patientName}</span>
                      </div>
                    </td>
                    <td>{a.appointmentTime}</td>
                    <td>
                      <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                        {a.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{a.reason || '—'}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>My Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, fontSize: 14 }}>
          {[
            ['🏥 Department',      profile.departmentName || 'Not Assigned'],
            ['🩺 Specialization',  profile.specialization || '—'],
            ['🎓 Qualification',   profile.qualification || '—'],
            ['⏱️ Experience',      profile.experienceYears ? `${profile.experienceYears} years` : '—'],
            ['💰 Consultation Fee', `₹${profile.consultationFee || 0}`],
            ['📅 Available Days',  profile.availableDays || '—'],
            ['🕒 Available Hours', profile.availableHours || '—'],
            ['🪪 License No.',     profile.licenseNumber === 'PENDING' ? '⚠️ Not assigned' : profile.licenseNumber || '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '12px', background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{k}</div>
              <div style={{ fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
