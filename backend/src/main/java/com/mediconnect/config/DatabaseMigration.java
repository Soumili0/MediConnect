package com.mediconnect.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs schema fixes at startup that Hibernate ddl-auto=update misses.
 * Runs BEFORE DataSeeder (Order 1).
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DatabaseMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        alterDoctorsDepartmentNullable();
        alterDoctorsSpecializationNullable();
        alterDoctorsLicenseNullable();
        log.info("✅ Schema migration checks complete");
    }

    private void alterDoctorsDepartmentNullable() {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE doctors MODIFY COLUMN department_id BIGINT NULL"
            );
            log.info("  ✔ doctors.department_id → NULL allowed");
        } catch (Exception e) {
            log.debug("  ℹ doctors.department_id already nullable or table not yet created");
        }
    }

    private void alterDoctorsSpecializationNullable() {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE doctors MODIFY COLUMN specialization VARCHAR(255) NULL"
            );
            log.info("  ✔ doctors.specialization → NULL allowed");
        } catch (Exception e) {
            log.debug("  ℹ doctors.specialization already nullable or table not yet created");
        }
    }

    private void alterDoctorsLicenseNullable() {
        try {
            jdbcTemplate.execute(
                "ALTER TABLE doctors MODIFY COLUMN license_number VARCHAR(255) NULL"
            );
            log.info("  ✔ doctors.license_number → NULL allowed");
        } catch (Exception e) {
            log.debug("  ℹ doctors.license_number already nullable or table not yet created");
        }
    }
}
