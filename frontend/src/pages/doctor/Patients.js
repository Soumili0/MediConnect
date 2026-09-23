import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI, appointmentAPI, recordAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';

export default function DoctorPatients() {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [records, setRecords] = useState([]);
  const [recModal, setRecModal] = useState(false);
  const [recForm, setRecForm] = useState({ title: '', diagnosis: '', symptoms: '', treatment: '', notes: '', bloodPressure: '', heartRate: '', temperature: '', weight: '', height: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    doctorAPI.getByUserId(user.userId).then(r => {
      const id = r.data.data.id;
      setDoctorId(id);
      return appointmentAPI.getByDoctor(id);
    }).then(r => {
      const appts = r.data.data || [];
      // Unique patients
      const map = {};
      appts.forEach(a => { if (!map[a.patientId]) map[a.patientId] = { id: a.patientId, name: a.patientName, appointmentCount: 0 }; map[a.patientId].appointmentCount++; });
      setPatients(Object.values(map));
    }).finally(() => setLoading(false));
  }, [user.userId]);

  const viewRecords = async (p) => {
    setSelected(p);
    const r = await recordAPI.getDoctorPatientRecords(p.id);
    setRecords(r.data.data || []);
  };

  const handleAddRecord = async () => {
    setSaving(true);
    try {
      await recordAPI.create({ ...recForm, patientId: selected.id, doctorId });
      toast.success('Record added');
      setRecModal(false);
      viewRecords(selected);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>My Patients</h1><p>{patients.length} unique patients</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Patient</th><th>Appointments</th><th>Actions</th></tr></thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td colSpan={3}><div className="empty-state"><div className="empty-icon">👤</div><p>No patients yet</p></div></td></tr>
                ) : patients.map(p => (
                  <tr key={p.id} style={{ cursor: 'pointer', background: selected?.id === p.id ? '#f0f0ff' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar">{p.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>{p.appointmentCount} visits</span></td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => viewRecords(p)}>📋 Records</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Records: {selected.name}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-primary" onClick={() => setRecModal(true)}>➕ Add</button>
                <button className="btn-icon" onClick={() => setSelected(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>
            </div>
            {records.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📋</div><p>No records yet</p></div>
            ) : records.map(r => (
              <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 14 }}>{r.title}</strong>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.recordDate}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{r.diagnosis}</p>
                {r.bloodPressure && <span style={{ fontSize: 11, background: '#dbeafe', color: '#1d4ed8', borderRadius: 4, padding: '2px 6px', marginRight: 4 }}>BP: {r.bloodPressure}</span>}
                {r.heartRate && <span style={{ fontSize: 11, background: '#fce7f3', color: '#9d174d', borderRadius: 4, padding: '2px 6px', marginRight: 4 }}>HR: {r.heartRate}</span>}
                {r.temperature && <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '2px 6px' }}>Temp: {r.temperature}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={recModal} onClose={() => setRecModal(false)} title="Add Medical Record" size="lg"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setRecModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAddRecord} disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</button>
        </>}>
        <div className="form-group"><label className="form-label">Title *</label><input className="form-control" value={recForm.title} onChange={e => setRecForm({ ...recForm, title: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Diagnosis *</label><textarea className="form-control" rows={3} value={recForm.diagnosis} onChange={e => setRecForm({ ...recForm, diagnosis: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Symptoms</label><textarea className="form-control" rows={2} value={recForm.symptoms} onChange={e => setRecForm({ ...recForm, symptoms: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Treatment</label><textarea className="form-control" rows={2} value={recForm.treatment} onChange={e => setRecForm({ ...recForm, treatment: e.target.value })} /></div>
        <div className="form-row-3">
          <div className="form-group"><label className="form-label">Blood Pressure</label><input className="form-control" placeholder="120/80" value={recForm.bloodPressure} onChange={e => setRecForm({ ...recForm, bloodPressure: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Heart Rate</label><input className="form-control" placeholder="72 bpm" value={recForm.heartRate} onChange={e => setRecForm({ ...recForm, heartRate: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Temperature</label><input className="form-control" placeholder="98.6°F" value={recForm.temperature} onChange={e => setRecForm({ ...recForm, temperature: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Weight</label><input className="form-control" placeholder="70 kg" value={recForm.weight} onChange={e => setRecForm({ ...recForm, weight: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Height</label><input className="form-control" placeholder="175 cm" value={recForm.height} onChange={e => setRecForm({ ...recForm, height: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={recForm.notes} onChange={e => setRecForm({ ...recForm, notes: e.target.value })} /></div>
      </Modal>
    </div>
  );
}
