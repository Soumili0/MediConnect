package com.mediconnect.service;

import com.mediconnect.dto.DepartmentDTO;
import com.mediconnect.entity.Department;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.exception.ResourceNotFoundException;
import com.mediconnect.repository.DepartmentRepository;
import com.mediconnect.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;

    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<DepartmentDTO> getActiveDepartments() {
        return departmentRepository.findByActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public DepartmentDTO getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        return toDTO(dept);
    }

    @Transactional
    public DepartmentDTO createDepartment(DepartmentDTO dto) {
        if (departmentRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Department already exists: " + dto.getName());
        }
        Department dept = Department.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .headOfDepartment(dto.getHeadOfDepartment())
                .active(true)
                .build();
        return toDTO(departmentRepository.save(dept));
    }

    @Transactional
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        if (dto.getName() != null) dept.setName(dto.getName());
        if (dto.getDescription() != null) dept.setDescription(dto.getDescription());
        if (dto.getLocation() != null) dept.setLocation(dto.getLocation());
        if (dto.getHeadOfDepartment() != null) dept.setHeadOfDepartment(dto.getHeadOfDepartment());
        if (dto.getActive() != null) dept.setActive(dto.getActive());
        return toDTO(departmentRepository.save(dept));
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        dept.setActive(false);
        departmentRepository.save(dept);
    }

    private DepartmentDTO toDTO(Department dept) {
        int count = doctorRepository.findByDepartmentId(dept.getId()).size();
        return DepartmentDTO.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .location(dept.getLocation())
                .headOfDepartment(dept.getHeadOfDepartment())
                .active(dept.getActive())
                .doctorCount(count)
                .build();
    }
}
