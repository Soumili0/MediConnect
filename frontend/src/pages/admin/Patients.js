import React, { useEffect, useState } from 'react';
import { patientAPI } from '../../services/api';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => patientAPI.getAll().then(r => setPatients(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length > 1) {
      const r = await patientAPI.search(q);
      setPatients(r.data.data || []);
    } else if (q.length === 0) {
      load();
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>{patients.length} registered patients</p>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="form-control" style={{ maxWidth: 360 }} placeholder="Search by name, email, phone..."
              value={search} onChange={e => handleSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th>Patient</th><th>Phone</th><th>Gender</th><th>Blood Group</th><th>Age</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {patients.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">👤</div><p>No patients found</p></div></td></tr>
              ) : patients.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{p.firstName?.[0]}{p.lastName?.[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.phone || '—'}</td>
                  <td>{p.gender || '—'}</td>
                  <td>{p.bloodGroup || '—'}</td>
                  <td>{p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth)) / (365.25 * 24 * 3600 * 1000)) + ' yrs' : '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => setSelected(p)}>👁️ View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Panel */}
      {selected && (
        <div style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: 380,
          background: 'var(--white)', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          zIndex: 200, padding: 24, overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3>Patient Details</h3>
            <button className="btn-icon" onClick={() => setSelected(null)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div className="avatar avatar-lg" style={{ margin: '0 auto 10px' }}>{selected.firstName?.[0]}{selected.lastName?.[0]}</div>
            <h3>{selected.firstName} {selected.lastName}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selected.email}</p>
          </div>
          {[
            ['Phone', selected.phone], ['Gender', selected.gender], ['Blood Group', selected.bloodGroup],
            ['Date of Birth', selected.dateOfBirth], ['Address', selected.address],
            ['Emergency Contact', selected.emergencyContactName ? `${selected.emergencyContactName} - ${selected.emergencyContact}` : selected.emergencyContact],
            ['Allergies', selected.allergies], ['Chronic Diseases', selected.chronicDiseases],
          ].map(([k, v]) => v && (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</div>
              <div style={{ marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
