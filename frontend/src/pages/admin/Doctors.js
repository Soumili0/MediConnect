import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { doctorAPI, departmentAPI } from '../../services/api';
import Modal from '../../components/Modal';

const INIT = {
  firstName: '', lastName: '', email: '', phone: '',
  password: '',                   // auto-fills from licenseNumber
  departmentId: '', specialization: '', licenseNumber: '',
  qualification: '', experienceYears: '', bio: '',
  consultationFee: '', availableDays: 'MON,TUE,WED,THU,FRI',
  availableHours: '09:00-13:00,14:00-17:00',
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INIT);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdDoctor, setCreatedDoctor] = useState(null); // show credentials after create

  const load = () => {
    Promise.all([doctorAPI.getAllAdmin(), departmentAPI.getAllAdmin()])
      .then(([d, dept]) => {
        setDoctors(d.data.data || []);
        setDepartments(dept.data.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(INIT);
    setShowPassword(false);
    setModal(true);
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setForm({ ...doc, password: '', departmentId: doc.departmentId || '' });
    setShowPassword(false);
    setModal(true);
  };

  const handleSave = async () => {
    if (!editing) {
      if (!form.firstName || !form.lastName || !form.email || !form.departmentId || !form.specialization) {
        toast.error('Please fill all required fields (*)');
        return;
      }
      if (!form.password || form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }
    setSaving(true);
    try {
      if (editing) {
        await doctorAPI.update(editing.id, form);
        toast.success('Doctor updated successfully');
        setModal(false);
        load();
      } else {
        const res = await doctorAPI.create(form);
        const newDoc = res.data.data;
        setModal(false);
        load();
        // Show credentials popup — password = license number
        setCreatedDoctor({
          name: `Dr. ${newDoc.firstName} ${newDoc.lastName}`,
          email: form.email,
          password: form.licenseNumber || form.password || 'doctor@123',
          licenseNumber: form.licenseNumber,
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (doc) => {
    const action = doc.active ? 'Deactivate' : 'Activate';
    if (!window.confirm(`${action} Dr. ${doc.firstName} ${doc.lastName}?`)) return;
    await doctorAPI.update(doc.id, { active: !doc.active });
    toast.success(`Doctor ${action.toLowerCase()}d`);
    load();
  };

  const filtered = doctors.filter(d =>
    `${d.firstName} ${d.lastName} ${d.specialization || ''} ${d.departmentName || ''}`
      .toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Manage Doctors</h1>
          <p>{doctors.length} total · {doctors.filter(d => d.active).length} active</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          ➕ Add Doctor
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input className="form-control" style={{ maxWidth: 360 }}
              placeholder="Search by name, specialization, department..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Doctor</th><th>Department</th><th>Specialization</th>
                <th>Experience</th><th>Fee</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-icon">👨‍⚕️</div>
                    <h3>No doctors found</h3>
                    <p>Click "Add Doctor" to create one</p>
                  </div>
                </td></tr>
              ) : filtered.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ background: '#4f46e5' }}>
                        {doc.firstName?.[0]}{doc.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Dr. {doc.firstName} {doc.lastName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doc.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{doc.departmentName || <span style={{ color: '#f59e0b' }}>⚠️ Not assigned</span>}</td>
                  <td>{doc.specialization || '—'}</td>
                  <td>{doc.experienceYears ? `${doc.experienceYears} yrs` : '—'}</td>
                  <td>₹{doc.consultationFee || 0}</td>
                  <td>
                    <span className={`badge badge-${doc.active ? 'active' : 'inactive'}`}>
                      {doc.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(doc)}>
                        ✏️ Edit
                      </button>
                      <button
                        className={`btn btn-sm ${doc.active ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleActive(doc)}
                      >
                        {doc.active ? '🚫' : '✅'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing ? `Edit — Dr. ${editing.firstName} ${editing.lastName}` : '➕ Add New Doctor'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? '💾 Update Doctor' : '✅ Create Doctor'}
            </button>
          </>
        }
      >
        {/* Login credentials block — only on create */}
        {!editing && (
          <div style={{
            padding: '14px 16px', marginBottom: 20,
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 10,
          }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#1d4ed8', marginBottom: 6 }}>
              🔐 Login Credentials — Doctor will use these to sign in
            </div>
            <div style={{ fontSize: 12, color: '#3b82f6', marginBottom: 12 }}>
              Password is automatically set to the Doctor's <strong>License Number</strong>.
              Fill the License Number below and it will be used as the password.
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email (Login ID) *</label>
              <input className="form-control" type="email"
                placeholder="doctor@hospital.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
        )}

        {/* Personal info */}
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Personal Information
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input className="form-control" placeholder="Arjun"
              value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input className="form-control" placeholder="Sharma"
              value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
          </div>
        </div>

        {/* Email for edit only */}
        {editing && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
        )}
        {!editing && (
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-control" placeholder="+91 98765 43210"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
        )}

        {/* Professional info */}
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', margin: '16px 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Professional Information
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select className="form-control" value={form.departmentId}
              onChange={e => setForm({ ...form, departmentId: e.target.value })}>
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Specialization *</label>
            <input className="form-control" placeholder="e.g. Cardiologist"
              value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} />
          </div>
        </div>
          <div className="form-row">
          <div className="form-group">
            <label className="form-label">License Number</label>
            <input className="form-control" placeholder="MCI-XXXXX"
              value={form.licenseNumber}
              onChange={e => setForm({
                ...form,
                licenseNumber: e.target.value,
                // auto-sync password with license number
                password: e.target.value,
              })} />
            {!editing && form.licenseNumber && (
              <div style={{ fontSize: 11, color: '#059669', marginTop: 4, fontWeight: 600 }}>
                🔑 Password will be: {form.licenseNumber}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Qualification</label>
            <input className="form-control" placeholder="MBBS, MD..."
              value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Experience (Years)</label>
            <input className="form-control" type="number" min="0" placeholder="5"
              value={form.experienceYears} onChange={e => setForm({ ...form, experienceYears: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Consultation Fee (₹)</label>
            <input className="form-control" type="number" min="0" placeholder="500"
              value={form.consultationFee} onChange={e => setForm({ ...form, consultationFee: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Available Days</label>
            <input className="form-control" placeholder="MON,TUE,WED,THU,FRI"
              value={form.availableDays} onChange={e => setForm({ ...form, availableDays: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Available Hours</label>
            <input className="form-control" placeholder="09:00-13:00,14:00-17:00"
              value={form.availableHours} onChange={e => setForm({ ...form, availableHours: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-control" rows={3}
            placeholder="Short description about the doctor..."
            value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
        </div>
      </Modal>

      {/* ── Credentials Success Popup ── */}
      {createdDoctor && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            maxWidth: 440, width: '100%', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              Doctor Created!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              Share these login credentials with <strong>{createdDoctor.name}</strong>
            </p>

            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'left',
            }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Login Email
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 15, fontWeight: 600,
                  background: '#e0e7ff', color: '#3730a3',
                  padding: '8px 12px', borderRadius: 6,
                }}>
                  {createdDoctor.email}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  Password (= License Number)
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 15, fontWeight: 600,
                  background: '#d1fae5', color: '#065f46',
                  padding: '8px 12px', borderRadius: 6,
                }}>
                  {createdDoctor.password}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                  🔑 The doctor's login password is their license number.
                  They can change it after logging in.
                </div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: '#f59e0b', marginBottom: 20 }}>
              ⚠️ Save these credentials now — they won't be shown again.
            </p>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
              onClick={() => setCreatedDoctor(null)}
            >
              Done ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
