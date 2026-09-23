import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI, prescriptionAPI } from '../../services/api';
import Modal from '../../components/Modal';

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    patientAPI.getByUserId(user.userId).then(r => {
      return prescriptionAPI.getByPatient(r.data.data.id);
    }).then(r => {
      setPrescriptions(r.data.data || []);
    }).finally(() => setLoading(false));
  }, [user.userId]);

  const parseMeds = (medicines) => {
    if (!medicines) return [];
    try { return JSON.parse(medicines); }
    catch { return [{ name: medicines, dosage: '', frequency: '', duration: '' }]; }
  };

  const filtered = filter === 'ALL'
    ? prescriptions
    : filter === 'ACTIVE'
    ? prescriptions.filter(p => p.active && new Date(p.validUntil) >= new Date())
    : prescriptions.filter(p => !p.active || new Date(p.validUntil) < new Date());

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>My Prescriptions</h1>
          <p>{prescriptions.length} total prescriptions</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['ALL', 'ACTIVE', 'EXPIRED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>No prescriptions found</h3>
            <p>Prescriptions will appear here after your doctor visits</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 16 }}>
          {filtered.map(p => {
            const meds = parseMeds(p.medicines);
            const isExpired = !p.active || new Date(p.validUntil) < new Date();
            return (
              <div key={p.id} className="card" style={{ padding: 20 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600 }}>{p.doctorName}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      📆 {new Date(p.prescriptionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge ${isExpired ? 'badge-cancelled' : 'badge-active'}`}>
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>

                {p.diagnosis && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                    🩺 {p.diagnosis}
                  </p>
                )}

                {/* Medicines */}
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    Medicines
                  </p>
                  {meds.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No medicines listed</p>
                  ) : meds.slice(0, 3).map((m, i) => (
                    <div key={i} style={{
                      padding: '6px 10px', background: '#f8fafc', borderRadius: 6,
                      marginBottom: 4, fontSize: 13
                    }}>
                      <strong>{m.name}</strong>
                      {m.dosage && <span style={{ color: 'var(--text-muted)' }}> · {m.dosage}</span>}
                      {m.frequency && <span style={{ color: 'var(--text-muted)' }}> · {m.frequency}</span>}
                    </div>
                  ))}
                  {meds.length > 3 && (
                    <p style={{ fontSize: 12, color: 'var(--primary)', marginTop: 4 }}>
                      +{meds.length - 3} more...
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Valid until: {new Date(p.validUntil).toLocaleDateString()}
                  </span>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setSelected(p)}
                  >
                    👁️ Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Prescription Details"
        size="md"
      >
        {selected && (
          <div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{selected.doctorName}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Date: {new Date(selected.prescriptionDate).toLocaleDateString()} · Valid until: {new Date(selected.validUntil).toLocaleDateString()}
              </div>
            </div>

            {selected.diagnosis && (
              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <p style={{ fontSize: 14 }}>{selected.diagnosis}</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Medicines</label>
              {parseMeds(selected.medicines).map((m, i) => (
                <div key={i} style={{
                  padding: '10px 14px', border: '1px solid var(--border)',
                  borderRadius: 8, marginBottom: 8
                }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>💊 {m.name}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                    {m.dosage && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Dosage: {m.dosage}</span>}
                    {m.frequency && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Frequency: {m.frequency}</span>}
                    {m.duration && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Duration: {m.duration}</span>}
                  </div>
                </div>
              ))}
            </div>

            {selected.instructions && (
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>{selected.instructions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
