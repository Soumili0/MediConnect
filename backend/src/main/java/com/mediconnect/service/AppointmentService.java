package com.mediconnect.service;

import com.mediconnect.dto.AppointmentDTO;
import com.mediconnect.entity.Appointment;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.Patient;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.AppointmentRepository;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AppointmentDTO getAppointmentById(Long id) {
        return toDTO(appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id)));
    }

    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctorId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AppointmentDTO> getTodayAppointments() {
        return getAppointmentsByDate(LocalDate.now());
    }

    @Transactional
    public AppointmentDTO bookAppointment(AppointmentDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", dto.getDoctorId()));

        // Check for conflicting appointments
        long existing = appointmentRepository.countDoctorAppointmentsOnDate(
                dto.getDoctorId(), dto.getAppointmentDate());
        if (existing >= 20) {
            throw new BadRequestException("Doctor is fully booked for this date");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(dto.getAppointmentDate())
                .appointmentTime(dto.getAppointmentTime())
                .status(Appointment.Status.PENDING)
                .type(dto.getType() != null ? dto.getType() : Appointment.AppointmentType.IN_PERSON)
                .reason(dto.getReason())
                .notes(dto.getNotes())
                .consultationFee(doctor.getConsultationFee())
                .build();
        return toDTO(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDTO updateStatus(Long id, Appointment.Status status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        appointment.setStatus(status);
        return toDTO(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDTO addDiagnosis(Long id, String diagnosis, String notes) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        appointment.setDiagnosis(diagnosis);
        if (notes != null) appointment.setNotes(notes);
        appointment.setStatus(Appointment.Status.COMPLETED);
        return toDTO(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        if (dto.getAppointmentDate() != null) appointment.setAppointmentDate(dto.getAppointmentDate());
        if (dto.getAppointmentTime() != null) appointment.setAppointmentTime(dto.getAppointmentTime());
        if (dto.getStatus() != null) appointment.setStatus(dto.getStatus());
        if (dto.getType() != null) appointment.setType(dto.getType());
        if (dto.getReason() != null) appointment.setReason(dto.getReason());
        if (dto.getNotes() != null) appointment.setNotes(dto.getNotes());
        if (dto.getDiagnosis() != null) appointment.setDiagnosis(dto.getDiagnosis());
        return toDTO(appointmentRepository.save(appointment));
    }

    @Transactional
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        if (appointment.getStatus() == Appointment.Status.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment");
        }
        appointment.setStatus(Appointment.Status.CANCELLED);
        appointmentRepository.save(appointment);
    }

    public AppointmentDTO toDTO(Appointment a) {
        return AppointmentDTO.builder()
                .id(a.getId())
                .patientId(a.getPatient().getId())
                .patientName(a.getPatient().getUser().getFirstName() + " " + a.getPatient().getUser().getLastName())
                .doctorId(a.getDoctor().getId())
                .doctorName("Dr. " + a.getDoctor().getUser().getFirstName() + " " + a.getDoctor().getUser().getLastName())
                .departmentName(a.getDoctor().getDepartment().getName())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .status(a.getStatus())
                .type(a.getType())
                .reason(a.getReason())
                .notes(a.getNotes())
                .diagnosis(a.getDiagnosis())
                .consultationFee(a.getConsultationFee())
                .build();
    }
}
