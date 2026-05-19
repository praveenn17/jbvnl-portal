# Seed Admin Script Documentation

## Overview
`seedAdmin.js` is a one‑time utility for the JBVNL portal backend. It creates a default **admin user** in the MongoDB database used by the application. The script is intended to be run **once** during initial setup or when the admin credentials need to be reset.

---

## Prerequisites

- **Node.js** (>= 14) installed on the host machine.
- The **backend** dependencies installed (`npm install`).
- Access to a running MongoDB instance. By default it connects to `mongodb://localhost:27017/jbvnl_portal` if `process.env.MONGO_URI` is not set.
- An optional **`.env`** file at the project root containing:
  ```
  MONGO_URI=mongodb://username:password@host:port/dbname
  VERCEL=1   # (optional) disables DNS fallback for Vercel deployments
  ```

---

## How It Works
2. **Database Connection** – Connects to MongoDB using `mongoose`.
3. **Admin Existence Check** – Looks for a user document with the email `admin@jbvnl.in`. If found, the script prints a message and exits without changes.
4. **Admin Creation** – If no admin exists, it creates a new `User` document with:
   - **Name:** `JBVNL Admin`
   - **Email:** `admin@jbvnl.in`
   - **Password:** `Admin@1234` (the `User` model hashes the password automatically via a pre‑save hook)
   - **Role:** `admin`
   - **Status:** `approved`
5. **Success Banner** – Prints a stylised console banner that displays the newly‑seeded credentials and reminds the operator to change the password after the first login.
6. **Exit** – Terminates the process with `process.exit(0)` on success or `process.exit(1)` on error.

---

## Usage
Run the script from the `backend` directory:
```bash
node seedAdmin.js
```
The script will output one of the following:
- **Admin already exists** – prints the existing user’s role and status and exits.
- **Admin seeded successfully** – prints a banner with the credentials.

> **Important:** After the first successful seed, immediately change the admin password through the application’s UI or by updating the user record.

---

## Constants (Hard‑coded)
| Constant | Value | Description |
|----------|-------|-------------|
| `ADMIN_EMAIL` | `admin@jbvnl.in` | Email address for the admin user. |
| `ADMIN_PASSWORD` | `Admin@1234` | Default password (must be changed after first login). |
| `ADMIN_NAME` | `JBVNL Admin` | Display name for the admin account. |

---

## Error Handling
Any uncaught error during the connection or creation phase is logged to the console with the prefix `[SEED ERROR]` and the script exits with status code **1**.

---

## Security Note
The default password is intentionally simple for initial setup only. **Do not** commit the script (or any `.env` files containing secrets) to a public repository. After seeding, use the application’s password‑change flow to set a strong, unique password.

---

## Extending the Script
If you need to seed additional default users or roles, replicate the pattern used for the admin user:
```javascript
await User.create({
  name: 'Some Name',
  email: 'user@example.com',
  password: 'StrongPass!23',
  role: 'editor',
  status: 'approved',
});
```
Ensure the password meets the application’s validation rules.

---

## License
This utility is part of the JBVNL portal source code and follows the same licensing terms as the rest of the project.
