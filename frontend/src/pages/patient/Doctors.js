import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI, departmentAPI, appointmentAPI, patientAPI } from '../../services/api';
import Modal from '../../components/Modal';

export default function PatientDoctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [bookModal, setBookModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [bookForm, setBookForm] = useState({
    appointmentDate: '',
    appointmentTime: '09:00',
    type: 'IN_PERSON',
    reason: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      doctorAPI.getAll(),
      departmentAPI.getAll(),
      patientAPI.getByUserId(user.userId),
    ]).then(([d, dept, p]) => {
      setDoctors(d.data.data || []);
      setDepartments(dept.data.data || []);
      setPatientId(p.data.data.id);
    }).finally(() => setLoading(false));
  }, [user.userId]);

  const handleSearch = async (q) => {
    setSearch(q);
    if (q.length > 1) {
      const r = await doctorAPI.search(q);
      setDoctors(r.data.data || []);
    } else if (q.length === 0) {
      doctorAPI.getAll().then(r => setDoctors(r.data.data || []));
    }
  };

  const handleDeptFilter = (deptId) => {
    setDeptFilter(deptId);
    if (deptId) {
      doctorAPI.getByDept(deptId).then(r => setDoctors(r.data.data || []));
    } else {
      doctorAPI.getAll().then(r => setDoctors(r.data.data || []));
    }
  };

  const openBook = (doc) => {
    setSelectedDoc(doc);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookForm({
      appointmentDate: tomorrow.toISOString().split('T')[0],
      appointmentTime: '09:00',
      type: 'IN_PERSON',
      reason: '',
    });
    setBookModal(true);
  };

  const handleBook = async () => {
    if (!bookForm.appointmentDate || !bookForm.appointmentTime) {
      toast.error('Please fill date and time');
      return;
    }
    setSaving(true);
    try {
      await appointmentAPI.book({
        patientId,
        doctorId: selectedDoc.id,
        ...bookForm,
      });
      toast.success('Appointment booked successfully!');
      setBookModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Find Doctors</h1>
          <p>Search and book appointments with our specialists</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input
            className="form-control"
            placeholder="Search by name, specialization..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ width: 200 }}
          value={deptFilter}
          onChange={e => handleDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Doctors Grid */}
      {doctors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍⚕️</div>
          <h3>No doctors found</h3>
          <p>Try a different search term</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {doctors.map(doc => (
            <div key={doc.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                <div className="avatar avatar-lg" style={{ background: '#4f46e5' }}>
                  {doc.firstName?.[0]}{doc.lastName?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>Dr. {doc.firstName} {doc.lastName}</h3>
                  <p style={{ fontSize: 13, color: 'var(--primary)', marginTop: 2 }}>{doc.specialization}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>🏥 {doc.departmentName}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  { icon: '🎓', label: doc.qualification || 'MBBS' },
                  { icon: '⏱️', label: doc.experienceYears ? `${doc.experienceYears} yrs exp` : 'Experienced' },
                  { icon: '💰', label: `₹${doc.consultationFee || 0}` },
                  { icon: '📅', label: doc.availableDays || 'Mon-Fri' },
                ].map((item, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {doc.bio && (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
                  {doc.bio.length > 100 ? doc.bio.substring(0, 100) + '...' : doc.bio}
                </p>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => openBook(doc)}
              >
                📅 Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Book Modal */}
      <Modal
        isOpen={bookModal}
        onClose={() => setBookModal(false)}
        title={`Book with Dr. ${selectedDoc?.firstName} ${selectedDoc?.lastName}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setBookModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBook} disabled={saving}>
              {saving ? 'Booking...' : '✅ Confirm Booking'}
            </button>
          </>
        }
      >
        {selectedDoc && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
            <strong>Dr. {selectedDoc.firstName} {selectedDoc.lastName}</strong> · {selectedDoc.specialization}
            <br />
            <span style={{ color: 'var(--text-muted)' }}>
              Consultation Fee: <strong>₹{selectedDoc.consultationFee}</strong>
            </span>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Appointment Date *</label>
            <input
              type="date"
              className="form-control"
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              value={bookForm.appointmentDate}
              onChange={e => setBookForm({ ...bookForm, appointmentDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Time *</label>
            <input
              type="time"
              className="form-control"
              value={bookForm.appointmentTime}
              onChange={e => setBookForm({ ...bookForm, appointmentTime: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Appointment Type</label>
          <select
            className="form-control"
            value={bookForm.type}
            onChange={e => setBookForm({ ...bookForm, type: e.target.value })}
          >
            <option value="IN_PERSON">🏥 In Person</option>
            <option value="ONLINE">💻 Online</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Reason for Visit</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Describe your symptoms or reason..."
            value={bookForm.reason}
            onChange={e => setBookForm({ ...bookForm, reason: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
