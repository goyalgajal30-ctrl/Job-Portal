import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "./apiConfig";

function ProtectedRoute({ children, role }) {
  const [status, setStatus] = useState("loading");

  const verifyUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("unauthorized");
      return;
    }

    try {
      setStatus("loading");

      const res = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const actualUser = res.data.user;

      if (!actualUser) {
        setStatus("unauthorized");
        return;
      }

      localStorage.setItem("user", JSON.stringify(actualUser));
      localStorage.setItem("role", actualUser.role);

      if (role && actualUser.role !== role) {
        setStatus("forbidden");
        return;
      }

      setStatus("authorized");

    } catch (error) {
      console.log(
        "Protected Route Error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        setStatus("unauthorized");
      } else if (error.response?.status === 403) {
        setStatus("forbidden");
      } else {
        setStatus("error");
      }
    }
  };

  useEffect(() => {
    verifyUser();
  }, [role]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Verifying account...
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  if (status === "forbidden") {
    const userRole = localStorage.getItem("role");

    if (userRole === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    if (userRole === "company") {
      return <Navigate to="/company/dashboard" replace />;
    }

    if (userRole === "user") {
      return <Navigate to="/user/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-3 text-xl font-semibold">
            Unable to verify account
          </h2>

          <p className="mb-4 text-gray-500">
            Backend server is not responding. Please try again.
          </p>

          <button
            onClick={verifyUser}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
