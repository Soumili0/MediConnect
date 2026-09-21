package com.mediconnect.config;

import com.mediconnect.entity.Department;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.User;
import com.mediconnect.repository.DepartmentRepository;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedDepartments();
        seedSampleDoctors();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@mediconnect.com")) return;

        User admin = User.builder()
                .firstName("Admin")
                .lastName("MediConnect")
                .email("admin@mediconnect.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("9800000000")
                .role(User.Role.ADMIN)
                .active(true)
                .build();
        userRepository.save(admin);
        log.info("✅ Admin seeded: admin@mediconnect.com / admin123");
    }

    private void seedDepartments() {
        String[][] depts = {
            {"Cardiology",      "Heart and cardiovascular system",         "Block A"},
            {"Neurology",       "Brain and nervous system disorders",       "Block B"},
            {"Orthopedics",     "Bones, joints and musculoskeletal system", "Block C"},
            {"Pediatrics",      "Medical care for children",               "Block D"},
            {"Dermatology",     "Skin, hair and nail conditions",           "Block E"},
            {"Gynecology",      "Women's reproductive health",             "Block F"},
            {"General Medicine","General health and primary care",         "Block G"},
            {"ENT",             "Ear, nose and throat disorders",           "Block H"},
        };

        for (String[] d : depts) {
            if (!departmentRepository.existsByName(d[0])) {
                departmentRepository.save(Department.builder()
                        .name(d[0])
                        .description(d[1])
                        .location(d[2])
                        .active(true)
                        .build());
            }
        }
        log.info("✅ Departments seeded");
    }

    private void seedSampleDoctors() {
        // Only seed if no doctors exist
        if (doctorRepository.count() > 0) return;

        Department cardiology   = departmentRepository.findByName("Cardiology").orElse(null);
        Department neurology    = departmentRepository.findByName("Neurology").orElse(null);
        Department orthopedics  = departmentRepository.findByName("Orthopedics").orElse(null);
        Department pediatrics   = departmentRepository.findByName("Pediatrics").orElse(null);
        Department generalMed   = departmentRepository.findByName("General Medicine").orElse(null);

        Object[][] doctors = {
            {"Arjun",  "Sharma",  "arjun.sharma@mediconnect.com",  "9811111111", cardiology,  "Cardiologist",        "MBBS, MD (Cardiology)",  12, "LIC001", 800.0,  "MON,TUE,WED,THU,FRI", "09:00-13:00"},
            {"Priya",  "Verma",   "priya.verma@mediconnect.com",   "9822222222", neurology,   "Neurologist",         "MBBS, DM (Neurology)",   8,  "LIC002", 700.0,  "MON,WED,FRI",         "10:00-14:00"},
            {"Rohit",  "Singh",   "rohit.singh@mediconnect.com",   "9833333333", orthopedics, "Orthopedic Surgeon",  "MBBS, MS (Ortho)",       10, "LIC003", 600.0,  "TUE,THU,SAT",         "09:00-12:00"},
            {"Kavya",  "Nair",    "kavya.nair@mediconnect.com",    "9844444444", pediatrics,  "Pediatrician",        "MBBS, DCH",              6,  "LIC004", 500.0,  "MON,TUE,WED,THU,FRI", "08:00-12:00"},
            {"Suresh", "Patel",   "suresh.patel@mediconnect.com",  "9855555555", generalMed,  "General Physician",   "MBBS, MD",               15, "LIC005", 400.0,  "MON,TUE,WED,THU,FRI", "09:00-17:00"},
        };

        for (Object[] d : doctors) {
            if (d[4] == null) continue;
            String email = (String) d[2];
            if (userRepository.existsByEmail(email)) continue;

            User user = User.builder()
                    .firstName((String) d[0])
                    .lastName((String) d[1])
                    .email(email)
                    .password(passwordEncoder.encode((String) d[8])) // password = license number
                    .phone((String) d[3])
                    .role(User.Role.DOCTOR)
                    .active(true)
                    .build();
            user = userRepository.save(user);

            doctorRepository.save(Doctor.builder()
                    .user(user)
                    .department((Department) d[4])
                    .specialization((String) d[5])
                    .qualification((String) d[6])
                    .experienceYears((Integer) d[7])
                    .licenseNumber((String) d[8])
                    .consultationFee((Double) d[9])
                    .availableDays((String) d[10])
                    .availableHours((String) d[11])
                    .active(true)
                    .build());
        }
        log.info("✅ Sample doctors seeded (password = each doctor's license number)");
    }
}
