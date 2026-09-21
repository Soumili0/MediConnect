package com.mediconnect.service;

import com.mediconnect.dto.DoctorDTO;
import com.mediconnect.entity.Department;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.User;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.DepartmentRepository;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DoctorDTO> getActiveDoctors() {
        return doctorRepository.findByActiveTrue().stream()
                .filter(d -> d.getDepartment() != null) // only show fully set-up doctors publicly
                .map(this::toDTO).collect(Collectors.toList());
    }

    public DoctorDTO getDoctorById(Long id) {
        return toDTO(doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id)));
    }

    public DoctorDTO getDoctorByUserId(Long userId) {
        return toDTO(doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found for userId: " + userId)));
    }

    public List<DoctorDTO> getDoctorsByDepartment(Long deptId) {
        return doctorRepository.findByDepartmentId(deptId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<DoctorDTO> searchDoctors(String query) {
        return doctorRepository.searchDoctors(query).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public DoctorDTO createDoctor(DoctorDTO dto, String password) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already registered: " + dto.getEmail());
        }
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", dto.getDepartmentId()));

        User user = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                // Default password = license number; fallback to "doctor@123" if not provided
                .password(passwordEncoder.encode(
                        (password != null && !password.isBlank()) ? password :
                        (dto.getLicenseNumber() != null && !dto.getLicenseNumber().isBlank()) ? dto.getLicenseNumber() :
                        "doctor@123"
                ))
                .role(User.Role.DOCTOR)
                .active(true)
                .build();
        user = userRepository.save(user);

        Doctor doctor = Doctor.builder()
                .user(user)
                .department(dept)
                .specialization(dto.getSpecialization())
                .licenseNumber(dto.getLicenseNumber() != null ? dto.getLicenseNumber() : "N/A")
                .qualification(dto.getQualification())
                .experienceYears(dto.getExperienceYears())
                .bio(dto.getBio())
                .consultationFee(dto.getConsultationFee() != null ? dto.getConsultationFee() : 0.0)
                .availableDays(dto.getAvailableDays())
                .availableHours(dto.getAvailableHours())
                .active(true)
                .build();
        return toDTO(doctorRepository.save(doctor));
    }

    @Transactional
    public DoctorDTO updateDoctor(Long id, DoctorDTO dto) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id));

        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", dto.getDepartmentId()));
            doctor.setDepartment(dept);
        }
        if (dto.getSpecialization() != null) doctor.setSpecialization(dto.getSpecialization());
        if (dto.getLicenseNumber() != null) doctor.setLicenseNumber(dto.getLicenseNumber());
        if (dto.getQualification() != null) doctor.setQualification(dto.getQualification());
        if (dto.getExperienceYears() != null) doctor.setExperienceYears(dto.getExperienceYears());
        if (dto.getBio() != null) doctor.setBio(dto.getBio());
        if (dto.getConsultationFee() != null) doctor.setConsultationFee(dto.getConsultationFee());
        if (dto.getAvailableDays() != null) doctor.setAvailableDays(dto.getAvailableDays());
        if (dto.getAvailableHours() != null) doctor.setAvailableHours(dto.getAvailableHours());
        if (dto.getActive() != null) doctor.setActive(dto.getActive());

        User user = doctor.getUser();
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        userRepository.save(user);

        return toDTO(doctorRepository.save(doctor));
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id));
        doctor.setActive(false);
        doctor.getUser().setActive(false);
        doctorRepository.save(doctor);
    }

    public DoctorDTO toDTO(Doctor doctor) {
        return DoctorDTO.builder()
                .id(doctor.getId())
                .userId(doctor.getUser().getId())
                .firstName(doctor.getUser().getFirstName())
                .lastName(doctor.getUser().getLastName())
                .email(doctor.getUser().getEmail())
                .phone(doctor.getUser().getPhone())
                .departmentId(doctor.getDepartment() != null ? doctor.getDepartment().getId() : null)
                .departmentName(doctor.getDepartment() != null ? doctor.getDepartment().getName() : "Not Assigned")
                .specialization(doctor.getSpecialization())
                .licenseNumber(doctor.getLicenseNumber())
                .qualification(doctor.getQualification())
                .experienceYears(doctor.getExperienceYears())
                .bio(doctor.getBio())
                .consultationFee(doctor.getConsultationFee())
                .availableDays(doctor.getAvailableDays())
                .availableHours(doctor.getAvailableHours())
                .active(doctor.getActive())
                .build();
    }
}
