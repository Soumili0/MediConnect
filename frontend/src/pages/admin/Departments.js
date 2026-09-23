import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { departmentAPI } from '../../services/api';
import Modal from '../../components/Modal';

const INIT = { name: '', description: '', location: '', headOfDepartment: '' };

export default function AdminDepartments() {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(INIT);
  const [saving, setSaving] = useState(false);

  const load = () => departmentAPI.getAllAdmin().then(r => setDepts(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(INIT); setModal(true); };
  const openEdit = (d) => { setEditing(d); setForm(d); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) { await departmentAPI.update(editing.id, form); toast.success('Department updated'); }
      else { await departmentAPI.create(form); toast.success('Department created'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this department?')) return;
    await departmentAPI.delete(id); toast.success('Deactivated'); load();
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Departments</h1><p>{depts.length} departments</p></div>
        <button className="btn btn-primary" onClick={openCreate}>➕ Add Department</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
        {depts.map(d => (
          <div key={d.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏥</div>
              <span className={`badge badge-${d.active ? 'active' : 'inactive'}`}>{d.active ? 'Active' : 'Inactive'}</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{d.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{d.description || 'No description'}</p>
            {d.location && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {d.location}</p>}
            {d.headOfDepartment && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>👤 {d.headOfDepartment}</p>}
            <p style={{ fontSize: 12, color: 'var(--primary)', marginTop: 4 }}>👨‍⚕️ {d.doctorCount || 0} doctors</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-sm btn-secondary" onClick={() => openEdit(d)} style={{ flex: 1 }}>✏️ Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id)}>🗑️</button>
            </div>
          </div>
        ))}
        {depts.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-icon">🏥</div>
            <h3>No departments yet</h3>
            <p>Click "Add Department" to get started</p>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Department' : 'Add Department'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </>}>
        <div className="form-group"><label className="form-label">Name *</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Location</label><input className="form-control" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Head of Department</label><input className="form-control" value={form.headOfDepartment} onChange={e => setForm({ ...form, headOfDepartment: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}
