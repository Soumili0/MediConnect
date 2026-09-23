import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { statsAPI, appointmentAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayAppts, setTodayAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([statsAPI.get(), appointmentAPI.getToday()])
      .then(([s, a]) => {
        setStats(s.data.data);
        setTodayAppts(a.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: 'Pending', value: Number(stats.pendingAppointments) },
    { name: 'Completed', value: Number(stats.completedAppointments) },
    { name: 'Cancelled', value: Number(stats.cancelledAppointments) },
    { name: 'Other', value: Math.max(0, Number(stats.totalAppointments) - Number(stats.pendingAppointments) - Number(stats.completedAppointments) - Number(stats.cancelledAppointments)) },
  ].filter(d => d.value > 0) : [];

  const barData = todayAppts.reduce((acc, appt) => {
    const hour = appt.appointmentTime?.substring(0, 2) || '09';
    const existing = acc.find(a => a.hour === hour + ':00');
    if (existing) existing.count++;
    else acc.push({ hour: hour + ':00', count: 1 });
    return acc;
  }, []).sort((a, b) => a.hour.localeCompare(b.hour));

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: '#fff'
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.firstName}! 👋
        </h2>
        <p style={{ opacity: 0.8, marginTop: 4, fontSize: 14 }}>
          Here's what's happening at MediConnect today.
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{stats?.todayAppointments || 0}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Today's Appointments</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{stats?.totalDoctors || 0}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Active Doctors</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{stats?.totalPatients || 0}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Registered Patients</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-cards">
        {[
          { label: 'Total Doctors', value: stats?.totalDoctors || 0, icon: '👨‍⚕️', color: '#dbeafe', bg: '#eff6ff' },
          { label: 'Total Patients', value: stats?.totalPatients || 0, icon: '👤', color: '#d1fae5', bg: '#ecfdf5' },
          { label: 'Total Appointments', value: stats?.totalAppointments || 0, icon: '📅', color: '#fde8d8', bg: '#fff7ed' },
          { label: 'Departments', value: stats?.totalDepartments || 0, icon: '🏥', color: '#e0e7ff', bg: '#eef2ff' },
          { label: 'Pending', value: stats?.pendingAppointments || 0, icon: '⏳', color: '#fef3c7', bg: '#fffbeb' },
          { label: 'Completed', value: stats?.completedAppointments || 0, icon: '✅', color: '#d1fae5', bg: '#ecfdf5' },
          { label: 'Cancelled', value: stats?.cancelledAppointments || 0, icon: '❌', color: '#fee2e2', bg: '#fef2f2' },
          { label: "Today's Appointments", value: stats?.todayAppointments || 0, icon: '📆', color: '#e0e7ff', bg: '#eef2ff' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <span>{s.icon}</span>
            </div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Today's Appointments by Hour</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4,4,0,0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">📅</div>
              <p>No appointments today</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3>Appointment Status Overview</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-icon">📊</div>
              <p>No appointment data</p>
            </div>
          )}
        </div>
      </div>

      {/* Today's appointments table */}
      {todayAppts.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Today's Appointments</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Patient</th><th>Doctor</th><th>Department</th><th>Time</th><th>Type</th><th>Status</th>
              </tr></thead>
              <tbody>
                {todayAppts.slice(0, 10).map(a => (
                  <tr key={a.id}>
                    <td>{a.patientName}</td>
                    <td>{a.doctorName}</td>
                    <td>{a.departmentName}</td>
                    <td>{a.appointmentTime}</td>
                    <td><span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{a.type}</span></td>
                    <td><span className={`badge badge-${a.status?.toLowerCase()}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
