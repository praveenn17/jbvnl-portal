# JBVNL Smart Portal - Service Status Report

This document outlines all the core data and API services currently implemented in the frontend application. 

**Summary:** At present, **all services are completely hardcoded and simulated**. There are zero real API calls (like `fetch` or `axios`) being made to a real backend. The application relies heavily on `setTimeout` to simulate network delays and uses browser `localStorage` to simulate a database.

Here is the breakdown of the individual services and their locations in the codebase:

---

### 1. Authentication & User Management Service
Handles user login, registration, OTP verification, and role-based access.

*   **File Location:** `frontend/src/contexts/AuthContext.tsx`
*   **Status:** 🔴 **HARDCODED**
    *   No real database verification.
    *   Manager login is rigidly checked against the string `'manager@123'` & `'mgr123'`.
    *   OTP verification always expects the exact string `"000000"`.
    *   Consumer/Admin registrations are stored as JSON in the browser's `localStorage` (`jbvnl_pending_users`, `jbvnl_registered_users`).

### 2. Billing & Payment Service
Responsible for fetching a consumer's electricity bills, reviewing specific bills, and marking bills as "paid".

*   **File Location:** `frontend/src/lib/mockApi.ts`
*   **Status:** 🔴 **HARDCODED**
    *   Uses a mocked API class (`MockApi`).
    *   Initial bills are loaded from hardcoded data in `frontend/src/lib/mockData.ts` (`INITIAL_BILLS`).
    *   When a bill is paid, it merely updates a record saved under the `jbvnl_bills` key in `localStorage`. 

### 3. Complaint Management Service
Handles fetching past complaints, filing new complaints, and allowing administrators/managers to update complaint statuses.

*   **File Location:** `frontend/src/lib/mockApi.ts`
*   **Status:** 🔴 **HARDCODED**
    *   Initial complaints are populated from `frontend/src/lib/mockData.ts` (`INITIAL_COMPLAINTS`).
    *   New complaints are appended to the `localStorage` key `jbvnl_complaints`.

### 4. Manager Dashboard & Analytics Service
Calculates total revenue, counts total registered consumers, and counts pending complaints to display on the Manager Dashboard.

*   **File Location:** `frontend/src/lib/mockApi.ts` (specifically `getManagerStats()`)
*   **Status:** 🔴 **HARDCODED**
    *   Calculates these metrics by artificially querying the mock `localStorage` tables for bills, users, and complaints.

---

### Next Steps Recommendation
To make this project a fully functional full-stack application, the `MockApi` class in `mockApi.ts` and the `AuthContext.tsx` file need to be completely rewritten to make real HTTP requests (e.g., `fetch('/api/auth/login')`) to the Node Express server we created earlier.
