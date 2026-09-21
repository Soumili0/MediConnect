package com.mediconnect.service;

import com.mediconnect.dto.StatsDTO;
import com.mediconnect.entity.Appointment;
import com.mediconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final DepartmentRepository departmentRepository;

    public StatsDTO getStats() {
        return StatsDTO.builder()
                .totalDoctors(doctorRepository.count())
                .totalPatients(patientRepository.count())
                .totalAppointments(appointmentRepository.count())
                .totalDepartments(departmentRepository.count())
                .todayAppointments(appointmentRepository.countByDate(LocalDate.now()))
                .pendingAppointments(appointmentRepository.countByStatus(Appointment.Status.PENDING))
                .completedAppointments(appointmentRepository.countByStatus(Appointment.Status.COMPLETED))
                .cancelledAppointments(appointmentRepository.countByStatus(Appointment.Status.CANCELLED))
                .build();
    }
}
