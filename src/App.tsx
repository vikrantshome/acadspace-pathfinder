import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/AdminLayout";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import NLP from "./pages/NLP";
import Onboarding from "./pages/Onboarding";
import TestPage from "./pages/TestPage";
import Results from "./pages/Results";
import ReportViewer from "./pages/ReportViewer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ExportQuestions from "./pages/ExportQuestions";
import NcciAllenPage from "@/pages/NcciAllen/pages/Index";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCareers from "./pages/admin/AdminCareers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAudit from "./pages/admin/AdminAudit";

const queryClient = new QueryClient();

const App = () => {
  console.log("Current path:", window.location.pathname);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* <Route path="/auth" element={<Auth />} /> */}
              <Route path="/register" element={<SignUp />} />
              <Route path="/auth" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/nlp" element={<NLP />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/test/:testType" element={<TestPage />} />
              <Route path="/results" element={<Results />} />
              <Route path="/report/:reportId" element={<ReportViewer />} />
              <Route path="/report" element={<ReportViewer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/export-questions" element={<ExportQuestions />} />
              <Route path="/allen-career-compass" element={<NcciAllenPage />} />
              
              {/* Public Admin Route */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="careers" element={<AdminCareers />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="audit" element={<AdminAudit />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
