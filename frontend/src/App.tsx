
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BillPayment from "./pages/BillPayment";
import NewConnection from "./pages/NewConnection";
import ComplaintStatus from "./pages/ComplaintStatus";
import TariffRates from "./pages/TariffRates";
import LearnMore from "./pages/LearnMore";
import ConsumerProfile from "./pages/consumer/ConsumerProfile";
import BillDetails from "./pages/consumer/BillDetails";
import PaymentPage from "./pages/consumer/PaymentPage";
import ConsumerSettings from "./pages/consumer/ConsumerSettings";
import FormPages from "./pages/consumer/FormPages";
import ComplaintTracking from "./pages/consumer/ComplaintTracking";
import SixMonthsDetails from "./pages/consumer/SixMonthsDetails";
import AdminManagement from "./pages/manager/AdminManagement";
import RevenueDetails from "./pages/manager/RevenueDetails";
import AdminDashboardAccess from "./pages/manager/AdminDashboardAccess";
import ReportsAnalytics from "./pages/manager/ReportsAnalytics";
import SecuritySettings from "./pages/manager/SecuritySettings";
import SystemParameters from "./pages/manager/SystemParameters";
import PendingApprovals from "./pages/admin/PendingApprovals";
import ActiveComplaints from "./pages/admin/ActiveComplaints";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/bill-payment" element={<BillPayment />} />
              <Route path="/new-connection" element={<NewConnection />} />
              <Route path="/complaint-status" element={<ComplaintStatus />} />
              <Route path="/tariff-rates" element={<TariffRates />} />
              <Route path="/learn-more" element={<LearnMore />} />

              {/* Consumer-only routes */}
              <Route path="/consumer/profile" element={<ProtectedRoute allowedRoles={['consumer']}><ConsumerProfile /></ProtectedRoute>} />
              <Route path="/consumer/bill-details/:billId" element={<ProtectedRoute allowedRoles={['consumer']}><BillDetails /></ProtectedRoute>} />
              <Route path="/consumer/payment" element={<ProtectedRoute allowedRoles={['consumer']}><PaymentPage /></ProtectedRoute>} />
              <Route path="/consumer/settings" element={<ProtectedRoute allowedRoles={['consumer']}><ConsumerSettings /></ProtectedRoute>} />
              <Route path="/consumer/form/:formType" element={<ProtectedRoute allowedRoles={['consumer']}><FormPages /></ProtectedRoute>} />
              <Route path="/consumer/complaint-tracking/:complaintId" element={<ProtectedRoute allowedRoles={['consumer']}><ComplaintTracking /></ProtectedRoute>} />
              <Route path="/consumer/six-months" element={<ProtectedRoute allowedRoles={['consumer']}><SixMonthsDetails /></ProtectedRoute>} />

              {/* Manager-only routes */}
              <Route path="/manager/admin-management" element={<ProtectedRoute allowedRoles={['manager']}><AdminManagement /></ProtectedRoute>} />
              <Route path="/manager/revenue-details" element={<ProtectedRoute allowedRoles={['manager']}><RevenueDetails /></ProtectedRoute>} />
              <Route path="/manager/admin-dashboard-access" element={<ProtectedRoute allowedRoles={['manager']}><AdminDashboardAccess /></ProtectedRoute>} />
              <Route path="/manager/reports-analytics" element={<ProtectedRoute allowedRoles={['manager']}><ReportsAnalytics /></ProtectedRoute>} />
              <Route path="/manager/security-settings" element={<ProtectedRoute allowedRoles={['manager']}><SecuritySettings /></ProtectedRoute>} />
              <Route path="/manager/system-parameters" element={<ProtectedRoute allowedRoles={['manager']}><SystemParameters /></ProtectedRoute>} />

              {/* Admin-only routes */}
              <Route path="/admin/revenue-details" element={<ProtectedRoute allowedRoles={['admin']}><RevenueDetails /></ProtectedRoute>} />
              <Route path="/admin/pending-approvals" element={<ProtectedRoute allowedRoles={['admin']}><PendingApprovals /></ProtectedRoute>} />
              <Route path="/admin/active-complaints" element={<ProtectedRoute allowedRoles={['admin']}><ActiveComplaints /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
