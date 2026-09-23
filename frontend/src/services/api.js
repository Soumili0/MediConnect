import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mediconnect_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mediconnect_token');
      localStorage.removeItem('mediconnect_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

// ─── DEPARTMENTS ─────────────────────────────────────────
export const departmentAPI = {
  getAll: () => api.get('/api/public/departments'),
  getById: (id) => api.get(`/api/public/departments/${id}`),
  getAllAdmin: () => api.get('/api/admin/departments'),
  create: (data) => api.post('/api/admin/departments', data),
  update: (id, data) => api.put(`/api/admin/departments/${id}`, data),
  delete: (id) => api.delete(`/api/admin/departments/${id}`),
};

// ─── DOCTORS ─────────────────────────────────────────────
export const doctorAPI = {
  getAll: () => api.get('/api/public/doctors'),
  getById: (id) => api.get(`/api/public/doctors/${id}`),
  search: (q) => api.get(`/api/public/doctors/search?q=${q}`),
  getByDept: (deptId) => api.get(`/api/public/doctors/department/${deptId}`),
  getByUserId: (userId) => api.get(`/api/doctor/profile/${userId}`),
  updateProfile: (id, data) => api.put(`/api/doctor/profile/${id}`, data),
  // Admin
  getAllAdmin: () => api.get('/api/admin/doctors'),
  create: (data) => api.post('/api/admin/doctors', data),
  update: (id, data) => api.put(`/api/admin/doctors/${id}`, data),
  delete: (id) => api.delete(`/api/admin/doctors/${id}`),
};

// ─── PATIENTS ────────────────────────────────────────────
export const patientAPI = {
  getByUserId: (userId) => api.get(`/api/patient/profile/${userId}`),
  update: (id, data) => api.put(`/api/patient/profile/${id}`, data),
  getById: (id) => api.get(`/api/doctor/patients/${id}`),
  // Admin
  getAll: () => api.get('/api/admin/patients'),
  search: (q) => api.get(`/api/admin/patients/search?q=${q}`),
  getByIdAdmin: (id) => api.get(`/api/admin/patients/${id}`),
};

// ─── APPOINTMENTS ────────────────────────────────────────
export const appointmentAPI = {
  // Patient
  book: (data) => api.post('/api/patient/appointments', data),
  getByPatient: (patientId) => api.get(`/api/patient/appointments/${patientId}`),
  cancel: (id) => api.patch(`/api/patient/appointments/${id}/cancel`),
  // Doctor
  getByDoctor: (doctorId) => api.get(`/api/doctor/appointments/${doctorId}`),
  updateStatus: (id, status) => api.patch(`/api/doctor/appointments/${id}/status`, { status }),
  addDiagnosis: (id, data) => api.patch(`/api/doctor/appointments/${id}/diagnosis`, data),
  // Admin
  getAll: () => api.get('/api/admin/appointments'),
  getToday: () => api.get('/api/admin/appointments/today'),
  getByDate: (date) => api.get(`/api/admin/appointments/date/${date}`),
  getById: (id) => api.get(`/api/admin/appointments/${id}`),
  update: (id, data) => api.put(`/api/admin/appointments/${id}`, data),
};

// ─── MEDICAL RECORDS ─────────────────────────────────────
export const recordAPI = {
  getByPatient: (patientId) => api.get(`/api/patient/records/${patientId}`),
  getById: (id) => api.get(`/api/patient/records/detail/${id}`),
  create: (data) => api.post('/api/doctor/records', data),
  update: (id, data) => api.put(`/api/doctor/records/${id}`, data),
  getDoctorPatientRecords: (patientId) => api.get(`/api/doctor/records/patient/${patientId}`),
};

// ─── PRESCRIPTIONS ───────────────────────────────────────
export const prescriptionAPI = {
  getByPatient: (patientId) => api.get(`/api/patient/prescriptions/${patientId}`),
  getActive: (patientId) => api.get(`/api/patient/prescriptions/${patientId}/active`),
  getById: (id) => api.get(`/api/patient/prescriptions/detail/${id}`),
  create: (data) => api.post('/api/doctor/prescriptions', data),
  update: (id, data) => api.put(`/api/doctor/prescriptions/${id}`, data),
  getByAppointment: (appointmentId) => api.get(`/api/doctor/prescriptions/appointment/${appointmentId}`),
};

// ─── STATS ───────────────────────────────────────────────
export const statsAPI = {
  get: () => api.get('/api/admin/stats'),
};

export default api;
