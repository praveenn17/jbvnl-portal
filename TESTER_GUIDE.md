# JBVNL Smart Portal: QA & Testing Guide

This document provides a comprehensive plan to verify all full-stack services in the JBVNL Smart Portal. Use this guide to ensure the backend and frontend are communicating correctly and data is persisting in MongoDB.

---

## 🛠️ Platform Services Overview

1.  **Identity Service (Auth)**: Handles user registration, secure password hashing, JWT generation, and role assignment.
2.  **Billing Service**: Manages electricity bills, payment processing, and consumption history.
3.  **Complaints Service**: A ticketing system for users to report issues and for admins to resolve them.
4.  **Analytics Service**: Server-side data aggregation for revenue tracking, user growth, and ticket metrics.
5.  **Administrative Service**: Role-based oversight (approvals, status updates, and system parameters).

---

## 🧪 Phase-by-Phase Testing Plan

### Phase 1: Authentication & Security
**Goal:** Verify that users can securely join the platform and sessions are protected.

| Test Case | Steps | Expected Result |
| :--- | :--- | :--- |
| **User Registration** | Go to `/register`. Fill details for a new Consumer. | User is saved in MongoDB. Redirection to OTP/Login. |
| **Secure OTP** | Enter the OTP displayed in the terminal/UI logs. | System verifies the random server-side OTP. |
| **Login (JWT)** | Log in with the registered email and password. | Receives a JWT Token; Dashboard loads Personal info. |
| **Password Hashing** | Check the `users` collection in MongoDB. | The password field must be an encrypted hash (not plain text). |
| **Unauthenticated Access** | Try to visit `/consumer/dashboard` without logging in. | System redirects user to the `/login` page (Guard check). |

---

### Phase 2: Billing & Payments
**Goal:** Verify the financial cycle from bill generation to payment.

| Test Case | Steps | Expected Result |
| :--- | :--- | :--- |
| **Fetch Bills** | Log in as Consumer. View the "My Bills" tab. | App displays the real bills associated with that Consumer Number. |
| **Create New Bill** | Log in as Admin. Use the "Generate Bill" form. | A new record appears in the `bills` collection for that user. |
| **Payment Process** | Click "Pay Now" on a pending bill. | Request sent to `/api/bills/pay/:id`. Status changes to "Paid". |
| **Persistence** | Refresh the page after payment. | The bill status remains "Paid" (it is not a temporary UI change). |

---

### Phase 3: Complaint Management
**Goal:** Verify the communication loop between consumer issues and admin resolution.

| Test Case | Steps | Expected Result |
| :--- | :--- | :--- |
| **File Complaint** | As a Consumer, submit a new complaint via the form. | A new ticket appears in the database with "Open" status. |
| **Tracking** | Go to "Track Status" in the Consumer Dashboard. | Consumer sees their specific ticket details. |
| **Admin Resolution** | Log in as Manager. View "Consumer Complaints". | Manager sees the new ticket. Can update status to "In Progress". |
| **Closing the Loop** | Update status to "Resolved" as Manager. | Consumer dashboard immediately reflects the "Resolved" badge. |

---

### Phase 4: Manager Analytics & RBAC
**Goal:** Verify that metrics are accurate and data is strictly siloed.

| Test Case | Steps | Expected Result |
| :--- | :--- | :--- |
| **Analytics Accuracy** | Add 3 bills of ₹1000 each. Pay 2 of them. | Manager stats should show "Revenue: ₹2000". |
| **Cross-User Privacy** | Log in as Consumer A. Try to fetch bills for Consumer B. | Backend returns `403 Forbidden` or `Not Authorized`. |
| **Admin Metrics** | Check Admin Dashboard "Total Users" count. | Reflects the exact number of rows in the MongoDB `users` collection. |
| **Data Siloing** | As a Consumer, try to access `/api/stats/manager`. | Backend denies request (Role-based middleware test). |

---

## 📈 Success Definition
Testing is considered **Successful** if:
1.  **NO** data is lost after a server restart (Persistence).
2.  **NO** Consumer can see another Consumer's private bills (Security).
3.  **EVERY** Manager metric updates automatically after a bill is paid (Automation).
