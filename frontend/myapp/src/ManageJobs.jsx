
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

function ManageJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const handleAuthError = (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      navigate("/login");
      return true;
    }

    return false;
  };

  // FETCH COMPANY JOBS
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_BASE}/job/my-jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(response.data.jobs || []);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err.response?.data?.message || "Failed to load jobs");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // DELETE JOB
  const deleteJob = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.delete(
        `${API_BASE}/job/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs((prevJobs) =>
        prevJobs.filter((job) => job._id !== id)
      );

      alert(response.data.message || "Job deleted successfully");
    } catch (err) {
      if (!handleAuthError(err)) {
        alert(err.response?.data?.message || "Failed to delete job");
      }
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-gray-800 transition-colors duration-300 dark:bg-[#100D1D] dark:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-violet-100 bg-white/85 backdrop-blur-xl dark:border-violet-900/40 dark:bg-[#171327]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              JobNest<span className="text-fuchsia-500">.</span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Company Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => navigate("/company/dashboard")}
              className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
              ← Dashboard
            </button>

            <button
              onClick={() => navigate("/company/manage-applicants")}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Manage Applicants →
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">

        {/* PAGE HEADING */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-600 p-6 text-white shadow-xl shadow-violet-200/50 dark:shadow-none sm:p-9">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                Company Workspace
              </span>

              <h2 className="text-3xl font-extrabold sm:text-4xl">
                Manage Jobs
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-violet-100 sm:text-base">
                Manage all your published job vacancies and keep your hiring
                process organized.
              </p>
            </div>

            <button
              onClick={() => navigate("/company/create-job")}
              className="shrink-0 rounded-xl bg-white px-6 py-3 font-bold text-violet-700 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              + Post New Job
            </button>
          </div>
        </div>

        {/* STATISTICS */}
        {!loading && !error && (
          <div className="mb-7 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm dark:border-violet-900/40 dark:bg-[#1C1830]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Posted Jobs
                  </p>

                  <h3 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                    {jobs.length}
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-2xl dark:bg-violet-500/20">
                  💼
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-fuchsia-100 bg-white p-5 shadow-sm dark:border-fuchsia-900/40 dark:bg-[#1C1830]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Active Jobs
                  </p>

                  <h3 className="mt-2 text-3xl font-extrabold text-fuchsia-600 dark:text-fuchsia-400">
                    {
                      jobs.filter(
                        (job) => job.status?.toLowerCase() === "active"
                      ).length
                    }
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-100 text-2xl dark:bg-fuchsia-500/20">
                  ✨
                </div>
              </div>
            </div>
          </div>
        )}

        {/* JOBS SECTION */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Your Published Jobs
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage your job listings.
            </p>
          </div>

          {!loading && !error && (
            <span className="rounded-full bg-violet-100 px-4 py-2 text-xs font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              {jobs.length} Jobs
            </span>
          )}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-violet-100 bg-white py-20 dark:border-violet-900/40 dark:bg-[#1C1830]">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>

            <p className="font-medium text-gray-600 dark:text-gray-300">
              Loading jobs...
            </p>
          </div>
        ) : error ? (
          /* ERROR */
          <div className="rounded-3xl border border-red-200 bg-white px-6 py-12 text-center dark:border-red-900/40 dark:bg-[#1C1830]">
            <div className="mb-3 text-4xl">⚠️</div>

            <p className="mb-4 font-semibold text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              onClick={fetchJobs}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-2.5 font-semibold text-white transition hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-3xl border border-violet-100 bg-white px-6 py-16 text-center shadow-sm dark:border-violet-900/40 dark:bg-[#1C1830]">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-4xl dark:bg-violet-500/15">
              💼
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              No Jobs Posted Yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              You haven't published any job vacancies. Create your first job
              and start finding the right candidates.
            </p>

            <button
              onClick={() => navigate("/company/create-job")}
              className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-1 hover:shadow-lg dark:shadow-none"
            >
              + Create First Job
            </button>
          </div>
        ) : (
          /* JOBS TABLE */
          <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm shadow-violet-100/50 dark:border-violet-900/40 dark:bg-[#1C1830] dark:shadow-none">
            <div className="border-b border-violet-100 p-5 dark:border-violet-900/40">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Job Listings
              </h3>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Review job details, salary and publication status.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#F8F6FF] text-xs uppercase tracking-wider text-violet-700 dark:bg-[#171327] dark:text-violet-300">
                  <tr>
                    <th className="px-6 py-5">Job Title</th>
                    <th className="px-6 py-5">Location</th>
                    <th className="px-6 py-5">Job Type</th>
                    <th className="px-6 py-5">Salary</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job._id}
                      className="border-t border-violet-50 transition hover:bg-violet-50/50 dark:border-violet-900/30 dark:hover:bg-violet-500/5"
                    >
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {job.title}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-400">
                        📍 {job.location || "Not specified"}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold capitalize text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                          {job.jobType || "Not specified"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        ₹{job.salary?.min ?? 0} - ₹{job.salary?.max ?? 0}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${job.status?.toLowerCase() === "active"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                        >
                          {job.status || "Unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/company/manage-applicants/${job._id}`)
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                          >
                            <span>View Applications</span>
                            <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[11px] font-bold">
                              {job.totalApplicants ?? 0}
                            </span>
                            <span>→</span>
                          </button>

                          <button
                            onClick={() => navigate(`/company/edit-job/${job._id}`)}
                            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteJob(job._id)}
                            disabled={deletingId === job._id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            {deletingId === job._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-10 border-t border-violet-100 py-6 text-center text-xs text-gray-500 dark:border-violet-900/40 dark:text-gray-500">
          © 2026 JobNest. Manage your hiring process with confidence.
        </footer>
      </main>
    </div>
  );
}

export default ManageJobs;
