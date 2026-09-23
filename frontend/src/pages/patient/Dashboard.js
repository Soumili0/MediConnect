import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientAPI, appointmentAPI, prescriptionAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activePrescriptions, setActivePrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientAPI.getByUserId(user.userId).then(r => {
      const pat = r.data.data;
      setProfile(pat);
      return Promise.all([
        appointmentAPI.getByPatient(pat.id),
        prescriptionAPI.getActive(pat.id),
      ]);
    }).then(([appts, presc]) => {
      setAppointments(appts.data.data || []);
      setActivePrescriptions(presc.data.data || []);
    }).finally(() => setLoading(false));
  }, [user.userId]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const upcoming = appointments.filter(a =>
    (a.status === 'PENDING' || a.status === 'CONFIRMED') &&
    new Date(a.appointmentDate) >= new Date(new Date().toDateString())
  );
  const completed = appointments.filter(a => a.status === 'COMPLETED');

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0891b2 0%, #4f46e5 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>
            Welcome, {user?.firstName}! 👋
          </h2>
          <p style={{ opacity: 0.8, marginTop: 4, fontSize: 14 }}>
            Manage your health appointments and medical records
          </p>
        </div>
        <button
          className="btn"
          onClick={() => navigate('/patient/doctors')}
          style={{ background: '#fff', color: '#4f46e5', fontWeight: 600, padding: '10px 20px' }}
        >
          🔍 Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="stat-cards">
        {[
          { label: 'Upcoming Appointments', value: upcoming.length, icon: '📅', bg: '#eff6ff' },
          { label: 'Total Appointments', value: appointments.length, icon: '🗓️', bg: '#f0fdf4' },
          { label: 'Active Prescriptions', value: activePrescriptions.length, icon: '💊', bg: '#fef9c3' },
          { label: 'Completed Visits', value: completed.length, icon: '✅', bg: '#ecfdf5' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, fontSize: 22 }}>{s.icon}</div>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming Appointments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Upcoming Appointments</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/patient/appointments')}>View All</button>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No upcoming appointments</h3>
              <p>Book one with a doctor</p>
            </div>
          ) : upcoming.slice(0, 4).map(a => (
            <div key={a.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: '1px solid var(--border)'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.doctorName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  📅 {new Date(a.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {a.appointmentTime}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🏥 {a.departmentName}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>

        {/* Active Prescriptions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Active Prescriptions</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/patient/prescriptions')}>View All</button>
          </div>
          {activePrescriptions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💊</div>
              <h3>No active prescriptions</h3>
            </div>
          ) : activePrescriptions.slice(0, 4).map(p => (
            <div key={p.id} style={{
              padding: '12px 0', borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.doctorName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                📆 Valid until: {new Date(p.validUntil).toLocaleDateString()}
              </div>
              {p.diagnosis && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  🩺 {p.diagnosis}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Profile completion notice */}
      {!profile?.dateOfBirth && (
        <div style={{
          marginTop: 20, padding: 16, background: '#fef9c3', borderRadius: 10,
          border: '1px solid #fde047', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <strong>⚠️ Complete your profile</strong>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Add your date of birth, blood group and emergency contact for better care.
            </p>
          </div>
          <button className="btn btn-sm btn-primary" onClick={() => navigate('/patient/profile')}>
            Update Profile
          </button>
        </div>
      )}
    </div>
  );
}
