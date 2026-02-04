import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import LoginPage from "./pages/LoginPage";
import DashboardHOD from "./pages/DashboardHOD";
import DashboardFaculty from "./pages/DashboardFaculty";
import DashboardAdmin from "./pages/DashboardAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/datepicker.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
         {/* HOD Dashboard */}
        <Route
          path="/dashboard/hod"
          element={
            <ProtectedRoute allowedRoles={["HOD"]}>
              <DashboardHOD />
            </ProtectedRoute>
          }
        />

        {/* Faculty Dashboard */}
        <Route
          path="/dashboard/faculty"
          element={
            <ProtectedRoute allowedRoles={["Faculty"]}>
              <DashboardFaculty />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard/hod" element={<DashboardHOD />} />


        {/* Admin Dashboard */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
