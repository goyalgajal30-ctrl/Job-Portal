
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

const API = `${API_BASE}/job-apply`;

function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API}/my-applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch applications");
        }

        setApplications(data.applications || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN");
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "selected":
      case "shortlisted":
        return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";

      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";

      default:
        return "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-gray-800 dark:bg-[#100D1D] dark:text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-violet-100 bg-white/85 px-5 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#171327]/90 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <h1
            onClick={() => navigate("/")}
            className="cursor-pointer text-2xl font-extrabold tracking-tight"
          >
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              JobNest
            </span>
            <span className="text-fuchsia-500">.</span>
          </h1>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => navigate("/user/dashboard")}
              className="rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 dark:border-violet-400/30 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">

        {/* Heading */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-bold tracking-wider text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
            <span className="h-2 w-2 rounded-full bg-fuchsia-500"></span>
            YOUR JOB JOURNEY
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            My <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">Applications</span>
          </h2>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Track your job applications and check their latest status.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2">

          <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1830]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Applications
                </p>
                <h3 className="mt-3 text-4xl font-extrabold text-violet-700 dark:text-violet-300">
                  {applications.length}
                </h3>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl text-white shadow-lg shadow-violet-200 dark:shadow-none">
                📄
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-fuchsia-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1830]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending Applications
                </p>
                <h3 className="mt-3 text-4xl font-extrabold text-fuchsia-600 dark:text-fuchsia-300">
                  {applications.filter(
                    (app) => app.status?.toLowerCase() === "pending"
                  ).length}
                </h3>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-2xl text-white shadow-lg shadow-fuchsia-200 dark:shadow-none">
                ⏳
              </div>
            </div>
          </div>

        </div>

        {/* Applications List */}
        <div className="mb-5">
          <h3 className="text-xl font-bold">Application History</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All jobs you have applied for.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-violet-100 bg-white py-20 text-center dark:border-white/10 dark:bg-[#1C1830]">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-fuchsia-500"></div>
            <p className="mt-4 font-medium text-gray-500 dark:text-gray-400">
              Loading your applications...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300">
            <p className="font-semibold">Unable to load applications</p>
            <p className="mt-2 text-sm">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && applications.length === 0 && (
          <div className="rounded-2xl border border-violet-100 bg-white px-5 py-16 text-center shadow-sm dark:border-white/10 dark:bg-[#1C1830]">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-4xl dark:bg-violet-500/10">
              📂
            </div>

            <h3 className="text-xl font-bold">
              No Applications Yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              You haven't applied for any jobs yet. Explore available
              opportunities and take the next step in your career.
            </p>

            <button
              onClick={() => navigate("/jobs")}
              className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-violet-300 dark:shadow-none"
            >
              Explore Jobs →
            </button>
          </div>
        )}

        {/* Application Cards */}
        {!loading && !error && applications.length > 0 && (
          <div className="space-y-5">
            {applications.map((application) => {
              const job = application.jobId;

              const companyName =
                job?.company?.companyName ||
                job?.companyDetails?.companyName ||
                "N/A";

              return (
                <div
                  key={application._id}
                  className="group rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100 dark:border-white/10 dark:bg-[#1C1830] dark:hover:border-violet-400/30 dark:hover:shadow-none"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

                    {/* Job Information */}
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl text-white shadow-md">
                        💼
                      </div>

                      <div>
                        <h3 className="text-xl font-bold transition group-hover:text-violet-700 dark:group-hover:text-violet-300">
                          {job?.title || "Job not available"}
                        </h3>

                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">Company:</span>{" "}
                          {companyName}
                        </p>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Applied on: {formatDate(application.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Application Status
                      </span>

                      <span
                        className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${getStatusStyle(application.status)}`}
                      >
                        {application.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-violet-100 pt-4 dark:border-white/10">
                    <p className="text-xs text-gray-400">
                      Application ID: {application._id}
                    </p>

                    {job?._id && (
                      <button
                        onClick={() => navigate(`/job/${job._id}`)}
                        className="text-sm font-bold text-violet-600 transition hover:text-fuchsia-600 dark:text-violet-300 dark:hover:text-fuchsia-300"
                      >
                        View Job Details →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-violet-100 py-6 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
          © 2026 <span className="font-bold text-violet-600 dark:text-violet-400">JobNest</span>. All rights reserved.
        </footer>

      </main>
    </div>
  );
}

export default MyApplications;
