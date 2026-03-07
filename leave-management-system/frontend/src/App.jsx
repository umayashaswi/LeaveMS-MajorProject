import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

// Pages
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import HODNotices from "./pages/HODNotices";
import LoginPage from "./pages/LoginPage";
import DashboardHOD from "./pages/DashboardHOD";
import DashboardFaculty from "./pages/DashboardFaculty";
import DashboardAdmin from "./pages/DashboardAdmin";
import AdminMessages from "./pages/AdminMessages";
import FacultyProfile from "./pages/ProfileFaculty";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Styles
import "./styles/datepicker.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />

        {/* HOD ROUTES */}
        <Route
          path="/dashboard/hod"
          element={
            <ProtectedRoute allowedRoles={["HOD"]}>
              <DashboardHOD />
            </ProtectedRoute>
          }
        />

        {/* FACULTY ROUTES */}
        <Route
          path="/dashboard/faculty"
          element={
            <ProtectedRoute allowedRoles={["Faculty"]}>
              <DashboardFaculty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["Faculty"]}>
              <FacultyProfile />
            </ProtectedRoute>
          }
        />

          <Route
  path="/dashboard/hod/notices"
  element={
    <ProtectedRoute allowedRoles={["HOD"]}>
      <HODNotices />
    </ProtectedRoute>
  }
/>

        {/* ADMIN ROUTES */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminMessages />
            </ProtectedRoute>
          }
        />

        {/* CATCH-ALL (Optional: Redirect to login or 404) */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
      
      <Toaster />
    </BrowserRouter>
  );
}

export default App;