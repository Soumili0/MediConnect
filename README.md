# 🏥 MediConnect — Hospital & Appointment Management System

A full-stack web application for managing hospital operations including doctor appointments, patient records, prescriptions, and administrative tasks — built with **Spring Boot** (backend) and **React.js** (frontend).

---

## 📸 Features Overview

### 👨‍💼 Admin
- Dashboard with live statistics (doctors, patients, appointments)
- Pie chart & bar chart analytics
- Manage Doctors — add, edit, deactivate
- Manage Patients — view, search
- Manage Departments — add, edit, deactivate
- Manage Appointments — view all, filter by status

### 👨‍⚕️ Doctor
- Dashboard with today's appointments
- View & manage appointments — confirm, diagnose, complete, cancel
- Add diagnosis notes directly from appointment
- Issue prescriptions with medicine list
- View patient medical records and add new ones (vitals + diagnosis)

### 👤 Patient
- Dashboard with upcoming appointments & active prescriptions
- Search doctors by name, specialization, or department
- Book appointments (in-person or online) with date/time picker
- View & cancel appointments
- View prescriptions with full medicine details
- View medical records with vitals (BP, HR, temp, weight)
- Edit personal profile (blood group, allergies, emergency contact)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 19, React Router v7, Axios, Recharts, React Toastify |
| Backend | Java 17, Spring Boot 3.2, Spring MVC, Spring Security |
| ORM | Spring Data JPA, Hibernate |
| Auth | JWT (JSON Web Token) |
| Database | MySQL 8 |
| Build Tool | Maven |

---

## 📁 Project Structure

```
MediConnect/
├── backend/                        # Spring Boot application
│   ├── src/main/java/com/mediconnect/
│   │   ├── config/                 # Security, Audit, CORS, DataSeeder
│   │   ├── controller/             # REST API controllers
│   │   ├── dto/                    # Data Transfer Objects
│   │   ├── entity/                 # JPA entities
│   │   ├── exception/              # Global exception handler
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── security/               # JWT filter, UserDetails
│   │   └── service/                # Business logic
│   └── src/main/resources/
│       └── application.properties  # DB + JWT config
│
└── frontend/                       # React application
    └── src/
        ├── components/             # Sidebar, Topbar, Modal, StatusBadge
        ├── context/                # AuthContext (JWT storage)
        ├── layouts/                # AdminLayout, DoctorLayout, PatientLayout
        ├── pages/
        │   ├── admin/              # Dashboard, Doctors, Patients, Departments, Appointments
        │   ├── auth/               # Login, Register
        │   ├── doctor/             # Dashboard, Appointments, Patients, Prescriptions
        │   └── patient/            # Dashboard, Doctors, Appointments, Prescriptions, Records, Profile
        └── services/
            └── api.js              # Axios instance + all API calls
```

---

## ⚙️ Prerequisites

Make sure the following are installed on your machine:

