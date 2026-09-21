package com.mediconnect.repository;

import com.mediconnect.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientIdOrderByPrescriptionDateDesc(Long patientId);
    List<Prescription> findByDoctorId(Long doctorId);
    Optional<Prescription> findByAppointmentId(Long appointmentId);
    List<Prescription> findByPatientIdAndActiveTrue(Long patientId);
}
