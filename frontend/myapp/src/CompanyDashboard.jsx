
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

function CompanyDashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [jobsRes, appsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/job/my-jobs`, config),
        axios.get(`${API_BASE}/job-apply/company-applicants`, config),
      ]);

      if (jobsRes.status === "fulfilled") {
        setJobs(jobsRes.value.data.jobs || []);
      }

      if (appsRes.status === "fulfilled") {
        setApplicants(appsRes.value.data.applicants || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to fetch company data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const activeJobs = jobs.filter(
    (job) => job.status === "Active"
  ).length;

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-[#211B35] transition-colors duration-300 dark:bg-[#100D1D] dark:text-white">

      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-violet-100 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#171327]/90">
        <div className="mx-auto flex min-h-[76px] max-w-[1500px] items-center justify-between gap-4 px-5 md:px-8">

          <div
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xl font-extrabold text-white shadow-lg shadow-violet-500/20">
              J
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight dark:text-white">
              JobNest<span className="text-fuchsia-500">.</span>
            </h1>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-gray-500 dark:text-gray-400 md:flex">
            <Link
              to="/company/dashboard"
              className="border-b-2 border-violet-600 py-7 font-bold text-violet-700 dark:text-violet-400"
            >
              Dashboard
            </Link>

            <Link
              to="/company/manage-jobs"
              className="transition hover:text-violet-600 dark:hover:text-violet-400"
            >
              My Jobs
            </Link>

            <Link
              to="/company/manage-applicants"
              className="transition hover:text-violet-600 dark:hover:text-violet-400"
            >
              Manage Applicants
            </Link>

            <Link
              to="/company/manage-interviews"
              className="transition hover:text-violet-600 dark:hover:text-violet-400"
            >
              Interviews
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 font-bold text-violet-700 dark:from-violet-900/50 dark:to-fuchsia-900/40 dark:text-violet-300">
              {(user.name || "C").charAt(0).toUpperCase()}
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold dark:text-white">
                {user.name || "Company Admin"}
              </p>

              <p className="text-xs text-gray-400 dark:text-gray-500">
                Recruiter
              </p>
            </div>

            <ThemeToggle />

            <button
              onClick={logout}
              className="rounded-lg px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8">

        {/* Welcome Section */}
        <section className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-600 p-7 text-white shadow-xl shadow-violet-500/15 md:p-10">

          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[40px] border-white/10" />
          <div className="absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">

              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold tracking-[2px] text-purple-100">
                COMPANY WORKSPACE
              </span>

              <h2 className="mt-6 text-3xl font-extrabold leading-tight md:text-4xl">
                Welcome back,
                <span className="text-fuchsia-200">
                  {" "}{user.name || "Recruiter"}.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-purple-100">
                Manage your job vacancies and find the right people to grow your organization.
              </p>

              <div className="mt-7 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/company/create-job")}
                  className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-violet-700 shadow-lg transition hover:-translate-y-1 hover:bg-purple-50"
                >
                  + Post a Vacancy
                </button>

                <button
                  onClick={() => navigate("/company/manage-applicants")}
                  className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Review Applicants ({applicants.length}) →
                </button>
              </div>
            </div>

            <div className="hidden h-52 w-64 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md lg:flex">
              <div className="text-center">
                <div className="text-6xl text-fuchsia-200">✦</div>

                <p className="mt-4 text-sm font-semibold text-white">
                  Your next great hire
                </p>

                <p className="mt-1 text-xs text-purple-200">
                  Starts with JobNest
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <div
            onClick={() => navigate("/company/manage-jobs")}
            className="group cursor-pointer rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100/70 dark:border-white/10 dark:bg-[#1C1830] dark:hover:shadow-black/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-xl text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              💼
            </div>

            <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Posted Jobs
            </p>

            <h3 className="mt-1 text-3xl font-extrabold dark:text-white">
              {loading ? "..." : jobs.length}
            </h3>

            <p className="mt-2 text-xs font-semibold text-violet-600 dark:text-violet-400">
              View all listings →
            </p>
          </div>

          <div
            onClick={() => navigate("/company/manage-jobs")}
            className="group cursor-pointer rounded-2xl border border-fuchsia-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-fuchsia-100/70 dark:border-white/10 dark:bg-[#1C1830] dark:hover:shadow-black/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-100 text-xl text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
              ✓
            </div>

            <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
              Active Jobs
            </p>

            <h3 className="mt-1 text-3xl font-extrabold dark:text-white">
              {loading ? "..." : activeJobs}
            </h3>

            <p className="mt-2 text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400">
              Accepting applications →
            </p>
          </div>

          <div
            onClick={() => navigate("/company/manage-applicants")}
            className="group cursor-pointer rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100/70 dark:border-white/10 dark:bg-[#1C1830] dark:hover:shadow-black/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              👥
            </div>

            <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Applicants
            </p>

            <h3 className="mt-1 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : applicants.length}
            </h3>

            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Review candidates & resumes →
            </p>
          </div>
        </section>

        {/* Jobs Section */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm dark:border-white/10 dark:bg-[#1C1830]">

          <div className="flex flex-col justify-between gap-3 border-b border-violet-50 p-6 sm:flex-row sm:items-center dark:border-white/10">
            <div>
              <h3 className="text-xl font-extrabold dark:text-white">
                Your Posted Vacancies
              </h3>

              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Jobs posted by your company
              </p>
            </div>

            <button
              onClick={() => navigate("/company/manage-jobs")}
              className="text-sm font-bold text-violet-600 transition hover:text-fuchsia-600 dark:text-violet-400"
            >
              Manage all jobs →
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Loading jobs...
              </p>
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm font-medium text-red-500">
              {error}
            </p>
          ) : jobs.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-3xl text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                ✦
              </div>

              <h3 className="mt-4 text-lg font-bold dark:text-white">
                No jobs posted yet
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Your posted jobs will appear here.
              </p>

              <button
                onClick={() => navigate("/company/create-job")}
                className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left">

                <thead className="bg-[#F8F6FF] text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:bg-[#171327] dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Job Position</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Employment</th>
                    <th className="px-6 py-4">Salary</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {jobs.slice(0, 5).map((job) => (
                    <tr
                      key={job._id}
                      className="border-t border-violet-50 transition hover:bg-violet-50/50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                      <td className="px-6 py-5 text-sm font-bold text-[#211B35] dark:text-white">
                        {job.title}
                      </td>

                      <td className="px-6 py-5 text-xs text-gray-500 dark:text-gray-400">
                        {job.location}
                      </td>

                      <td className="px-6 py-5 text-xs text-gray-500 dark:text-gray-400">
                        {job.jobType}
                      </td>

                      <td className="px-6 py-5 text-sm font-bold text-[#211B35] dark:text-white">
                        ₹{job.salary?.min} - ₹{job.salary?.max}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${job.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                              : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                            }`}
                        >
                          {job.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate("/company/manage-applicants")}
                            className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                          >
                            View Applicants
                          </button>

                          <button
                            onClick={() => navigate("/company/manage-jobs")}
                            className="text-xs font-semibold text-gray-500 hover:text-violet-600 dark:text-gray-400"
                          >
                            Manage →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="py-5 text-center text-xs text-gray-400 dark:text-gray-600">
          © 2026 JobNest. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

export default CompanyDashboard;
