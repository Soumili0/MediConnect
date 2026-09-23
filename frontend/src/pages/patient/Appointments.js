import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { patientAPI, appointmentAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function PatientAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const load = React.useCallback(() => {
    patientAPI.getByUserId(user.userId).then(r => {
      const id = r.data.data.id;
      return appointmentAPI.getByPatient(id);
    }).then(r => {
      setAppointments(r.data.data || []);
    }).finally(() => setLoading(false));
  }, [user.userId]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      toast.success('Appointment cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const filtered = filter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const counts = appointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>My Appointments</h1>
          <p>{appointments.length} total appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/patient/doctors')}>
          ➕ Book New
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'All', count: appointments.length },
          { key: 'PENDING', label: 'Pending', count: counts.PENDING || 0 },
          { key: 'CONFIRMED', label: 'Confirmed', count: counts.CONFIRMED || 0 },
          { key: 'COMPLETED', label: 'Completed', count: counts.COMPLETED || 0 },
          { key: 'CANCELLED', label: 'Cancelled', count: counts.CANCELLED || 0 },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointments found</h3>
            <p>Book an appointment with a doctor</p>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/patient/doctors')}>
              Find Doctors
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => (
            <div key={a.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                {/* Left */}
                <div style={{ display: 'flex', gap: 14 }}>
                  <div className="avatar avatar-lg" style={{ background: '#4f46e5' }}>
                    {a.doctorName?.split(' ').find(n => n !== 'Dr.')?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{a.doctorName}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>🏥 {a.departmentName}</p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13 }}>
                        📅 {new Date(a.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span style={{ fontSize: 13 }}>⏰ {a.appointmentTime}</span>
                      <span style={{ fontSize: 13 }}>💰 ₹{a.consultationFee || 0}</span>
                      <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                        {a.type?.replace('_', ' ')}
                      </span>
                    </div>
                    {a.reason && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                        📝 {a.reason}
                      </p>
                    )}
                    {a.diagnosis && (
                      <p style={{ fontSize: 13, color: '#059669', marginTop: 4 }}>
                        🩺 Diagnosis: {a.diagnosis}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <StatusBadge status={a.status} />
                  {(a.status === 'PENDING' || a.status === 'CONFIRMED') &&
                    new Date(a.appointmentDate) > new Date() && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancel(a.id)}
                      >
                        ✕ Cancel
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
