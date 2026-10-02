import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { FacilityDiscoveryPage } from './pages/FacilityDiscoveryPage';
import { FacilityDetailsPage } from './pages/FacilityDetailsPage';
import { FacilityCalendarPage } from './pages/FacilityCalendarPage';
import { BookFacilityPage } from './pages/BookFacilityPage';
import { SmartRecommendationPage } from './pages/SmartRecommendationPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { BookingDetailsPage } from './pages/BookingDetailsPage';
import { ApprovalWorkflowPage } from './pages/ApprovalWorkflowPage';
import { ResourceManagementPage } from './pages/ResourceManagementPage';
import { MaintenanceManagementPage } from './pages/MaintenanceManagementPage';
import { QRVerificationPage } from './pages/QRVerificationPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DepartmentManagementPage } from './pages/DepartmentManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { CampusMapPage } from './pages/CampusMapPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpSupportPage } from './pages/HelpSupportPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              {/* Application Portal inside AppLayout */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/facilities" element={<FacilityDiscoveryPage />} />
                <Route path="/facilities/:id" element={<FacilityDetailsPage />} />
                <Route path="/calendar" element={<FacilityCalendarPage />} />
                <Route path="/book" element={<BookFacilityPage />} />
                <Route path="/recommendations" element={<SmartRecommendationPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/bookings/:id" element={<BookingDetailsPage />} />
                <Route path="/approvals" element={<ApprovalWorkflowPage />} />
                <Route path="/resources" element={<ResourceManagementPage />} />
                <Route path="/maintenance" element={<MaintenanceManagementPage />} />
                <Route path="/qr-verification" element={<QRVerificationPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/departments" element={<DepartmentManagementPage />} />
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/campus-map" element={<CampusMapPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpSupportPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
