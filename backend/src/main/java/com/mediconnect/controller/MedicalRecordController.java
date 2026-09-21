package com.mediconnect.controller;

import com.mediconnect.dto.ApiResponse;
import com.mediconnect.dto.MedicalRecordDTO;
import com.mediconnect.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @GetMapping("/patient/records/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<MedicalRecordDTO>>> getPatientRecords(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getRecordsByPatient(patientId)));
    }

    @GetMapping("/patient/records/detail/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<MedicalRecordDTO>> getRecord(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getRecordById(id)));
    }

    @PostMapping("/doctor/records")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<MedicalRecordDTO>> createRecord(@RequestBody MedicalRecordDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Record created", medicalRecordService.createRecord(dto)));
    }

    @PutMapping("/doctor/records/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<MedicalRecordDTO>> updateRecord(@PathVariable Long id,
                                                                       @RequestBody MedicalRecordDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Record updated", medicalRecordService.updateRecord(id, dto)));
    }

    @GetMapping("/doctor/records/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<MedicalRecordDTO>>> getDoctorPatientRecords(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getRecordsByPatient(patientId)));
    }
}
