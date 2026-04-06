⚡ JBVNL Smart Portal
🚀 Multi-Role Electricity Utility Management System

A full-stack, production-ready web application built for
Jharkhand Bijli Vitran Nigam Limited (JBVNL) to transform a legacy system into a modern, user-centric digital platform.

💡 Designed to simplify billing, complaint tracking, and administrative workflows through a role-based dashboard system.

🔥 Live Demo

👉 [Add your deployed link here]

🎯 Problem Statement

The existing system faced major issues:

❌ Complex navigation & cluttered UI
❌ Poor mobile responsiveness
❌ Difficult complaint tracking
❌ Multiple disconnected portals
❌ Low transparency in service requests
💡 Solution

JBVNL Smart Portal solves these problems by:

✅ Providing a task-oriented, clean UI/UX
✅ Introducing a centralized dashboard system
✅ Enabling real-time complaint tracking
✅ Making the platform mobile-friendly & responsive
✅ Automating workflows to reduce manual effort
✨ Key Features
👤 Consumer Portal
💳 Pay electricity bills online
📊 View consumption trends (6-month analytics)
📝 Register & track complaints (real-time status)
🔌 Apply for new connections / manage services
👤 Update profile & account settings
🛠 Admin Dashboard
✅ Approve/reject user registrations
📌 Manage complaints & service requests
📊 Monitor revenue with analytics dashboards
⚙️ System configuration & monitoring
🧠 Manager Dashboard
📈 Organization-wide analytics & reports
👥 Admin management & role control
🔐 Security settings & system parameters
🌐 Platform Highlights
🔐 Multi-role Authentication (Consumer, Admin, Manager)
🛡️ Role-Based Access Control (RBAC)
📊 Interactive Data Visualization (Bar, Pie, Area Charts)
🌙 Dark Mode Support
📱 Fully Responsive Design
⚡ Optimized Performance & Scalable Architecture



🛠 Tech Stack
Category	Technology
Frontend	React 18, TypeScript
Build Tool	Vite
Styling	TailwindCSS, shadcn/ui
Routing	React Router v6
State Mgmt	TanStack Query v5
Charts	Recharts
Theme	next-themes
Forms	React Hook Form + Zod
🚀 Getting Started


# Clone the repository
git clone <your-git-url>
cd jbvnl-smart-portal

# Install dependencies
npm install

# Start development server
npm run dev

👉 App runs on: http://localhost:8080

🔑 Demo Credentials
Role	Username	Password
Manager	manager@123	mgr123
Admin	Register → OTP: 000000 → Await approval	
Consumer	Register → OTP: 000000 → Await approval	
📦 Build for Production
npm run build



📁 Project Structure
src/
├── components/
│   ├── auth/         # Authentication (Login, Register, OTP, ProtectedRoute)
│   ├── dashboard/    # Consumer, Admin, Manager dashboards
│   ├── home/         # Landing page components
│   └── ui/           # Reusable UI components (shadcn)
├── contexts/
│   └── AuthContext.tsx   # Authentication & user state management
├── pages/
│   ├── consumer/     # Billing, complaints, forms
│   ├── admin/        # Approvals, complaint management
│   └── manager/      # Analytics, security, system settings
└── types/            # TypeScript interfaces


📊 Impact
⚡ Reduced complaint resolution complexity
📉 Improved user experience & accessibility
📱 Enabled mobile-first interaction
🔍 Increased transparency in complaint tracking
🏢 Digitized legacy government workflow
🚧 Future Improvements
🔗 Payment gateway integration
📡 Real-time notifications (WebSockets)
🤖 AI-powered chatbot support
📊 Advanced analytics dashboard
☁️ Cloud deployment with CI/CD
🤝 Contributing

Contributions are welcome! Feel free to fork, improve, and submit a PR.

📬 Contact
👨‍💻 Praveen Kumar
LinkedIn: https://www.linkedin.com/in/praveen-kumar-cse/
