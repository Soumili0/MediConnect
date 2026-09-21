package com.mediconnect.service;

import com.mediconnect.dto.PrescriptionDTO;
import com.mediconnect.entity.Appointment;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.Patient;
import com.mediconnect.entity.Prescription;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.AppointmentRepository;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.PatientRepository;
import com.mediconnect.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public List<PrescriptionDTO> getPrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByPrescriptionDateDesc(patientId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PrescriptionDTO> getActivePrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientIdAndActiveTrue(patientId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PrescriptionDTO getPrescriptionById(Long id) {
        return toDTO(prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", id)));
    }

    public PrescriptionDTO getPrescriptionByAppointment(Long appointmentId) {
        return toDTO(prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found for appointment: " + appointmentId)));
    }

    @Transactional
    public PrescriptionDTO createPrescription(PrescriptionDTO dto) {
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", dto.getAppointmentId()));

        if (prescriptionRepository.findByAppointmentId(dto.getAppointmentId()).isPresent()) {
            throw new BadRequestException("Prescription already exists for this appointment");
        }

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", dto.getDoctorId()));

        Prescription prescription = Prescription.builder()
                .appointment(appointment)
                .patient(patient)
                .doctor(doctor)
                .prescriptionDate(dto.getPrescriptionDate() != null ? dto.getPrescriptionDate() : LocalDate.now())
                .validUntil(dto.getValidUntil() != null ? dto.getValidUntil() : LocalDate.now().plusDays(30))
                .diagnosis(dto.getDiagnosis())
                .instructions(dto.getInstructions())
                .medicines(dto.getMedicines())
                .active(true)
                .build();
        return toDTO(prescriptionRepository.save(prescription));
    }

    @Transactional
    public PrescriptionDTO updatePrescription(Long id, PrescriptionDTO dto) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", id));
        if (dto.getDiagnosis() != null) prescription.setDiagnosis(dto.getDiagnosis());
        if (dto.getInstructions() != null) prescription.setInstructions(dto.getInstructions());
        if (dto.getMedicines() != null) prescription.setMedicines(dto.getMedicines());
        if (dto.getValidUntil() != null) prescription.setValidUntil(dto.getValidUntil());
        if (dto.getActive() != null) prescription.setActive(dto.getActive());
        return toDTO(prescriptionRepository.save(prescription));
    }

    private PrescriptionDTO toDTO(Prescription p) {
        return PrescriptionDTO.builder()
                .id(p.getId())
                .appointmentId(p.getAppointment().getId())
                .patientId(p.getPatient().getId())
                .patientName(p.getPatient().getUser().getFirstName() + " " + p.getPatient().getUser().getLastName())
                .doctorId(p.getDoctor().getId())
                .doctorName("Dr. " + p.getDoctor().getUser().getFirstName() + " " + p.getDoctor().getUser().getLastName())
                .prescriptionDate(p.getPrescriptionDate())
                .validUntil(p.getValidUntil())
                .diagnosis(p.getDiagnosis())
                .instructions(p.getInstructions())
                .medicines(p.getMedicines())
                .active(p.getActive())
                .build();
    }
}
