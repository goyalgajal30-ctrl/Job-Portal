import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

function AllJobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE}/job/all`);
        setJobs(response.data.jobs || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const companyName = job.companyDetails?.companyName || "";
    const searchText = search.trim().toLowerCase();

    return (
      job.title?.toLowerCase().includes(searchText) ||
      job.location?.toLowerCase().includes(searchText) ||
      companyName.toLowerCase().includes(searchText) ||
      job.skills?.some((skill) =>
        String(skill).toLowerCase().includes(searchText)
      )
    );
  });

  return (
    <div className="min-h-screen overflow-hidden bg-[#F8F6FF] text-[#211B35] transition-colors duration-300 dark:bg-[#100D1D] dark:text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-purple-100/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#171327]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          <h1
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-2 text-2xl font-extrabold tracking-tight"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xl text-white shadow-lg shadow-purple-300/40">
              J
            </span>
            Job<span className="-ml-2 text-violet-600 dark:text-violet-400">Nest</span>
          </h1>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => navigate("/user/dashboard")}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-200/40 transition hover:-translate-y-0.5 hover:shadow-purple-300/50"
            >
              Dashboard →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero / Search Header */}
      <section className="relative overflow-hidden px-5 pb-12 pt-14 lg:px-8 lg:pt-20">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-700/20" />
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-fuchsia-300/25 blur-3xl dark:bg-fuchsia-700/20" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-xs font-bold tracking-wider text-violet-700 shadow-sm dark:border-violet-400/20 dark:bg-white/5 dark:text-violet-300">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              EXPLORE CAREER OPPORTUNITIES
            </span>

            <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Find your next
              <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                dream opportunity.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-gray-600 dark:text-gray-400">
              Explore exciting opportunities, discover great companies and
              find a role that matches your skills and ambitions.
            </p>
          </div>

          {/* Search Box */}
          <div className="mt-9 max-w-4xl rounded-2xl border border-purple-100 bg-white p-3 shadow-xl shadow-purple-200/30 dark:border-white/10 dark:bg-[#1C1830] dark:shadow-black/20">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-xl bg-[#F8F6FF] px-4 py-3 dark:bg-white/5">
                <span className="text-xl">⌕</span>
                <input
                  type="text"
                  placeholder="Search job, company, skills or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-xl border border-purple-200 px-6 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 dark:border-white/10 dark:text-violet-300 dark:hover:bg-white/5"
              >
                Clear Search
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span className="rounded-full border border-purple-100 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/5">
              💼 Multiple opportunities
            </span>
            <span className="rounded-full border border-purple-100 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/5">
              🚀 Career growth
            </span>
            <span className="rounded-full border border-purple-100 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/5">
              🌍 Remote & On-site
            </span>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <main className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">

        {/* Result Header */}
        <div className="mb-7 flex flex-col justify-between gap-3 border-b border-purple-100 pb-5 sm:flex-row sm:items-center dark:border-white/10">
          <div>
            <h2 className="text-2xl font-extrabold">Available Jobs</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Find the opportunity that suits you best.
            </p>
          </div>

          {!loading && !error && (
            <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              <span>{filteredJobs.length}</span>
              Jobs Found
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-purple-100 bg-white p-6 dark:border-white/10 dark:bg-[#1C1830]"
              >
                <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-white/10" />
                <div className="mt-5 h-5 w-2/3 rounded bg-purple-100 dark:bg-white/10" />
                <div className="mt-3 h-4 w-1/3 rounded bg-purple-100 dark:bg-white/10" />
                <div className="mt-7 h-20 rounded-xl bg-purple-50 dark:bg-white/5" />
                <div className="mt-6 h-10 rounded-xl bg-purple-100 dark:bg-white/10" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error */
          <div className="rounded-3xl border border-red-200 bg-white px-6 py-16 text-center dark:border-red-500/20 dark:bg-[#1C1830]">
            <div className="text-5xl">⚠️</div>
            <h3 className="mt-5 text-xl font-bold text-red-600 dark:text-red-400">
              Something went wrong
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-purple-100 bg-white px-6 py-16 text-center shadow-sm dark:border-white/10 dark:bg-[#1C1830]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-4xl dark:from-violet-500/20 dark:to-fuchsia-500/20">
              🔍
            </div>

            <h3 className="mt-6 text-2xl font-extrabold">
              No Jobs Found
            </h3>

            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              We couldn't find any matching jobs. Try another keyword.
            </p>

            <button
              onClick={() => setSearch("")}
              className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200/40 transition hover:-translate-y-0.5"
            >
              Clear Search
            </button>
          </div>
        ) : (
          /* Job Cards */
          <div className="grid gap-6 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="group rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-purple-200/30 dark:border-white/10 dark:bg-[#1C1830] dark:hover:border-violet-400/40 dark:hover:shadow-black/30"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-2xl font-black text-violet-700 dark:from-violet-500/20 dark:to-fuchsia-500/20 dark:text-violet-300">
                      {job.companyDetails?.companyName?.charAt(0)?.toUpperCase() || "C"}
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold transition group-hover:text-violet-600 dark:group-hover:text-violet-400">
                        {job.title}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {job.companyDetails?.companyName || "Company"}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                    {job.jobType || "Job"}
                  </span>
                </div>

                {/* Job Details */}
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#F8F6FF] p-3 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="mt-1 text-sm font-semibold">📍 {job.location || "Not specified"}</p>
                  </div>

                  <div className="rounded-xl bg-[#F8F6FF] p-3 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                    <p className="mt-1 text-sm font-semibold">💼 {job.experience || "Not specified"}</p>
                  </div>

                  <div className="rounded-xl bg-[#F8F6FF] p-3 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Salary</p>
                    <p className="mt-1 text-sm font-semibold">
                      ₹{job.salary?.min ?? "N/A"} - ₹{job.salary?.max ?? "N/A"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F8F6FF] p-3 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Vacancies</p>
                    <p className="mt-1 text-sm font-semibold">👥 {job.vacancies ?? "N/A"}</p>
                  </div>
                </div>

                {/* Skills */}
                {job.skills?.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Required Skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-lg border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-violet-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 flex flex-col gap-4 border-t border-purple-100 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Application Deadline</p>
                    <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      📅 {job.lastDate
                        ? new Date(job.lastDate).toLocaleDateString("en-IN")
                        : "Not specified"}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/job/${job._id}`)}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200/40 transition hover:-translate-y-0.5 hover:shadow-purple-300/50 dark:shadow-none"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white px-5 py-6 dark:border-white/10 dark:bg-[#171327]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-xs text-gray-400 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} JobNest. All rights reserved.</p>
          <button
            onClick={() => navigate("/")}
            className="font-semibold text-violet-600 transition hover:text-fuchsia-600 dark:text-violet-400"
          >
            Back to Home ↑
          </button>
        </div>
      </footer>
    </div>
  );
}

export default AllJobs;
