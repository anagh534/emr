# Electronic Medical Records (EMR) System

A modern, highly performant Electronic Medical Records (EMR) system designed for clinical operations, staff management, patient directory tracking, appointment scheduling, and security compliance.

---

## 1. Project Overview
This EMR application provides a digital gateway for clinical administration:
*   **Role-Based Dashboards**: Customized workspaces for **Super Admin** (Staff & schedules control), **Receptionists** (Patient records, booking registry, status updates), and **Doctors** (Queue view, clinical consultation note-taking, auto-complete check-outs).
*   **Preventive Slot Locking**: Enforces partial database-level compound unique constraints to block double-booking under concurrent client transactions.
*   **Real-time Socket Sync**: Broadcasts updates on appointment booking, editing, or cancellation to all connected screens instantly, eliminating page refresh requirements.
*   **HIPAA Audit Trails**: Automatically logs administrative and clinical events (Logins, Creations, Status Updates, Cancellations) with timestamped records for administrators.

---

## 2. Folder Structure
The workspace is split into decoupled directories:

```text
emr/
├── backend/
│   ├── config/             # DB Connection setups
│   ├── controllers/        # Business logic handlers (auth, users, patients, appointments, audit)
│   ├── middleware/         # Auth verification & RBAC middlewares
│   ├── models/             # Mongoose DB Schemas (User, Patient, Appointment, AuditLog)
│   ├── routes/             # Express route mappings
│   ├── utils/              # JWT and system logging utilities
│   ├── validators/         # Request schemas validation middlewares
│   ├── package.json        # Backend NPM packages
│   └── server.js           # Server entry point (wrapped HTTP with Socket.IO)
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable layout structures (Sidebar, ProfileSettings)
│   │   ├── context/        # Global Toast & Notification contexts
│   │   ├── features/       # Modular features structure
│   │   │   ├── appointments/ # Schedulers, queues, and consultations views
│   │   │   ├── auth/         # Login forms and credentials hooks
│   │   │   ├── patients/     # Directory registries and directories components
│   │   │   └── users/        # Staff and shift schedules controls
│   │   ├── lib/            # Axios API clients and TanStack Query configurations
│   │   ├── providers/      # Global React Query and WebSocket Providers
│   │   ├── index.css       # Core design styles (dark mode glassmorphism styles)
│   │   └── main.jsx        # Frontend entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite compilation settings
│
└── ENGINEERING_DECISIONS.md # Technical rationales documentation
```

---

## 3. Architecture Overview
The system implements a decoupled **Client-Server Architecture**:
*   **API Gateway Layer**: REST API design using Node.js & Express. Includes Helmet header configurations and dynamic CORS configurations.
*   **State Cache Management**: TanStack React Query manages frontend caching, queries deduplication, background synchronization, and automatic invalidate refreshes.
*   **Real-time WebSocket Channel**: Socket.IO connects clients to the server. State updates trigger broadcast events which prompt frontend caches to reload without UI disruption.

---

## 4. Database Design
MongoDB houses our clinical data. The relationships and constraints are defined below:

### User Schema (`User`)
*   Manages staff and authentication.
*   *Doctor schedule subset*: Embeds work hours, break slots, and clinical department names.
*   *Indexes*: `{ email: 1 }` (unique), compound index `{ role: 1, isActive: 1 }`, and search index `{ name: 1 }`.

### Patient Schema (`Patient`)
*   Chronicles registered patients.
*   *Indexes*: `{ patientId: 1 }` (unique), `{ mobileNumber: 1 }` (unique), and search index `{ name: 1 }`.

### Appointment Schema (`Appointment`)
*   Tracks scheduled visits. Refers to `Patient` and `User` (Doctor).
*   *Double-Booking Guard Index*: Compound index on `{ doctor: 1, date: 1, timeSlot: 1 }` with a partial unique filter `{ isCancelled: false }`.

### AuditLog Schema (`AuditLog`)
*   Maintains audit trail records.
*   *Index*: `{ timestamp: -1 }` (reverse-chronological paging).

---

## 5. API Documentation

### Authentication (`/api/auth`)
*   `POST /register` - Register staff (Super Admin restricted)
*   `POST /login` - Staff login
*   `POST /refresh` - Refresh access tokens
*   `PATCH /update-password` - Self-service password changes

