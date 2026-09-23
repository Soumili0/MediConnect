import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI, appointmentAPI, prescriptionAPI } from '../../services/api';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

const EMPTY_MED = { name: '', dosage: '', frequency: '', duration: '' };

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Diagnosis modal
  const [selected, setSelected] = useState(null);
  const [diagModal, setDiagModal] = useState(false);
  const [diagForm, setDiagForm] = useState({ diagnosis: '', notes: '' });

  // Prescription modal
  const [prescModal, setPrescModal] = useState(false);
  const [prescForm, setPrescForm] = useState({ diagnosis: '', instructions: '' });
  const [medicines, setMedicines] = useState([{ ...EMPTY_MED }]);

  const [saving, setSaving] = useState(false);

  const reload = useCallback((id) => {
    appointmentAPI.getByDoctor(id).then(r => setAppointments(r.data.data || []));
  }, []);

  useEffect(() => {
    doctorAPI.getByUserId(user.userId)
      .then(r => {
        const id = r.data.data.id;
        setDoctorId(id);
        return appointmentAPI.getByDoctor(id);
      })
      .then(r => setAppointments(r.data.data || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, [user.userId]);

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      reload(doctorId);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDiagnosis = async () => {
    if (!diagForm.diagnosis.trim()) { toast.error('Diagnosis is required'); return; }
    setSaving(true);
    try {
      await appointmentAPI.addDiagnosis(selected.id, diagForm);
      toast.success('Diagnosis saved & appointment completed ✅');
      setDiagModal(false);
      reload(doctorId);
    } catch {
      toast.error('Failed to save diagnosis');
    } finally { setSaving(false); }
  };

  const handlePrescription = async () => {
    const filledMeds = medicines.filter(m => m.name.trim());
    if (filledMeds.length === 0) { toast.error('Add at least one medicine'); return; }
    setSaving(true);
    try {
      await prescriptionAPI.create({
        appointmentId: selected.id,
        patientId: selected.patientId,
        doctorId,
        diagnosis: prescForm.diagnosis,
        instructions: prescForm.instructions,
        medicines: JSON.stringify(filledMeds),
      });
      toast.success('Prescription created 💊');
      setPrescModal(false);
      reload(doctorId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    } finally { setSaving(false); }
  };

  const addMedicine = () => setMedicines(m => [...m, { ...EMPTY_MED }]);
  const removeMedicine = (i) => setMedicines(m => m.filter((_, idx) => idx !== i));
  const updateMedicine = (i, field, value) =>
    setMedicines(m => m.map((med, idx) => idx === i ? { ...med, [field]: value } : med));

  const filtered = appointments.filter(a => {
    const matchStatus = filter === 'ALL' || a.status === filter;
    const matchSearch = !search ||
      `${a.patientName} ${a.reason || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

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
          <p>{appointments.length} total · {counts['PENDING'] || 0} pending</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'ALL',       label: 'All',       count: appointments.length },
          { key: 'PENDING',   label: 'Pending',   count: counts.PENDING || 0 },
          { key: 'CONFIRMED', label: 'Confirmed', count: counts.CONFIRMED || 0 },
          { key: 'COMPLETED', label: 'Completed', count: counts.COMPLETED || 0 },
          { key: 'CANCELLED', label: 'Cancelled', count: counts.CANCELLED || 0 },
        ].map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`}>
            {label} ({count})
          </button>
        ))}
      </div>

      <div className="card">
        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="form-control" style={{ maxWidth: 340 }}
              placeholder="Search patient name or reason..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Date</th><th>Time</th><th>Type</th>
                <th>Reason</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <p>No appointments found</p>
                  </div>
                </td></tr>
              ) : filtered.map(a => (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                        {a.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{a.patientName}</span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(a.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>{a.appointmentTime}</td>
                  <td>
                    <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                      {a.type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 160 }}>
                    {a.reason || '—'}
                  </td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                      {a.status === 'PENDING' && (
                        <button className="btn btn-sm btn-success"
                          onClick={() => updateStatus(a.id, 'CONFIRMED')}>
                          ✓ Confirm
                        </button>
                      )}
                      {(a.status === 'CONFIRMED' || a.status === 'PENDING') && (
                        <>
                          <button className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelected(a);
                              setDiagForm({ diagnosis: a.diagnosis || '', notes: a.notes || '' });
                              setDiagModal(true);
                            }}>
                            🩺 Diagnose
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                            onClick={() => {
                              setSelected(a);
                              setPrescForm({ diagnosis: a.diagnosis || '', instructions: '' });
                              setMedicines([{ ...EMPTY_MED }]);
                              setPrescModal(true);
                            }}>
                            💊 Rx
                          </button>
                        </>
                      )}
                      {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                        <button className="btn btn-sm btn-danger"
                          onClick={() => updateStatus(a.id, 'CANCELLED')}>
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Diagnosis Modal ── */}
      <Modal isOpen={diagModal} onClose={() => setDiagModal(false)} title="Add Diagnosis"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setDiagModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleDiagnosis} disabled={saving}>
            {saving ? 'Saving...' : '✅ Save & Complete'}
          </button>
        </>}>
        <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          <strong>Patient:</strong> {selected?.patientName} &nbsp;·&nbsp;
          <strong>Date:</strong> {selected && new Date(selected.appointmentDate).toLocaleDateString()}
        </div>
        <div className="form-group">
          <label className="form-label">Diagnosis *</label>
          <textarea className="form-control" rows={4}
            placeholder="Describe the diagnosis in detail..."
            value={diagForm.diagnosis}
            onChange={e => setDiagForm({ ...diagForm, diagnosis: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Doctor's Notes</label>
          <textarea className="form-control" rows={3}
            placeholder="Additional observations, follow-up instructions..."
            value={diagForm.notes}
            onChange={e => setDiagForm({ ...diagForm, notes: e.target.value })} />
        </div>
      </Modal>

      {/* ── Prescription Modal ── */}
      <Modal isOpen={prescModal} onClose={() => setPrescModal(false)}
        title="Create Prescription" size="lg"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setPrescModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePrescription} disabled={saving}>
            {saving ? 'Saving...' : '💊 Create Prescription'}
          </button>
        </>}>

        <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          <strong>Patient:</strong> {selected?.patientName} &nbsp;·&nbsp;
          <strong>Date:</strong> {selected && new Date(selected.appointmentDate).toLocaleDateString()}
        </div>

        <div className="form-group">
          <label className="form-label">Diagnosis</label>
          <input className="form-control"
            placeholder="e.g. Viral fever, Hypertension..."
            value={prescForm.diagnosis}
            onChange={e => setPrescForm({ ...prescForm, diagnosis: e.target.value })} />
        </div>

        {/* Medicine builder */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="form-label" style={{ margin: 0 }}>Medicines *</label>
            <button type="button" className="btn btn-sm btn-secondary" onClick={addMedicine}>
              ➕ Add Medicine
            </button>
          </div>

          {medicines.map((med, i) => (
            <div key={i} style={{
              padding: 14, marginBottom: 10, borderRadius: 8,
              background: '#f8fafc', border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                  Medicine #{i + 1}
                </span>
                {medicines.length > 1 && (
                  <button type="button" onClick={() => removeMedicine(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ef4444' }}>
                    🗑️
                  </button>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Medicine Name *</label>
                  <input className="form-control" placeholder="e.g. Paracetamol"
                    value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dosage</label>
                  <input className="form-control" placeholder="e.g. 500mg"
                    value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select className="form-control" value={med.frequency}
                    onChange={e => updateMedicine(i, 'frequency', e.target.value)}>
                    <option value="">Select frequency</option>
                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>Three times daily</option>
                    <option>Four times daily</option>
                    <option>Every 8 hours</option>
                    <option>As needed (SOS)</option>
                    <option>At bedtime</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <select className="form-control" value={med.duration}
                    onChange={e => updateMedicine(i, 'duration', e.target.value)}>
                    <option value="">Select duration</option>
                    <option>3 days</option>
                    <option>5 days</option>
                    <option>7 days</option>
                    <option>10 days</option>
                    <option>14 days</option>
                    <option>1 month</option>
                    <option>3 months</option>
                    <option>Ongoing</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Instructions to Patient</label>
          <textarea className="form-control" rows={3}
            placeholder="e.g. Take after meals, drink plenty of water, avoid alcohol..."
            value={prescForm.instructions}
            onChange={e => setPrescForm({ ...prescForm, instructions: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
