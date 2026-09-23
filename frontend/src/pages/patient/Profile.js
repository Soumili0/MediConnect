import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';

export default function PatientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    patientAPI.getByUserId(user.userId).then(r => {
      const p = r.data.data;
      setProfile(p);
      setPatientId(p.id);
      setForm({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        phone: p.phone || '',
        dateOfBirth: p.dateOfBirth || '',
        gender: p.gender || '',
        bloodGroup: p.bloodGroup || '',
        address: p.address || '',
        emergencyContact: p.emergencyContact || '',
        emergencyContactName: p.emergencyContactName || '',
        allergies: p.allergies || '',
        chronicDiseases: p.chronicDiseases || '',
      });
    }).finally(() => setLoading(false));
  }, [user.userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await patientAPI.update(patientId, form);
      setProfile(r.data.data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal and medical information</p>
        </div>
        {!editing ? (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Avatar & Basic */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 26, background: '#4f46e5' }}>
            {profile?.firstName?.[0]}{profile?.lastName?.[0]}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{profile?.firstName} {profile?.lastName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user.email}</p>
            <span className="badge badge-active" style={{ marginTop: 4 }}>Patient</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            {editing ? (
              <input className="form-control" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            ) : (
              <p style={{ padding: '10px 0', fontSize: 14 }}>{profile?.firstName || '—'}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            {editing ? (
              <input className="form-control" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            ) : (
              <p style={{ padding: '10px 0', fontSize: 14 }}>{profile?.lastName || '—'}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            {editing ? (
              <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            ) : (
              <p style={{ padding: '10px 0', fontSize: 14 }}>{profile?.phone || '—'}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <p style={{ padding: '10px 0', fontSize: 14, color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
        </div>
      </div>

      {/* Medical Info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Medical Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            {editing ? (
              <input type="date" className="form-control" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
            ) : (
              <p style={{ padding: '10px 0', fontSize: 14 }}>{profile?.dateOfBirth || '—'}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            {editing ? (
              <select className="form-control" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            ) : (
              <p style={{ padding: '10px 0', fontSize: 14 }}>{profile?.gender || '—'}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            {editing ? (
              <select className="form-control" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            ) : (
              <p style={{ padding: '10px 0', fontSize: 14 }}>{profile?.bloodGroup || '—'}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          {editing ? (
            <textarea className="form-control" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          ) : (
            <p style={{ padding: '10px 0', fontSize: 14 }}>{profile?.address || '—'}</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Allergies</label>
            {editing ? (
              <textarea className="form-control" rows={2} placeholder="e.g. Penicillin, Aspirin..." value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} />
            ) : (
              <p style={{ padding: '10px 0', fontSize: 14 }}>{profile?.allergies || '—'}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Chronic Diseases</label>
            {editing ? (
              <textarea className="form-control" rows={2} placeholder="e.g. Diabetes, Hypertension..." value={form.chronicDiseases} onChange={e => setForm({ ...form, chronicDiseases: e.target.value })} />
            ) : (
              <p style={{ padding: '10px 0', fontSize: 14 }}>{profile?.chronicDiseases || '—'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🚨 Emergency Contact</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Contact Name</label>
            {editing ? (
              <input className="form-control" placeholder="e.g. John Doe" value={form.emergencyContactName} onChange={e => setForm({ ...form, emergencyContactName: e.target.value })} />
            ) : (
              <p style={{ padding: '10px 0', fontSize: 14 }}>{profile?.emergencyContactName || '—'}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            {editing ? (
              <input className="form-control" placeholder="+1 234 567 8900" value={form.emergencyContact} onChange={e => setForm({ ...form, emergencyContact: e.target.value })} />
            ) : (
              <p style={{ padding: '10px 0', fontSize: 14 }}>{profile?.emergencyContact || '—'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
