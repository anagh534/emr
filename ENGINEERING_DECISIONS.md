# EMR Engineering Decisions & Architecture

This document explains the technical reasoning, database design, security measures, performance optimizations, and scaling strategies implemented in this Electronic Medical Records (EMR) system.

---

## 1. Project Architecture
The application is built using a decoupled **Client-Server Architecture**:
*   **Backend (Express / Node.js)**: Follows a modular controller-route MVC pattern. Concerns are decoupled into `models` (schemas), `controllers` (business logic), `middleware` (auth and RBAC checks), and `routes` (end-point maps).
*   **Frontend (Vite / React)**: Utilizes a **Feature-Driven Structure** (`features/users`, `features/patients`, `features/appointments`, `features/audit`). This isolates hooks, services, and components into domain scopes, simplifying code sharing and maintenance.
*   **State Management (TanStack React Query)**: Chosen over Redux to manage server-state synchronization. It implements automatic query caching, background refetching, and cache invalidation, which aligns perfectly with real-time WebSocket notifications.

---

## 2. MongoDB Schema Design
The schema consists of four core collections:
*   **User (`User`)**: Holds administrative, receptionist, and clinical doctor profiles. Doctors have an embedded `schedule` subdocument containing their working days, slot durations, sessions, and break timings. Embedding this configuration ensures single-document reads when compiling doctor calendars.
*   **Patient (`Patient`)**: Represents patient registrations. Includes unique constraints on `patientId` and `mobileNumber` to prevent duplicate files.
*   **Appointment (`Appointment`)**: Maps clinical transactions. Stores references (`ObjectId`) to `patient` and `doctor`, along with the `date`, `timeSlot`, and `status`. It also contains an `isCancelled` boolean to support index-level re-booking.
*   **AuditLog (`AuditLog`)**: Flat document structure containing user credentials, timestamp, action type, and entity targets.

---

## 3. Prevention of Double Booking (Concurrency)
To prevent simultaneous double-booking of identical slots, we enforced a **Partial Unique Compound Index** on the `Appointment` collection:
```javascript
appointmentSchema.index(
    { doctor: 1, date: 1, timeSlot: 1 }, 
    { 
        unique: true,
        partialFilterExpression: { isCancelled: false }
    }
);
```
*   **Atomic Exclusivity**: By enforcing a compound unique constraint at the database level on `{ doctor, date, timeSlot }`, MongoDB guarantees that only one write operation will succeed if two users book the same slot at the exact same millisecond.
*   **Re-booking Support**: The filter `isCancelled: false` ensures that if a patient cancels their appointment, the document's `isCancelled` flag is flipped to `true`. This instantly removes it from the unique index scope, allowing the slot to be booked again by a different patient.
*   **Graceful Recovery**: The backend controller wraps the Mongoose `.save()` call and explicitly catches MongoDB error code `11000` (duplicate key write error), returning a friendly `400 Bad Request` informing the user the slot has just been taken.

---

## 4. Database Indexes
We configured the following indexes to maintain high performance under heavy read/write loads:
*   **`User`**:
    *   `{ role: 1, isActive: 1 }`: Optimizes active staff registries and role-based listings (such as fetching active clinical doctors for dropdowns).
    *   `{ name: 1 }`: Speeds up doctor queue searches.
*   **`Patient`**:
    *   `{ name: 1 }`: Speeds up case-insensitive patient lookup queries and autocompletion fields.
    *   `{ mobileNumber: 1 }` & `{ patientId: 1 }` (unique): Enforces quick user lookups during receptionist queries.
*   **`Appointment`**:
    *   `{ doctor: 1, date: 1, timeSlot: 1 }` (partial unique): Enforces slot locking for active appointments.
*   **`AuditLog`**:
    *   `{ timestamp: -1 }`: Speeds up reverse-chronological paging of system audit logs.

*All indexes are verified and programmatically updated on database connection using Mongoose `syncIndexes()` during server startup.*

---

## 5. Security Measures
*   **HTTP Header Security (Helmet)**: Integrates standard Helmet middleware setting secure headers (like CSP, HSTS, and Frameguard) to defend against cross-site scripting (XSS) and clickjacking.
*   **Environment-restricted CORS**: Loads allowed origins directly from the `CORS_ORIGIN` environment variable, restricting access to authorized domain zones while allowing session cookies/tokens with `credentials: true`.
*   **Password Hashing**: Implemented cryptographic salting and hashing using `bcrypt` (10 rounds) in pre-save hooks, ensuring passwords are never stored in plain text.
*   **Token-Based Authentication**: Implemented stateless JWT authorization. Short-lived Access tokens (expiring in minutes) are paired with secure, database-persisted Refresh tokens to enable rotation.
*   **Role-Based Access Control (RBAC)**: Configured express route guards matching clearance scopes:
    *   *Super Admin*: Full read/write clearance across staff and logs.
    *   *Receptionist*: Restricted to patient directories, booking, and check-in updates.
    *   *Doctor*: Restricted to viewing their queue, writing notes, and marking completion.
*   **HIPAA Audit Trails**: Configured a write-only audit logger capturing logins, creations, updates, and cancellations. These logs include user identities, roles, actions, and timestamps.

---

## 6. Performance Optimizations
*   **Payload Compression**: Express gzip compression middleware (`compression`) shrinks responses before network transmission, accelerating client-side render cycles.
*   **Server-Side Pagination**: Implemented `skip` and `limit` paging across all directories (Staff, Patients, and Appointments) to limit database cursor scopes and payload sizes.
*   **Caching stale data**: Configured React Query cache stale-times to prevent redundant HTTP requests during UI tab switches.
*   **Automatic Status Completion**: Modified the backend notes-save endpoint to automatically transition appointment states to `Completed` on note submissions, reducing API roundtrips.
*   **WebSocket Invalidation**: Integrated Socket.IO events (`appointment:created`, `appointment:updated`, `appointment:cancelled`). When an update occurs, all connected clients' React Query caches are invalidated in the background, updating active views without full page reloads.

---

## 7. Scaling to Millions of Appointments
If this application needed to scale to support millions of appointments, the following architectural changes would be introduced:
1.  **Database Sharding**: MongoDB would be configured with a sharded cluster. The shard key for the `appointments` collection would be a hashed combination of `{ doctorId, date }`. This distributes write transactions and reads evenly across shards.
2.  **Redis Cache Layer**: Set up a Redis cluster storing a pre-computed grid of booked slot timings for active dates. Frontends would query Redis to display slots, moving the load away from MongoDB.
3.  **Message Broker Queue (RabbitMQ / Kafka)**: Instead of writing directly to MongoDB on booking, requests would be pushed to a queue. Worker nodes would consume tasks, serializing writes to avoid write locks and handle spikes in concurrent traffic.
4.  **Data Tiering / Archiving**: Move completed/cancelled appointments older than 1 year to a cold storage document store (such as Amazon S3 / MongoDB Atlas Online Archive) to keep active working tables compact and indexed in memory.
