import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

function UserDashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!token) return;

      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [appsRes, intsRes, profRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/job-apply/my-applications`, config),
          axios.get(`${API_BASE}/interview/my-interviews`, config),
          axios.get(`${API_BASE}/user-profile/getone`, config),
        ]);

        if (appsRes.status === "fulfilled") {
          setApplications(appsRes.value.data.applications || []);
        }

        if (intsRes.status === "fulfilled") {
          setInterviews(intsRes.value.data.interviews || []);
        }

        if (profRes.status === "fulfilled") {
          setProfile(profRes.value.data.profile || null);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/jobs");
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "selected":
      case "shortlisted":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20";
      case "rejected":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20";
      case "pending":
      default:
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20";
    }
  };

  const isProfileComplete = profile && (profile.skills?.length > 0 || profile.About);

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-[#211B35] transition-colors duration-300 dark:bg-[#100D1D] dark:text-white">
      {/* Sticky Header */}
      <nav className="sticky top-0 z-40 border-b border-violet-100 bg-white/85 px-6 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#171327]/90 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 font-extrabold text-white shadow-md shadow-violet-500/20">
              J
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Job<span className="text-violet-600 dark:text-violet-400">Nest</span>
              <span className="text-fuchsia-500">.</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Nav Quick Links */}
            <button
              onClick={() => navigate("/jobs")}
              className="hidden rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-violet-50 hover:text-violet-700 dark:text-gray-300 dark:hover:bg-white/5 md:block"
            >
              Find Jobs
            </button>

            <button
              onClick={() => navigate("/user/my-applications")}
              className="rounded-xl border border-violet-100 bg-white px-3.5 py-2 text-sm font-semibold transition hover:bg-violet-50 dark:border-white/10 dark:bg-[#1C1830] dark:hover:bg-white/5"
            >
              My Applications
            </button>

            <button
              onClick={() => navigate("/user/my-interviews")}
              className="rounded-xl border border-violet-100 bg-white px-3.5 py-2 text-sm font-semibold transition hover:bg-violet-50 dark:border-white/10 dark:bg-[#1C1830] dark:hover:bg-white/5"
            >
              My Interviews
            </button>

            <ThemeToggle />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 rounded-full border border-violet-200 bg-white py-1.5 pl-2 pr-3 transition hover:bg-violet-50 dark:border-white/15 dark:bg-[#1C1830] dark:hover:bg-white/5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-sm font-bold uppercase text-white">
                  {user.name?.charAt(0) || "U"}
                </span>

                <span className="hidden text-sm font-semibold sm:inline">
                  {user.name?.split(" ")[0] || "Profile"}
                </span>

                <span className="text-xs text-gray-400">
                  {showProfile ? "▲" : "▼"}
                </span>
              </button>

              {showProfile && (
                <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1C1830]">
                  <div className="border-b border-violet-100 bg-violet-50/60 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-lg font-bold uppercase text-white shadow-md">
                        {user.name?.charAt(0) || "U"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-gray-900 dark:text-white">
                          {user.name || "Job Seeker"}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {user.email || "Email"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 p-2 text-sm font-medium">
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        navigate("/user/profile");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-violet-50 dark:hover:bg-white/5"
                    >
                      <span>👤</span>
                      My Profile
                    </button>

                    <button
                      onClick={() => {
                        setShowProfile(false);
                        navigate("/user/change-password");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-violet-50 dark:hover:bg-white/5"
                    >
                      <span>🔒</span>
                      Change Password
                    </button>

                    <hr className="my-1 border-violet-100 dark:border-white/10" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        {/* Hero Welcome Banner */}
        <section className="relative mb-10 overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-600 px-7 py-12 text-white shadow-2xl shadow-violet-500/20 md:px-12 md:py-14">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border-[36px] border-white/10" />
          <div className="absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-fuchsia-400/25 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wider text-purple-100 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                CANDIDATE DASHBOARD
              </span>

              <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Welcome back, {user.name?.split(" ")[0] || "Candidate"}!
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-purple-100 md:text-base">
                Discover jobs tailored to your skills, track your submitted applications, and stay ahead in your interview schedule.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate("/jobs")}
                  className="rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-violet-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-purple-50"
                >
                  Explore Jobs →
                </button>

                <button
                  onClick={() => navigate("/user/profile")}
                  className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  {isProfileComplete ? "Update Profile" : "Complete Profile"}
                </button>
              </div>
            </div>

            {/* Quick Profile Summary Badge */}
            <div className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md sm:flex-row sm:items-center lg:flex-col lg:items-start">
              <div>
                <p className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                  Profile Status
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${isProfileComplete ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span className="text-base font-bold text-white">
                    {isProfileComplete ? "Profile Active" : "Incomplete Profile"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/user/profile")}
                className="mt-2 text-xs font-bold text-purple-100 underline underline-offset-4 hover:text-white"
              >
                {isProfileComplete ? "View Details" : "Add skills & experience →"}
              </button>
            </div>
          </div>
        </section>

        {/* Live Metrics Grid */}
        <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Applications */}
          <div
            onClick={() => navigate("/user/my-applications")}
            className="group cursor-pointer rounded-3xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-200/40 dark:border-white/10 dark:bg-[#1C1830] dark:hover:shadow-none"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-2xl text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              📄
            </div>
            <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
              My Applications
            </p>
            <h3 className="mt-1 text-3xl font-extrabold text-gray-900 dark:text-white">
              {loading ? "..." : applications.length}
            </h3>
            <p className="mt-2 text-xs font-semibold text-violet-600 dark:text-violet-400">
              Track status & updates →
            </p>
          </div>

          {/* Card 2: Interviews */}
          <div
            onClick={() => navigate("/user/my-interviews")}
            className="group cursor-pointer rounded-3xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-200/40 dark:border-white/10 dark:bg-[#1C1830] dark:hover:shadow-none"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-100 text-2xl text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
              📅
            </div>
            <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
              Scheduled Interviews
            </p>
            <h3 className="mt-1 text-3xl font-extrabold text-gray-900 dark:text-white">
              {loading ? "..." : interviews.length}
            </h3>
            <p className="mt-2 text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400">
              View interview schedule →
            </p>
          </div>

          {/* Card 3: Profile Overview */}
          <div
            onClick={() => navigate("/user/profile")}
            className="group cursor-pointer rounded-3xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-200/40 dark:border-white/10 dark:bg-[#1C1830] dark:hover:shadow-none"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              👤
            </div>
            <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
              Candidate Profile
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
              {profile ? `${profile.skills?.length || 0} Skills` : "Not set"}
            </h3>
            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Edit bio & credentials →
            </p>
          </div>

          {/* Card 4: Explore Jobs */}
          <div
            onClick={() => navigate("/jobs")}
            className="group cursor-pointer rounded-3xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-200/40 dark:border-white/10 dark:bg-[#1C1830] dark:hover:shadow-none"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-2xl text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              💼
            </div>
            <p className="mt-5 text-sm font-medium text-gray-500 dark:text-gray-400">
              Open Vacancies
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
              Explore
            </h3>
            <p className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Browse all jobs →
            </p>
          </div>
        </section>

        {/* Quick Search Card */}
        <section className="mb-10 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1830] md:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Find Your Next Career Move
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Search hundreds of verified job openings by role, company or location.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="e.g. React Developer, Node.js, Designer, Bangalore..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="min-w-0 flex-1 rounded-2xl border border-violet-100 bg-[#F8F6FF] px-5 py-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#171327] dark:focus:ring-violet-500/10"
            />

            <button
              onClick={handleSearch}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-violet-300 dark:shadow-none"
            >
              Search Jobs
            </button>
          </div>
        </section>

        {/* Recent Applications Section */}
        <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1830] md:p-8">
          <div className="flex items-center justify-between border-b border-violet-50 pb-5 dark:border-white/10">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Applications
              </h3>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Your latest submitted job applications
              </p>
            </div>

            <button
              onClick={() => navigate("/user/my-applications")}
              className="text-sm font-bold text-violet-600 transition hover:text-fuchsia-600 dark:text-violet-400"
            >
              View All ({applications.length}) →
            </button>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-violet-200 py-12 text-center dark:border-white/10">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  You haven&apos;t applied for any jobs yet.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Explore available openings and submit your first application.
                </p>
                <button
                  onClick={() => navigate("/jobs")}
                  className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-violet-700"
                >
                  Explore Jobs Now
                </button>
              </div>
            ) : (
              <div className="divide-y divide-violet-50 dark:divide-white/10">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app._id}
                    className="flex flex-col justify-between gap-4 py-4 transition hover:bg-violet-50/40 dark:hover:bg-white/5 sm:flex-row sm:items-center sm:px-3 rounded-xl"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {app.jobId?.title || "Job Title"}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {app.jobId?.company?.companyName || "Company"} • Applied on{" "}
                        {new Date(app.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status || "Pending"}
                      </span>

                      <button
                        onClick={() => navigate(`/job/${app.jobId?._id}`)}
                        className="rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 dark:border-white/10 dark:text-violet-300"
                      >
                        View Job
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-violet-100 py-6 text-center text-xs text-gray-400 dark:border-white/10">
          © 2026 JobNest. All rights reserved. Built for ambitious professionals.
        </footer>
      </main>
    </div>
  );
}

export default UserDashboard;
