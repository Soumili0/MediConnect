import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI, recordAPI } from '../../services/api';
import Modal from '../../components/Modal';

export default function PatientRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    patientAPI.getByUserId(user.userId).then(r => {
      return recordAPI.getByPatient(r.data.data.id);
    }).then(r => {
      setRecords(r.data.data || []);
    }).finally(() => setLoading(false));
  }, [user.userId]);

  const filtered = records.filter(r =>
    !search || `${r.title} ${r.diagnosis} ${r.doctorName}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Medical Records</h1>
          <p>{records.length} records in your history</p>
        </div>
      </div>

      {/* Search */}
      <div className="search-box" style={{ marginBottom: 20, maxWidth: 400 }}>
        <span className="search-icon">🔍</span>
        <input
          className="form-control"
          placeholder="Search by title, diagnosis, doctor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No medical records</h3>
            <p>Your medical records will appear here after doctor visits</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 36, height: 36, background: '#eff6ff', borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                    }}>📋</div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600 }}>{r.title}</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {r.doctorName} · {new Date(r.recordDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    🩺 {r.diagnosis}
                  </p>

                  {/* Vitals */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {r.bloodPressure && (
                      <span style={{ fontSize: 11, padding: '2px 8px', background: '#dbeafe', color: '#1d4ed8', borderRadius: 20 }}>
                        BP: {r.bloodPressure}
                      </span>
                    )}
                    {r.heartRate && (
                      <span style={{ fontSize: 11, padding: '2px 8px', background: '#fce7f3', color: '#9d174d', borderRadius: 20 }}>
                        HR: {r.heartRate}
                      </span>
                    )}
                    {r.temperature && (
                      <span style={{ fontSize: 11, padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: 20 }}>
                        Temp: {r.temperature}
                      </span>
                    )}
                    {r.weight && (
                      <span style={{ fontSize: 11, padding: '2px 8px', background: '#d1fae5', color: '#065f46', borderRadius: 20 }}>
                        Wt: {r.weight}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setSelected(r)}
                >
                  👁️ View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Medical Record Details"
        size="lg"
      >
        {selected && (
          <div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{selected.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {selected.doctorName} · {new Date(selected.recordDate).toLocaleDateString()}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['Diagnosis', selected.diagnosis],
                ['Symptoms', selected.symptoms],
                ['Treatment', selected.treatment],
                ['Lab Results', selected.labResults],
              ].map(([label, value]) => value && (
                <div key={label} style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">{label}</label>
                  <p style={{ fontSize: 14, lineHeight: 1.6 }}>{value}</p>
                </div>
              ))}
            </div>

            {(selected.bloodPressure || selected.heartRate || selected.temperature || selected.weight || selected.height) && (
              <div style={{ marginTop: 16 }}>
                <label className="form-label">Vital Signs</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                  {[
                    ['Blood Pressure', selected.bloodPressure, '#dbeafe'],
                    ['Heart Rate', selected.heartRate, '#fce7f3'],
                    ['Temperature', selected.temperature, '#fef3c7'],
                    ['Weight', selected.weight, '#d1fae5'],
                    ['Height', selected.height, '#e0e7ff'],
                  ].filter(([, v]) => v).map(([label, value, bg]) => (
                    <div key={label} style={{ padding: '10px', background: bg, borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.notes && (
              <div style={{ marginTop: 16 }}>
                <label className="form-label">Notes</label>
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
