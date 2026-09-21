package com.mediconnect.controller;

import com.mediconnect.dto.ApiResponse;
import com.mediconnect.dto.PrescriptionDTO;
import com.mediconnect.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @GetMapping("/patient/prescriptions/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<PrescriptionDTO>>> getPatientPrescriptions(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPrescriptionsByPatient(patientId)));
    }

    @GetMapping("/patient/prescriptions/{patientId}/active")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<PrescriptionDTO>>> getActivePrescriptions(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getActivePrescriptionsByPatient(patientId)));
    }

    @GetMapping("/patient/prescriptions/detail/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> getPrescription(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPrescriptionById(id)));
    }

    @PostMapping("/doctor/prescriptions")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> createPrescription(@RequestBody PrescriptionDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Prescription created", prescriptionService.createPrescription(dto)));
    }

    @PutMapping("/doctor/prescriptions/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> updatePrescription(@PathVariable Long id,
                                                                            @RequestBody PrescriptionDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Prescription updated", prescriptionService.updatePrescription(id, dto)));
    }

    @GetMapping("/doctor/prescriptions/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> getByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(prescriptionService.getPrescriptionByAppointment(appointmentId)));
    }
}
