import React, { useEffect, useState } from 'react';
import { appointmentAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    appointmentAPI.getAll().then(r => setAppointments(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = appointments.filter(a => {
    const matchStatus = filter === 'ALL' || a.status === filter;
    const matchSearch = !search || `${a.patientName} ${a.doctorName} ${a.departmentName}`.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = appointments.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>All Appointments</h1><p>{appointments.length} total appointments</p></div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}>
            {s} {s !== 'ALL' && counts[s] ? `(${counts[s]})` : s === 'ALL' ? `(${appointments.length})` : '(0)'}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="form-control" style={{ maxWidth: 360 }} placeholder="Search patient, doctor, department..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th>Patient</th><th>Doctor</th><th>Department</th><th>Date</th><th>Time</th><th>Type</th><th>Fee</th><th>Status</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">📅</div><p>No appointments found</p></div></td></tr>
              ) : filtered.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.patientName}</td>
                  <td>{a.doctorName}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{a.departmentName}</td>
                  <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                  <td>{a.appointmentTime}</td>
                  <td><span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{a.type?.replace('_', ' ')}</span></td>
                  <td>₹{a.consultationFee || 0}</td>
                  <td><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
