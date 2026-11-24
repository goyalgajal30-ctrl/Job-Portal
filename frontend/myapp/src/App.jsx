import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Home from "./Home";
import UserSignup from "./UserSignup";
import Login from "./Login";
import CompanySignup from "./CompanySignup";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import CompanyDashboard from "./CompanyDashboard";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import CreateJob from "./CreateJob";
import EditJob from "./EditJob";
import ManageJobs from "./ManageJobs";
import AllJobs from "./AllJobs";
import JobDetails from "./JobDetails";
import ApplyJob from "./ApplyJob";
import ManageApplicants from "./ManageApplicants";
import ScheduleInterview from "./ScheduleInterview";
import ManageInterviews from "./ManageInterviews";
import MyInterviews from "./MyInterviews";
import ManageUsers from "./ManageUsers";
import MyApplications from "./MyApplications";
import ChangePassword from "./ChangePassword";
import UserProfile from "./UserProfile";
import ProtectedRoute from "./ProtectRoute";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/user-signup" element={<UserSignup />} />
          <Route path="/signup" element={<Navigate to="/user-signup" replace />} />
          <Route path="/company-signup" element={<CompanySignup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/jobs" element={<AllJobs />} />
          <Route path="/job/:id" element={<JobDetails />} />

          {/* User Protected Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job/:id/apply"
            element={
              <ProtectedRoute role="user">
                <ApplyJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/my-applications"
            element={
              <ProtectedRoute role="user">
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/my-interviews"
            element={
              <ProtectedRoute role="user">
                <MyInterviews />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/change-password"
            element={
              <ProtectedRoute role="user">
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/profile"
            element={
              <ProtectedRoute role="user">
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Company Protected Routes */}
          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute role="company">
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/manage-jobs"
            element={
              <ProtectedRoute role="company">
                <ManageJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/create-job"
            element={
              <ProtectedRoute role="company">
                <CreateJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/edit-job/:id"
            element={
              <ProtectedRoute role="company">
                <EditJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/manage-applicants"
            element={
              <ProtectedRoute role="company">
                <ManageApplicants />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/schedule-interview"
            element={
              <ProtectedRoute role="company">
                <ScheduleInterview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/manage-interviews"
            element={
              <ProtectedRoute role="company">
                <ManageInterviews />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
