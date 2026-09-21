package com.mediconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long appointmentId;
    private LocalDate recordDate;
    private String title;
    private String diagnosis;
    private String symptoms;
    private String treatment;
    private String labResults;
    private String notes;
    private String bloodPressure;
    private String heartRate;
    private String temperature;
    private String weight;
    private String height;
}
