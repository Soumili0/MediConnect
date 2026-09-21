package com.mediconnect.controller;

import com.mediconnect.dto.ApiResponse;
import com.mediconnect.dto.DoctorDTO;
import com.mediconnect.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    // Public — search doctors
    @GetMapping("/api/public/doctors")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getActiveDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getActiveDoctors()));
    }

    @GetMapping("/api/public/doctors/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }

    @GetMapping("/api/public/doctors/search")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> searchDoctors(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.searchDoctors(q)));
    }

    @GetMapping("/api/public/doctors/department/{deptId}")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getDoctorsByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsByDepartment(deptId)));
    }

    // Doctor profile (self)
    @GetMapping("/api/doctor/profile/{userId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorByUserId(userId)));
    }

    @PutMapping("/api/doctor/profile/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<DoctorDTO>> updateDoctorProfile(@PathVariable Long id,
                                                                       @RequestBody DoctorDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", doctorService.updateDoctor(id, dto)));
    }

    // Admin
    @GetMapping("/api/admin/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllDoctors()));
    }

    @PostMapping("/api/admin/doctors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorDTO>> createDoctor(@RequestBody Map<String, Object> body) {
        DoctorDTO dto = new DoctorDTO();
        dto.setFirstName((String) body.get("firstName"));
        dto.setLastName((String) body.get("lastName"));
        dto.setEmail((String) body.get("email"));
        dto.setPhone((String) body.get("phone"));
        dto.setDepartmentId(body.get("departmentId") != null ?
                Long.valueOf(body.get("departmentId").toString()) : null);
        dto.setSpecialization((String) body.get("specialization"));
        dto.setLicenseNumber((String) body.get("licenseNumber"));
        dto.setQualification((String) body.get("qualification"));
        dto.setExperienceYears(body.get("experienceYears") != null ?
                Integer.valueOf(body.get("experienceYears").toString()) : null);
        dto.setBio((String) body.get("bio"));
        dto.setConsultationFee(body.get("consultationFee") != null ?
                Double.valueOf(body.get("consultationFee").toString()) : 0.0);
        dto.setAvailableDays((String) body.get("availableDays"));
        dto.setAvailableHours((String) body.get("availableHours"));
        String password = (String) body.get("password");
        return ResponseEntity.ok(ApiResponse.success("Doctor created", doctorService.createDoctor(dto, password)));
    }

    @PutMapping("/api/admin/doctors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorDTO>> updateDoctor(@PathVariable Long id,
                                                                @RequestBody DoctorDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Doctor updated", doctorService.updateDoctor(id, dto)));
    }

    @DeleteMapping("/api/admin/doctors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deactivated", null));
    }
}