- **Java 17+** → [Download](https://adoptium.net/)
- **Maven 3.8+** → [Download](https://maven.apache.org/)
- **Node.js 18+** → [Download](https://nodejs.org/)
- **MySQL 8+** → [Download](https://dev.mysql.com/downloads/)

---

## 🗄️ Database Setup

MySQL is already running on your machine. The application will **automatically create the database** on first run.

Default config in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mediconnect_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
```

> ⚠️ If your MySQL password is different, update `spring.datasource.password` in `application.properties`.

Hibernate is set to `ddl-auto=update` — all tables are **auto-created** on startup. No SQL scripts needed.

---

## 🚀 Running the Application

### Step 1 — Start the Backend

Open a terminal and run:

```bash
cd MediConnect/backend
mvn spring-boot:run
```

Backend starts at → **http://localhost:8080**

On first startup, the `DataSeeder` automatically creates:
- ✅ Admin account
- ✅ 8 departments (Cardiology, Neurology, Orthopedics, etc.)
- ✅ 5 sample doctors

### Step 2 — Start the Frontend

Open a **second terminal** and run:

```bash
cd MediConnect/frontend
npm install
npm run dev
```

Frontend starts at → **http://localhost:3000**

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@mediconnect.com | admin123 |
| **Doctor** | arjun.sharma@mediconnect.com | LIC001 |
| **Doctor** | priya.verma@mediconnect.com | LIC002 |
| **Doctor** | rohit.singh@mediconnect.com | LIC003 |
| **Doctor** | kavya.nair@mediconnect.com | LIC004 |
| **Doctor** | suresh.patel@mediconnect.com | LIC005 |
| **Patient** | *(Register yourself)* | — |

> Patients register at `http://localhost:3000/register`

---

## 🌐 API Endpoints Reference

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |

### Departments
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/public/departments` | Public |
| GET | `/api/admin/departments` | Admin |
| POST | `/api/admin/departments` | Admin |
| PUT | `/api/admin/departments/{id}` | Admin |
| DELETE | `/api/admin/departments/{id}` | Admin |

### Doctors
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/public/doctors` | Public |
| GET | `/api/public/doctors/search?q=` | Public |
| GET | `/api/public/doctors/department/{id}` | Public |
| POST | `/api/admin/doctors` | Admin |
| PUT | `/api/admin/doctors/{id}` | Admin |
| DELETE | `/api/admin/doctors/{id}` | Admin |
| PUT | `/api/doctor/profile/{id}` | Doctor |

### Appointments
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/patient/appointments` | Patient |
| GET | `/api/patient/appointments/{patientId}` | Patient |
| PATCH | `/api/patient/appointments/{id}/cancel` | Patient |
| GET | `/api/doctor/appointments/{doctorId}` | Doctor |
| PATCH | `/api/doctor/appointments/{id}/status` | Doctor |
| PATCH | `/api/doctor/appointments/{id}/diagnosis` | Doctor |
| GET | `/api/admin/appointments` | Admin |

### Medical Records
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/patient/records/{patientId}` | Patient |
| POST | `/api/doctor/records` | Doctor |
| PUT | `/api/doctor/records/{id}` | Doctor |

### Prescriptions
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/patient/prescriptions/{patientId}` | Patient |
| GET | `/api/patient/prescriptions/{patientId}/active` | Patient |
| POST | `/api/doctor/prescriptions` | Doctor |
| PUT | `/api/doctor/prescriptions/{id}` | Doctor |

### Stats
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/admin/stats` | Admin |

---

## 🗃️ Database Schema

```
users           → id, firstName, lastName, email, password, phone, role, active
departments     → id, name, description, location, headOfDepartment, active
doctors         → id, user_id, department_id, specialization, licenseNumber,
                  qualification, experienceYears, consultationFee, availableDays, active
patients        → id, user_id, dateOfBirth, gender, bloodGroup, address,
                  emergencyContact, allergies, chronicDiseases
appointments    → id, patient_id, doctor_id, appointmentDate, appointmentTime,
                  status, type, reason, notes, diagnosis, consultationFee
medical_records → id, patient_id, doctor_id, appointment_id, recordDate, title,
                  diagnosis, symptoms, treatment, bloodPressure, heartRate, temperature
prescriptions   → id, appointment_id, patient_id, doctor_id, prescriptionDate,
                  validUntil, diagnosis, medicines (JSON), instructions, active
```

---

## 🔧 Configuration

### Change MySQL Password

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.password=YOUR_PASSWORD_HERE
```

### Change JWT Secret

```properties
app.jwt.secret=YourCustomSecretKeyHere
app.jwt.expiration=86400000   # 24 hours in milliseconds
```

### Change Frontend API Base URL

Edit `frontend/src/services/api.js`:

```js
const BASE_URL = 'http://localhost:8080';
```

---

## 🐛 Common Issues

| Issue | Fix |
|---|---|
| `Access denied for user 'root'@'localhost'` | Check MySQL password in `application.properties` |
| `Port 8080 already in use` | Kill the process or change `server.port` in `application.properties` |
| `Port 3000 already in use` | React will ask to use another port — press `Y` |
| Frontend shows blank page | Check browser console; make sure backend is running on port 8080 |
| `CORS error` | Backend is already configured for `http://localhost:3000` — no action needed |

---

## 👨‍💻 Development Notes

- JWT token is stored in `localStorage` under key `mediconnect_token`
- All API requests automatically attach the Bearer token via Axios interceptor
- `401 Unauthorized` responses automatically redirect to `/login`
- Hibernate `ddl-auto=update` keeps the schema in sync with entity changes
- The `DataSeeder` only runs once — it checks existence before inserting

---

## 📄 License

This project is for educational purposes.

---

*Built with ❤️ using Spring Boot + React.js @Mili*
