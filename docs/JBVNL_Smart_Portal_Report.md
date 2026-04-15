# JBVNL Smart Portal - Technical Report

This document serves as a comprehensive overview of the **JBVNL Smart Portal**, detailing its technology stack, architecture, authentication workflows, and deployment setup. 

---

## 1. Technology Stack

The project is structured as a modern **MERN stack** (MongoDB, Express, React, Node.js) split into distinct frontend and backend directories.

### Frontend
- **Framework:** React.js (v18) built with Vite for extremely fast hot module replacement (HMR) and optimized builds.
- **Language:** TypeScript for strong type-checking and developer experience.
- **Styling:** Tailwind CSS combined with `tailwindcss-animate` for utility-first styling and micro-animations. Note that the portal uses a modern, glassmorphic dark theme.
- **UI Components:** **shadcn/ui** (built on top of Radix UI primitives) is used extensively to provide accessible, unstyled, and highly customizable components like Cards, Inputs, Selects, Dialogs, and Toasts.
- **Routing:** React Router v6 (`react-router-dom`) for client-side navigation.
- **Icons:** `lucide-react` for crisp, consistent scalable vector icons.
- **State Management:** React Context API (specifically `AuthContext.tsx`) handles global state such as the logged-in user, OTP session data, and pending management approvals.

### Backend
- **Runtime:** Node.js.
- **Framework:** Express.js (v5.x router handling and request middleware).
- **Database:** MongoDB, abstracted via **Mongoose** for schema enforcement and data validation.
- **Authentication:** `jsonwebtoken` (JWT) for secure, stateless session management, and `bcryptjs` for cryptographic password hashing.
- **Environment:** `dotenv` for parsing environment variables and configuring the port, MongoDB URI, and JWT Secrets.

---

## 2. Architecture & How it Works

### 2.1 The Application Structure
The application operates in a decoupled client-server architecture:
- **Client (Frontend):** Runs on port `8080` in local development and handles all the UI, client-side validation, and routing. When a user interacts with the app, it triggers API calls via standard `fetch()` mechanisms to the backend.
- **Server (Backend):** Runs on port `5000` in local development and serves as a strict JSON REST API. It handles route logic via `controllers` (such as `authController.js`), enforces roles, negotiates database fetches, and maintains the in-memory OTP queue.

### 2.2 Role-Based Access Control (RBAC)
The overarching system is heavily dependent on hierarchical roles:
1. **Consumer:** Standard users who can access their dashboards directly after OTP registration.
2. **Manager:** Admin-tier users whose responsibilities include system management. Crucially, a manager **cannot** login immediately upon registration. They are assigned a `status: 'pending'` and can only access the platform once an Admin formally approves their account.
3. **Admin:** The highest privilege. Admins receive auto-approval on registration and have access to the Admin Dashboard, which queries `/api/auth/users/pending` to actively approve or reject Manager applications.

---

## 3. The Authentication & OTP Workflow

Because JBVNL handles sensitive infrastructure data, the authentication system is robust and requires a verified email constraint step before committing a database entry.

### 3.1 Registration Sequence
1. The user fills out the registration form indicating their role, email, and password.
2. Instead of directly saving the user, the frontend calls the `/api/auth/send-otp` backend API.
3. The backend checks if the email already exists in the database. If it's new, the server generates a 6-digit OTP, stores it in an in-memory Map (`otpStore`) with a 5-minute expiry, and returns a success response.
4. The user completes the OTP input. The frontend pushes this code alongside the email to `/api/auth/verify-otp`.
5. If the OTP matches, the backend flags the email in a `verifiedEmails` queue for 10 minutes.
6. The frontend then automatically fires the final `/api/auth/register` API. The backend consumes the verified token flag, hashes the password, creates the `User` object in MongoDB, and issues a JWT session token.

### 3.2 Developer Mode & Bypass (Full-Stack Mode)
To accelerate development and prevent the need for an active SMTP email server, two developer experience features are hardcoded:
- **On-Screen OTP:** When running in development/production mode, the backend sends the generated OTP in the API JSON response payload. The frontend context captures this and renders it in a **Green Auto-fill Banner** natively on the verification screen.
- **Universal Bypass Check:** A hardcoded bypass OTP — `111000` — is accepted by the server. Supplying `111000` safely forces the backend to bypass the pending validations. Additionally, if the `111000` code is used to register a **Manager** account, the system ignores the default `pending` status constraint and automatically grants `status: 'approved'`, allowing immediate login.

---

## 4. Deployment Pipeline (Vercel)

The system is optimized for **Vercel** serverless environments.
- **Backend Configuration:** To prevent Vercel from crashing while attempting to permanently listen to a network port (via `app.listen()`), the backend conditionally boots. In standard local development, it starts the `app.listen(5000)`. In Vercel, it strictly exports the `app` instance without binding the port. It relies on standard `module.exports = app` for the Vercel architecture to automatically infer serverless function execution.
- **CI/CD Integration:** Because the GitHub repository is directly bridged to Vercel, any code committed and pushed to the `main` branch immediately triggers a new synchronized build and deployment on the cloud. The platform parses the `vercel.json` to bridge routing, ensuring no `404` or `405 Method Not Allowed` errors occur between the React client routing and Express API endpoints.

---

*Report Generated on April 15, 2026. This document comprehensively reflects the state of the JBVNL Smart Portal project as presently scaled and engineered.*
