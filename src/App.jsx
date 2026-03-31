import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ComplaintForm from "./components/ComplaintForm";
import Dashboard from "./components/Dashboard";
import ComplaintFMS from "./components/ComplaintFMS";
import OffSiteManagement from "./components/OffSiteManagement";
import OnSiteManagement from "./components/OnSiteManagement";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoutes";
import ComplaintStatusPage from "./components/ComplaintStatusPage";
import { Toaster } from "react-hot-toast";
import ResetPassword from "./components/ResetPassword";

// ✅ NEW IMPORTS FOR ENGINEER FLOW
// import EngineerLanding from "./components/EngineerLanding";
import EngineerDashboard from "./components/EngineerDashboard";
import TrackPage from "./components/TrackPage";

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
            padding: "12px 16px",
            minWidth: "300px",
            borderRadius: "10px",
            fontWeight: "600",
          },
        }}
      />

      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Login />} />
          <Route path="/complaint-form" element={<ComplaintForm />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/track/:complaintId" element={<TrackPage />} />

          {/* --- PROTECTED ROUTES --- */}

          {/* ✅ ENGINEER SPECIFIC ROUTES */}
          {/* <Route
            path="/engineer-portal"
            element={
              <ProtectedRoute>
                <EngineerLanding />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/engineer-dashboard"
            element={
              <ProtectedRoute>
                <EngineerDashboard />
              </ProtectedRoute>
            }
          />

          {/* EXISTING DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaintFMS"
            element={
              <ProtectedRoute>
                <ComplaintFMS />
              </ProtectedRoute>
            }
          />

          {/* OFFSITE */}
          <Route
            path="/offsite-mgmt"
            element={
              <ProtectedRoute>
                <OffSiteManagement />
              </ProtectedRoute>
            }
          />

          {/* ONSITE */}
          <Route
            path="/onsite-mgmt"
            element={
              <ProtectedRoute>
                <OnSiteManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/status/:id"
            element={
              <ProtectedRoute>
                <ComplaintStatusPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
