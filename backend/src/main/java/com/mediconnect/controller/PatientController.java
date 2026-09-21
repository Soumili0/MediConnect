package com.mediconnect.controller;

import com.mediconnect.dto.ApiResponse;
import com.mediconnect.dto.PatientDTO;
import com.mediconnect.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    // Patient self-profile
    @GetMapping("/api/patient/profile/{userId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientByUserId(userId)));
    }

    @PutMapping("/api/patient/profile/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<PatientDTO>> updatePatient(@PathVariable Long id,
                                                                  @RequestBody PatientDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", patientService.updatePatient(id, dto)));
    }

    // Doctor can view patients
    @GetMapping("/api/doctor/patients/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientById(id)));
    }

    // Admin
    @GetMapping("/api/admin/patients")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PatientDTO>>> getAllPatients() {
        return ResponseEntity.ok(ApiResponse.success(patientService.getAllPatients()));
    }

    @GetMapping("/api/admin/patients/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PatientDTO>>> searchPatients(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(patientService.searchPatients(q)));
    }

    @GetMapping("/api/admin/patients/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientByIdAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientById(id)));
    }
}
