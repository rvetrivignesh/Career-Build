import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageLoader } from "@components/Loader";
import RootLayout from "@layouts/RootLayout";
import DashboardLayout from "@layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// Lazy Load Pages
const LandingPage = lazy(() => import("../pages/LandingPage/LandingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage/RegisterPage"));
const ProfileSetupPage = lazy(() => import("../pages/ProfileSetupPage/ProfileSetupPage"));
const DashboardHome = lazy(() => import("../pages/DashboardHome/DashboardHome"));
const ProfilePage = lazy(() => import("../pages/ProfilePage/ProfilePage"));
const ResumeBuilderPage = lazy(() => import("../features/resume-builder/pages/ResumeBuilderPage/ResumeBuilderPage"));
const ResumeAnalyzerPage = lazy(() => import("../features/resume-analyzer/pages/ResumeAnalyzerPage/ResumeAnalyzerPage"));
const CareerRoadmapsPage = lazy(() => import("../features/career-roadmaps/pages/CareerRoadmapsPage/CareerRoadmapsPage"));
const AICoachPage = lazy(() => import("../features/ai-coach/pages/AICoachPage/AICoachPage"));
const PlaceholderPage = lazy(() => import("../pages/PlaceholderPage"));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader text="Loading page..." />}>
      <Routes>
        {/* Public Pages inside RootLayout */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Redirect legacy /profile to /dashboard/profile */}
        <Route
          path="/profile"
          element={<Navigate to="/dashboard/profile" replace />}
        />

        {/* Onboarding Wizard - Protected (Requires Auth but checks for incomplete profile) */}
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute requiresProfileSetup={false}>
              <ProfileSetupPage />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Pages - Protected (Requires Auth & Complete Profile) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiresProfileSetup={true}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route
            path="profile"
            element={<ProfilePage />}
          />
          <Route
            path="resume-builder"
            element={<ResumeBuilderPage />}
          />
          <Route
            path="resume-analyzer"
            element={<ResumeAnalyzerPage />}
          />
          <Route
            path="career-roadmaps"
            element={<CareerRoadmapsPage />}
          />
          <Route
            path="ai-coach"
            element={<AICoachPage />}
          />
          <Route
            path="settings"
            element={<PlaceholderPage title="Settings" />}
          />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
