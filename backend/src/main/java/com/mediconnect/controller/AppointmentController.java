package com.mediconnect.controller;

import com.mediconnect.dto.ApiResponse;
import com.mediconnect.dto.AppointmentDTO;
import com.mediconnect.entity.Appointment;
import com.mediconnect.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // Patient: book appointment
    @PostMapping("/patient/appointments")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentDTO>> bookAppointment(@RequestBody AppointmentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Appointment booked", appointmentService.bookAppointment(dto)));
    }

    // Patient: view own appointments
    @GetMapping("/patient/appointments/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getPatientAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentsByPatient(patientId)));
    }

    // Patient: cancel appointment
    @PatchMapping("/patient/appointments/{id}/cancel")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", null));
    }

    // Doctor: view own appointments
    @GetMapping("/doctor/appointments/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentsByDoctor(doctorId)));
    }

    // Doctor: update status
    @PatchMapping("/doctor/appointments/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateStatus(@PathVariable Long id,
                                                                     @RequestBody Map<String, String> body) {
        Appointment.Status status = Appointment.Status.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Status updated", appointmentService.updateStatus(id, status)));
    }

    // Doctor: add diagnosis
    @PatchMapping("/doctor/appointments/{id}/diagnosis")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentDTO>> addDiagnosis(@PathVariable Long id,
                                                                     @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Diagnosis saved",
                appointmentService.addDiagnosis(id, body.get("diagnosis"), body.get("notes"))));
    }

    // Admin: all appointments
    @GetMapping("/admin/appointments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAllAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAllAppointments()));
    }

    @GetMapping("/admin/appointments/today")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getTodayAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getTodayAppointments()));
    }

    @GetMapping("/admin/appointments/date/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getByDate(@PathVariable String date) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentsByDate(LocalDate.parse(date))));
    }

    @GetMapping("/admin/appointments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentDTO>> getAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentById(id)));
    }

    @PutMapping("/admin/appointments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateAppointment(@PathVariable Long id,
                                                                          @RequestBody AppointmentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Updated", appointmentService.updateAppointment(id, dto)));
    }
}
