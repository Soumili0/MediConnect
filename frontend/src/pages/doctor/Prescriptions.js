import React from 'react';

export default function DoctorPrescriptions() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Prescriptions</h1>
          <p>Prescriptions you have issued to patients</p>
        </div>
      </div>
      <div className="card">
        <div className="empty-state" style={{ padding: 60 }}>
          <div className="empty-icon">💊</div>
          <h3>Create Prescriptions from Appointments</h3>
          <p style={{ marginTop: 8, maxWidth: 360, lineHeight: 1.6 }}>
            Go to the <strong>Appointments</strong> page, select a confirmed appointment,
            and use the <strong>💊 Rx</strong> button to issue a prescription.
          </p>
        </div>
      </div>
    </div>
  );
}
