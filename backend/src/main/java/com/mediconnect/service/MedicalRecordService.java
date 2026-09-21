package com.mediconnect.service;

import com.mediconnect.dto.MedicalRecordDTO;
import com.mediconnect.entity.Appointment;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.MedicalRecord;
import com.mediconnect.entity.Patient;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.AppointmentRepository;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.MedicalRecordRepository;
import com.mediconnect.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public List<MedicalRecordDTO> getRecordsByPatient(Long patientId) {
        return medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MedicalRecordDTO getRecordById(Long id) {
        return toDTO(medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", id)));
    }

    @Transactional
    public MedicalRecordDTO createRecord(MedicalRecordDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", dto.getDoctorId()));

        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .recordDate(dto.getRecordDate() != null ? dto.getRecordDate() : LocalDate.now())
                .title(dto.getTitle())
                .diagnosis(dto.getDiagnosis())
                .symptoms(dto.getSymptoms())
                .treatment(dto.getTreatment())
                .labResults(dto.getLabResults())
                .notes(dto.getNotes())
                .bloodPressure(dto.getBloodPressure())
                .heartRate(dto.getHeartRate())
                .temperature(dto.getTemperature())
                .weight(dto.getWeight())
                .height(dto.getHeight())
                .build();

        if (dto.getAppointmentId() != null) {
            Appointment appt = appointmentRepository.findById(dto.getAppointmentId()).orElse(null);
            record.setAppointment(appt);
        }

        return toDTO(medicalRecordRepository.save(record));
    }

    @Transactional
    public MedicalRecordDTO updateRecord(Long id, MedicalRecordDTO dto) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", id));
        if (dto.getTitle() != null) record.setTitle(dto.getTitle());
        if (dto.getDiagnosis() != null) record.setDiagnosis(dto.getDiagnosis());
        if (dto.getSymptoms() != null) record.setSymptoms(dto.getSymptoms());
        if (dto.getTreatment() != null) record.setTreatment(dto.getTreatment());
        if (dto.getLabResults() != null) record.setLabResults(dto.getLabResults());
        if (dto.getNotes() != null) record.setNotes(dto.getNotes());
        if (dto.getBloodPressure() != null) record.setBloodPressure(dto.getBloodPressure());
        if (dto.getHeartRate() != null) record.setHeartRate(dto.getHeartRate());
        if (dto.getTemperature() != null) record.setTemperature(dto.getTemperature());
        if (dto.getWeight() != null) record.setWeight(dto.getWeight());
        if (dto.getHeight() != null) record.setHeight(dto.getHeight());
        return toDTO(medicalRecordRepository.save(record));
    }

    private MedicalRecordDTO toDTO(MedicalRecord r) {
        return MedicalRecordDTO.builder()
                .id(r.getId())
                .patientId(r.getPatient().getId())
                .patientName(r.getPatient().getUser().getFirstName() + " " + r.getPatient().getUser().getLastName())
                .doctorId(r.getDoctor().getId())
                .doctorName("Dr. " + r.getDoctor().getUser().getFirstName() + " " + r.getDoctor().getUser().getLastName())
                .appointmentId(r.getAppointment() != null ? r.getAppointment().getId() : null)
                .recordDate(r.getRecordDate())
                .title(r.getTitle())
                .diagnosis(r.getDiagnosis())
                .symptoms(r.getSymptoms())
                .treatment(r.getTreatment())
                .labResults(r.getLabResults())
                .notes(r.getNotes())
                .bloodPressure(r.getBloodPressure())
                .heartRate(r.getHeartRate())
                .temperature(r.getTemperature())
                .weight(r.getWeight())
                .height(r.getHeight())
                .build();
    }
}