### User Management (`/api/users`)
*   `GET /` - Fetch staff listing (Super Admin/Receptionist)
*   `PATCH /:id/status` - Toggle active/deactive status (Super Admin only)
*   `PATCH /:id/password` - Administrative password reset (Super Admin only)
*   `PATCH /:id/schedule` - Modify doctor shift hours (Super Admin only)

### Patient Directory (`/api/patients`)
*   `GET /` - Paginated and searchable patient records (Receptionist restricted)
*   `POST /` - Register new patient (Receptionist restricted)

### Appointments (`/api/appointments`)
*   `GET /` - Retrieve appointments list
*   `POST /` - Book new appointment slot
*   `PATCH /:id` - Edit appointment details (Status changes and note-taking)

### Audit Trails (`/api/audit-logs`)
*   `GET /` - Paginated event log records (Super Admin restricted)

---

## 6. Environment Variables

### Backend (`backend/.env`)
```env
MONGO_URI=mongodb+srv://...           # MongoDB database connection string
PORT=5000                             # Backend HTTP Server port
JWT_ACCESS_SECRET=your_access_key     # Access JWT Secret
JWT_REFRESH_SECRET=your_refresh_key   # Refresh JWT Secret
JWT_ACCESS_EXPIRY=15m                 # Access token lifetime
JWT_REFRESH_EXPIRY=7d                 # Refresh token lifetime
JWT_REFRESH_EXPIRY_DAYS=7
DEFAULT_ADMIN_EMAIL=admin@emr.com     # Default Super Admin credentials
DEFAULT_ADMIN_PASSWORD=adminpassword
DEFAULT_ADMIN_NAME=Admin
CORS_ORIGIN=http://localhost:5173     # Allowed CORS frontend origin
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api  # Backend API Base Endpoint
```

---

## 7. Installation Instructions

Ensure you have Node.js (version 18+) and MongoDB installed.

### Clone and install backend dependencies:
```bash
cd backend
npm install
```

### Install frontend dependencies:
```bash
cd ../frontend
npm install
```

---

## 8. Running the Project

### Start Backend (starts API and Socket servers):
```bash
cd backend
npm run dev
```
*Note: The server will run on `http://localhost:5000` (seeded default Super Admin credentials: `admin@emr.com` / `123456` if not already modified).*

### Start Frontend:
```bash
cd ../frontend
npm run dev
```
*Note: Vite dev server will run on `http://localhost:5173`.*

---

## 9. Assumptions Made
1.  **Unique Mobile Numbers**: Patients are keyed uniquely under their mobile numbers to prevent double profile creation.
2.  **Explicit Slot Locking**: A slot is assumed locked once booked, check-in is initiated, or completed. A slot is only freed when marked `Cancelled` (flipping the `isCancelled` flag to true).
3.  **Local Timezones**: Dates and slot bookings are parsed matching the Swedish standard `sv` YYYY-MM-DD local format to maintain date index integrity.

---

## 10. Known Limitations
1.  **Memory-only Session Logouts**: Forced logout clears the token memory-cache immediately, but JWT blacklisting is not implemented in Redis (meaning the token remains technically valid until expiration).
2.  **Flat Scheduling Slots**: Working hours are split in fixed durations of 15-minute grids. Variable-length appointments must be split manually.

---

## 11. Future Improvements & Scaling

### Handling High-Concurrency Booking Loads
Under high traffic (e.g. hundreds of concurrent bookings per second), writing directly to MongoDB will lead to write locks and database connection pool exhaustion. To solve this, we would implement the following architecture:
1.  **Fast Availability Check using Redis**: Shift booking slots availability verification to a Redis Cluster using bitmap indices or sets. Checking if a slot is booked would complete in sub-millisecond time.
2.  **BullMQ Async Job Queue**: Instead of updating the DB synchronously inside HTTP requests, incoming bookings will be pushed to a Redis-backed **BullMQ** background job queue. 
3.  **Serialized Writes**: Background workers will consume booking jobs sequentially, guaranteeing orderly execution, preventing race conditions, and keeping database write operations stable.
