package com.mediconnect.service;

import com.mediconnect.dto.AuthRequest;
import com.mediconnect.dto.AuthResponse;
import com.mediconnect.dto.RegisterRequest;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.Patient;
import com.mediconnect.entity.User;
import com.mediconnect.exception.BadRequestException;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.PatientRepository;
import com.mediconnect.repository.UserRepository;
import com.mediconnect.security.JwtUtils;
import com.mediconnect.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    // ─── LOGIN ───────────────────────────────────────────────────────────────
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtUtils.generateToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Long profileId = null;
        if (userDetails.getRole() == User.Role.DOCTOR) {
            profileId = doctorRepository.findByUserId(userDetails.getId())
                    .map(Doctor::getId).orElse(null);
        } else if (userDetails.getRole() == User.Role.PATIENT) {
            profileId = patientRepository.findByUserId(userDetails.getId())
                    .map(Patient::getId).orElse(null);
        }

        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(userDetails.getId())
                .email(userDetails.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(userDetails.getRole())
                .profileId(profileId)
                .build();
    }

    // ─── REGISTER (PATIENT ONLY) ──────────────────────────────────────────────
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        // Public registration is PATIENT only.
        // Doctor accounts are created by Admin from the dashboard.
        // Admin accounts are seeded at startup — not publicly registerable.
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(User.Role.PATIENT)   // always PATIENT, ignore any role in request
                .active(true)
                .build();
        user = userRepository.save(user);

        Patient patient = Patient.builder().user(user).build();
        patient = patientRepository.save(patient);

        String token = jwtUtils.generateTokenFromEmail(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(User.Role.PATIENT)
                .profileId(patient.getId())
                .build();
    }
}
