# JBVNL Smart Portal

A **multi-role electricity utility portal** for Jharkhand Bijli Vitran Nigam Limited (JBVNL), built as a full-featured web application with Consumer, Admin, and Manager dashboards.

## 🔥 Live Demo
> Deploy to Vercel: `npm run build` → connect to [vercel.com](https://vercel.com)

## ✨ Features

### Consumer Portal
- View and pay electricity bills online
- Track consumption trends with interactive charts (6-month history)
- Register and track complaints with real-time status
- Apply for new connections, disable connections, edit details via forms
- Update profile and manage account settings

### Admin Dashboard
- Approve / reject new user registrations with role-based access
- Manage and update consumer complaints
- View revenue analytics with monthly Bar/Pie charts
- System health monitoring and configuration

### Manager Dashboard
- Organization-wide reports and analytics
- Admin account management and access control
- Security settings and system parameters

### Platform Features
- 🔐 **Multi-role auth** — Consumer, Admin, Manager with OTP registration & approval workflow
- 🛡️ **Route protection** — Role-based access control on all private routes
- 📊 **Interactive charts** — Recharts (Bar, Area, Pie) across all dashboards
- 🌙 **Dark mode** — System-aware theme toggle on every page
- 📱 **Responsive** — Works on mobile and desktop

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Frontend | React 18, TypeScript |
| Build tool | Vite |
| Styling | TailwindCSS 3, shadcn/ui |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| Charts | Recharts |
| Theme | next-themes |
| Form handling | React Hook Form + Zod |

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone <your-git-url>
cd jbvnl-smart-portal

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

App will be available at `http://localhost:8080`

## 🔑 Demo Credentials

| Role | Username | Password |
|---|---|---|
| Manager | `manager@123` | `mgr123` |
| Admin | Register → OTP: `000000` → await manager approval |
| Consumer | Register → OTP: `000000` → await admin approval |

## 📦 Build for Production

```bash
npm run build
```

## 🌐 Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Vite — click **Deploy**

Your portal will be live at `https://jbvnl-smart-portal.vercel.app`

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/         # LoginPage, RegisterTab, OTP, ProtectedRoute
│   ├── dashboard/    # ConsumerDashboard, AdminDashboard, ManagerDashboard
│   ├── home/         # HomePage, HeroSection, FeaturesGrid
│   └── ui/           # shadcn/ui component library
├── contexts/
│   └── AuthContext.tsx   # Auth state, login, register, OTP, user approval
├── pages/
│   ├── consumer/     # BillDetails, PaymentPage, FormPages, ComplaintTracking
│   ├── admin/        # PendingApprovals, ActiveComplaints
│   └── manager/      # ReportsAnalytics, SecuritySettings, SystemParameters
└── types/            # TypeScript interfaces (User, Bill, Complaint)
```
