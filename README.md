<div align="center">

<h1>🏥 NexCare — Healthcare Appointment System</h1>

<p><strong>The next generation of healthcare management. Seamless appointments, AI-powered guidance, real-time chat, digital prescriptions, and more — all in one premium platform.</strong></p>

<br/>

![Landing Page](docs/screenshots/Screenshot%202026-11-01%20005438.png)

<br/>

[![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.3-6DB33F?style=for-the-badge&logo=spring)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-blue?style=for-the-badge)](https://spring.io/guides/gs/messaging-stomp-websocket/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI%20Powered-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)

<br/><br/>

### 🌐 Live Deployments

| Component | Platform | Live URL |
| :--- | :--- | :--- |
| **Frontend Application** | **Vercel** | [![Vercel](https://img.shields.io/badge/Live_Site-Vercel-black?style=for-the-badge&logo=vercel)](https://healthcare-appointment-system-healt.vercel.app/) [healthcare-appointment-system-healt.vercel.app](https://healthcare-appointment-system-healt.vercel.app/) |
| **Backend API Service** | **Render** | [![Render](https://img.shields.io/badge/API_Server-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://healthcare-appointment-system-1-eb9c.onrender.com) [healthcare-appointment-system-1-eb9c.onrender.com](https://healthcare-appointment-system-1-eb9c.onrender.com) |

</div>

---

## 📋 Table of Contents

- [Live Deployments](#-live-deployments)

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Running Locally](#-running-locally)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)

---

## 🌟 Overview

**NexCare** is a full-stack healthcare appointment management system built with **Spring Boot** and a modern **Vanilla JS** frontend. It supports three user roles — **Patient**, **Doctor**, and **Admin** — each with their own dedicated portal and feature set.

The platform supports end-to-end appointment booking, secure payments, AI-assisted health guidance, real-time WebSocket-based doctor-patient chat, digital prescriptions, medical record management, automated email reminders, and much more.

---

## ✨ Features

### 👤 Patient Portal
- 🔍 **Browse & Filter Doctors** — Search by specialization, experience, rating, and fee
- 📅 **Slot-based Appointment Booking** — Pick available time slots from doctor schedules
- 💳 **Multiple Payment Modes** — Credit/Debit Card, UPI (GPay, PhonePe, Paytm), or Pay at Clinic
- 🔔 **Real-time Notifications** — Receive alerts from doctors (e.g. reschedule requests)
- 💊 **Medical Records & Prescriptions** — View diagnoses, test reports, and downloadable PDF prescriptions
- 💬 **Chat with Doctor** — Real-time WebSocket-powered messaging
- 🤖 **AI Health Guide** — Powered by Google Gemini for pre-consultation health guidance
- 📊 **Dashboard Overview** — Upcoming appointments, pending bills, active prescriptions

### 🩺 Doctor Portal
- 📆 **Manage Appointments** — View all booked appointments with patient details and contact info
- ✅ **Complete Appointments** — Fill medical records and prescriptions on appointment completion
- 🕐 **Manage Available Slots** — Create and manage time slots for patients to book
- 📢 **Send Announcements** — Push targeted notifications to specific patients
- ⭐ **View Patient Reviews** — See ratings and feedback per appointment
- 📊 **Analytics Dashboard** — Revenue trends (7-day chart), appointments by status (donut chart)
- 💬 **Chat with Patients** — Real-time messaging via WebSocket

### 🛡️ Admin Portal
- 👥 **User Management** — View and manage all patients, doctors, and registrations
- 📣 **Campaign Management** — Send broadcast campaigns to all users
- 📊 **System Overview** — Monitor platform-wide activity

### 🔐 Authentication & Security
- **OTP-based Email Verification** — Registration requires OTP sent to email (expires in 10 minutes)
- **JWT Authentication** — Stateless token-based auth with role-based access control
- **Spring Security** — Custom `JwtAuthFilter` and security filter chain
- **Password Encryption** — BCrypt hashing

### ⚙️ Background Services
- **Appointment Auto-Expiry** — Scheduled tasks auto-expire past appointments and issue refunds
- **Email Reminders** — Automated reminder emails before upcoming appointments
- **Notification Scheduler** — Background job for delivery of patient notifications

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21, Spring Boot 4.0.3, Spring MVC, Spring Security |
| **Database ORM** | Hibernate / Spring Data JPA |
| **Database** | PostgreSQL 18 |
| **Real-time** | Spring WebSocket (STOMP over SockJS) |
| **Authentication** | JWT (jjwt 0.12.5), OTP via Email |
| **Email** | Spring Mail (Gmail SMTP) |
| **AI** | Google Gemini API |
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **Build Tool** | Apache Maven (Maven Wrapper) |
| **Containerization** | Docker |

---

## 📸 Screenshots

### 🏠 Landing Page
> Premium dark-mode landing page with glassmorphism UI and animated elements.

![Landing Page](docs/screenshots/Screenshot%202026-11-01%20005438.png)

---

### 🔐 Login Page
> Secure login with a split-screen medical aesthetic — healthcare portal branding on the left, login form on the right.

![Login Page](docs/screenshots/Screenshot%202026-11-01%20005521.png)

---

### 📧 Email OTP Verification
> On registration, an OTP is sent to the user's email via Gmail SMTP for secure account verification.

![OTP Email](docs/screenshots/Screenshot%202026-11-01%20011005.png)

---

### 🩺 Patient Dashboard — Browse Doctors
> Patients can search, filter, and book appointments with specialists. Includes an AI Health Guide button for pre-consultation guidance.

![Patient Dashboard](docs/screenshots/Screenshot%202026-11-01%20005559.png)

---

### 📅 Slot Selection
> A modal displays available time slots when a patient clicks "Book Appointment" on a doctor's card.

![Slot Selection](docs/screenshots/Screenshot%202026-11-01%20005817.png)

---

### 💳 Payment Gateway
> Patients choose from Credit/Debit Card, UPI (GPay, PhonePe, Paytm), or Pay at Clinic. Includes a booking summary with total amount.

![Payment](docs/screenshots/Screenshot%202026-11-01%20005850.png)

---

### 📋 Patient — My Appointments
> View all booked appointments with doctor name, date/time, status, and a cancel option.

![Patient Appointments](docs/screenshots/Screenshot%202026-11-01%20005910.png)

---

### 🔔 Patient — Notifications
> Real-time notification bell shows messages from doctors — such as reschedule requests with custom messages.

![Notifications](docs/screenshots/Screenshot%202026-11-01%20010215.png)

---

### 🏥 Patient — Medical Records & Prescriptions
> Patients can view their diagnoses, test reports, and download PDF prescriptions issued by doctors.

![Medical Records](docs/screenshots/Screenshot%202026-11-01%20010700.png)

---

### 🩺 Doctor — Appointment Management
> Doctors see patient details (name, phone), date/time, payment status, and can Complete or Cancel appointments.

![Doctor Appointments](docs/screenshots/Screenshot%202026-11-01%20005943.png)

---

### 📝 Doctor — Complete Appointment
> When completing an appointment, doctors fill in the medical record (diagnosis, symptoms, treatment) and prescriptions.

![Complete Appointment](docs/screenshots/Screenshot%202026-11-01%20010253.png)

---

### 📢 Doctor — Send Announcement
> Doctors can send targeted notifications to specific patients (e.g. reschedule notices with custom messages).

![Announcements](docs/screenshots/Screenshot%202026-11-01%20010150.png)

---

### 💬 Doctor — Chat with Patients
> Real-time WebSocket chat between doctors and their patients with a clean two-panel interface.

![Chat](docs/screenshots/Screenshot%202026-11-01%20010611.png)

---

### 📊 Doctor — Analytics Dashboard
> Overview showing total appointments, earnings, patients seen — plus a 7-day revenue line chart and appointment status donut chart.

![Doctor Dashboard](docs/screenshots/Screenshot%202026-11-01%20010639.png)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (HTML/JS)                  │
│   index.html  |  patient.html  |  doctor.html           │
│   admin.html  |  login.html    |  register.html         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP REST + WebSocket (STOMP)
                        ▼
┌─────────────────────────────────────────────────────────┐
│               Spring Boot Backend (:8080)               │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Auth    │  │ Patient  │  │  Doctor  │             │
│  │Controller│  │Controller│  │Controller│             │
│  └──────────┘  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Admin   │  │  Chat    │  │  Review  │             │
│  │Controller│  │Controller│  │Controller│             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌─────────────────────────────────────────┐           │
│  │           Spring Security               │           │
│  │    JWT Filter → Role-based Access       │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  ┌─────────────┐   ┌─────────────┐  ┌───────────┐     │
│  │  Gemini AI  │   │  Email SMTP │  │ Scheduler │     │
│  │   Service   │   │   Service   │  │  (Tasks)  │     │
│  └─────────────┘   └─────────────┘  └───────────┘     │
└───────────────────────┬─────────────────────────────────┘
                        │ Spring Data JPA / Hibernate
                        ▼
              ┌─────────────────────┐
              │   PostgreSQL DB     │
              │  (Local / Render)   │
              └─────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Java JDK | **21** (LTS) | [Eclipse Temurin 21](https://adoptium.net/) recommended |
| PostgreSQL | 15+ | Local or cloud (e.g. Render, Supabase) |
| Maven | 3.9+ | Included via `mvnw` wrapper — no install needed |

> ⚠️ **Java 25+ (including Java 27) is NOT compatible** with the Lombok version used. Use **Java 21 LTS**.

---

### 1. Clone the Repository

```bash
git clone https://github.com/nairkartik08/healthcare-appointment-system.git
cd healthcare-appointment-system
```

---

### 2. Set Up the Database

Connect to your PostgreSQL instance and run:

```sql
CREATE DATABASE healthcare_db;
CREATE USER healthcare_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE healthcare_db TO healthcare_user;
ALTER DATABASE healthcare_db OWNER TO healthcare_user;
GRANT ALL ON SCHEMA public TO healthcare_user;
```

---

### 3. Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/healthcare_db
spring.datasource.username=healthcare_user
spring.datasource.password=yourpassword

# Email (Gmail SMTP)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password   # Use Gmail App Password

# Gemini AI
gemini.api.key=your-gemini-api-key
```

> 💡 For Gmail, generate an **App Password** at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (requires 2FA enabled).

> 💡 Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/app/apikey).

---

## ▶️ Running Locally

### Backend (Spring Boot)

**Windows (PowerShell):**
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**
```bash
export JAVA_HOME=/path/to/jdk-21
./mvnw spring-boot:run
```

The backend will start on **http://localhost:8080**

Hibernate will **automatically create all database tables** on first boot (`ddl-auto=update`).

---

### Frontend

The frontend is a **static HTML/JS application** — no build step required.

Simply open the file in your browser:

```
healthcare-frontend/index.html
```

Or run a quick local server:
```bash
cd healthcare-frontend
npx serve .
```

Then visit **http://localhost:3000**

---

### 🐳 Docker (Optional)

```bash
docker build -t nexcare .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/healthcare_db \
  -e SPRING_DATASOURCE_USERNAME=healthcare_user \
  -e SPRING_DATASOURCE_PASSWORD=yourpassword \
  nexcare
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user (sends OTP) |
| `POST` | `/api/auth/verify-otp` | Verify OTP to complete registration |
| `POST` | `/api/auth/login` | Login and receive JWT token |

### Patient
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patient/doctors` | List all doctors with filters |
| `GET` | `/api/patient/slots/{doctorId}` | Get available slots for a doctor |
| `POST` | `/api/patient/appointments` | Book an appointment |
| `GET` | `/api/patient/appointments` | View my appointments |
| `DELETE` | `/api/patient/appointments/{id}` | Cancel an appointment |
| `GET` | `/api/patient/medical-records` | View medical records |
| `GET` | `/api/patient/prescriptions` | View active prescriptions |
| `GET` | `/api/patient/notifications` | Get notifications |

### Doctor
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/doctor/appointments` | View all my appointments |
| `POST` | `/api/doctor/appointments/{id}/complete` | Complete appointment (add records) |
| `POST` | `/api/doctor/slots` | Create available time slots |
| `POST` | `/api/doctor/announcements` | Send targeted notifications |
| `GET` | `/api/doctor/reviews` | View patient reviews |

### Chat (WebSocket)
| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8080/ws` | WebSocket handshake endpoint (SockJS) |
| `/app/chat.send` | Send a chat message |
| `/user/{userId}/queue/messages` | Subscribe to incoming messages |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/triage` | AI Health Guide — symptom analysis via Gemini |

---

## 📁 Project Structure

```
healthcare-appointment-system/
│
├── src/main/java/com/healthcare/healthcare_system/
│   ├── config/
│   │   ├── SecurityConfig.java        # Spring Security setup
│   │   ├── WebConfig.java             # CORS configuration
│   │   └── WebSocketConfig.java       # STOMP WebSocket config
│   │
│   ├── controller/
│   │   ├── AuthController.java        # Registration, OTP, Login
│   │   ├── PatientController.java     # Patient endpoints
│   │   ├── DoctorController.java      # Doctor endpoints
│   │   ├── AdminController.java       # Admin endpoints
│   │   ├── ChatController.java        # WebSocket message handling
│   │   ├── ReviewController.java      # Patient reviews
│   │   ├── AiController.java          # Gemini AI integration
│   │   ├── AppointmentController.java # Appointment management
│   │   ├── PaymentController.java     # Payment processing
│   │   └── ...
│   │
│   ├── model/                         # JPA Entities
│   │   ├── User.java, Patient.java, Doctor.java, Admin.java
│   │   ├── Appointment.java, Slot.java
│   │   ├── MedicalRecord.java, Prescription.java
│   │   ├── Payment.java, Invoice.java
│   │   ├── Review.java, ChatMessage.java
│   │   ├── PatientNotification.java, Campaign.java
│   │   └── ...
│   │
│   ├── service/                       # Business logic
│   ├── repository/                    # Spring Data JPA repos
│   ├── security/                      # JWT filter, channel interceptor
│   ├── task/                          # Scheduled tasks (auto-expiry, reminders)
│   ├── dto/                           # Request/Response DTOs
│   └── component/                     # NotificationScheduler
│
├── src/main/resources/
│   └── application.properties         # App configuration
│
├── healthcare-frontend/               # Static Frontend
│   ├── index.html                     # Landing page
│   ├── pages/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── patient.html
│   │   ├── doctor.html
│   │   ├── admin.html
│   │   └── payment.html
│   ├── js/
│   │   ├── api.js                     # Axios-like API helper
│   │   ├── auth.js                    # Login/register logic
│   │   ├── patient.js                 # Patient portal logic
│   │   ├── doctor.js                  # Doctor portal logic
│   │   ├── admin.js                   # Admin portal logic
│   │   ├── chat.js                    # WebSocket chat logic
│   │   └── payment.js                 # Payment page logic
│   └── css/
│       └── styles.css                 # Premium dark-mode design system
│
├── docs/
│   └── screenshots/                   # UI screenshots
│
├── Dockerfile                         # Docker build config
├── pom.xml                            # Maven dependencies
└── README.md
```

---

## 🔧 Environment Variables

| Property | Description | Example |
|---|---|---|
| `spring.datasource.url` | JDBC connection string | `jdbc:postgresql://localhost:5432/healthcare_db` |
| `spring.datasource.username` | DB username | `healthcare_user` |
| `spring.datasource.password` | DB password | `yourpassword` |
| `spring.mail.username` | Gmail address for sending emails | `yourapp@gmail.com` |
| `spring.mail.password` | Gmail App Password (not your login password) | `xxxx xxxx xxxx xxxx` |
| `gemini.api.key` | Google Gemini API key | `AIzaSy...` |
| `PORT` | Server port (defaults to 8080) | `8080` |

---

## 👨‍💻 Author

**Kartik Nair**

[![GitHub](https://img.shields.io/badge/GitHub-nairkartik08-181717?style=for-the-badge&logo=github)](https://github.com/nairkartik08)

---

<div align="center">
<sub>Built with ❤️ using Spring Boot, PostgreSQL, and a whole lot of ☕</sub>
</div>
