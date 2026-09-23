import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminPatients from './pages/admin/Patients';
import AdminDepartments from './pages/admin/Departments';
import AdminAppointments from './pages/admin/Appointments';

// Doctor
import DoctorLayout from './layouts/DoctorLayout';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPrescriptions from './pages/doctor/Prescriptions';

// Patient
import PatientLayout from './layouts/PatientLayout';
import PatientDashboard from './pages/patient/Dashboard';
import PatientDoctors from './pages/patient/Doctors';
import PatientAppointments from './pages/patient/Appointments';
import PatientPrescriptions from './pages/patient/Prescriptions';
import PatientRecords from './pages/patient/Records';
import PatientProfile from './pages/patient/Profile';

// PrivateRoute must be INSIDE AuthProvider tree
const PrivateRoute = ({ children, roles }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

// RootRedirect must be INSIDE AuthProvider tree
const RootRedirect = () => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'DOCTOR') return <Navigate to="/doctor" replace />;
  return <Navigate to="/patient" replace />;
};

// AppRoutes: all routing inside AuthProvider
function AppRoutes() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={['ADMIN']}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="appointments" element={<AdminAppointments />} />
        </Route>

        {/* Doctor */}
        <Route
          path="/doctor"
          element={
            <PrivateRoute roles={['DOCTOR']}>
              <DoctorLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
        </Route>

        {/* Patient */}
        <Route
          path="/patient"
          element={
            <PrivateRoute roles={['PATIENT']}>
              <PatientLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<PatientDashboard />} />
          <Route path="doctors" element={<PatientDoctors />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
