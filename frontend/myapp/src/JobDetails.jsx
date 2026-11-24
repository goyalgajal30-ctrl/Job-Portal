
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`${API_BASE}/job/${id}`);

        const jobData =
          response.data.job || response.data.data || response.data;

        setJob(jobData);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load job details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F6FF] dark:bg-[#100D1D]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="mt-4 text-sm font-semibold text-violet-700 dark:text-violet-300">
          Loading job details...
        </p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F6FF] px-5 dark:bg-[#100D1D]">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-4xl dark:bg-red-500/10">
          !
        </div>

        <h2 className="mt-5 text-2xl font-extrabold text-[#211B35] dark:text-white">
          Job Not Available
        </h2>

        <p className="mt-2 text-center text-sm text-red-500">
          {error || "Job not found"}
        </p>

        <button
          onClick={() => navigate("/jobs")}
          className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  const companyName =
    job.company?.companyName ||
    job.companyDetails?.companyName ||
    "Company";

  const cardClass =
    "rounded-2xl border border-violet-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1830] md:p-8";

  const headingClass =
    "mb-5 text-xl font-extrabold text-[#211B35] dark:text-white";

  const textClass = "text-gray-600 dark:text-gray-300";

  return (
    <div className="min-h-screen bg-[#F8F6FF] transition-colors duration-300 dark:bg-[#100D1D]">

      {/* Navbar */}
      <nav className="sticky top-0 z-30 border-b border-violet-100 bg-white/85 px-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#171327]/90 md:px-8">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between">

          <h1
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-2 text-2xl font-extrabold tracking-tight text-[#211B35] dark:text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
              J
            </span>
            JobNest<span className="text-fuchsia-500">.</span>
          </h1>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <button
              onClick={() => navigate("/jobs")}
              className="rounded-xl bg-violet-50 px-4 py-2.5 text-sm font-bold text-violet-700 transition hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
            >
              All Jobs
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-5 py-8 md:py-10">

        {/* Back Button */}
        <button
          onClick={() => navigate("/jobs")}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-violet-700 transition hover:text-fuchsia-600 dark:text-violet-400"
        >
          <span className="text-lg">←</span>
          Back to Jobs
        </button>

        {/* Job Header */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-600 p-7 text-white shadow-xl shadow-violet-500/15 md:p-10">

          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="absolute -bottom-20 right-1/3 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl" />

          <div className="relative z-10">

            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold tracking-[2px] text-purple-100">
              JOB OPPORTUNITY
            </span>

            <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-start">

              <div className="max-w-2xl">
                <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
                  {job.title}
                </h2>

                <p className="mt-3 text-base font-semibold text-purple-100">
                  {companyName}
                </p>

                <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
                  <span className="rounded-xl border border-white/20 bg-white/10 px-4 py-2">
                    📍 {job.location}
                  </span>

                  <span className="rounded-xl border border-white/20 bg-white/10 px-4 py-2">
                    💼 {job.jobType}
                  </span>

                  <span className="rounded-xl border border-white/20 bg-white/10 px-4 py-2">
                    ✦ {job.experience} experience
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md md:min-w-[190px]">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-200">
                  Salary Range
                </p>

                <p className="mt-2 text-2xl font-extrabold">
                  ₹{job.salary?.min} - ₹{job.salary?.max}
                </p>

                <p className="mt-1 text-xs text-purple-200">
                  Compensation
                </p>
              </div>
            </div>

            {job.status?.toLowerCase() === "active" ? (
              <button
                onClick={() => navigate(`/job/${job._id}/apply`)}
                className="mt-8 rounded-xl bg-white px-8 py-3.5 text-sm font-extrabold text-violet-700 shadow-lg transition hover:-translate-y-1 hover:bg-purple-50"
              >
                Apply Now →
              </button>
            ) : (
              <p className="mt-8 inline-block rounded-xl bg-red-500/20 px-5 py-3 text-sm font-bold text-white">
                Applications are closed for this job.
              </p>
            )}
          </div>
        </section>

        {/* Job Description */}
        <section className={`${cardClass} mt-6`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-xl text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              ☰
            </div>

            <h3 className="text-xl font-extrabold text-[#211B35] dark:text-white">
              Job Description
            </h3>
          </div>

          <p className={`${textClass} whitespace-pre-line text-sm leading-8`}>
            {job.description}
          </p>
        </section>

        {/* Requirements */}
        <section className={`${cardClass} mt-6`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-100 text-xl text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
              ✓
            </div>

            <h3 className="text-xl font-extrabold text-[#211B35] dark:text-white">
              Requirements
            </h3>
          </div>

          {job.requirements?.length > 0 ? (
            <ul className={`space-y-3 ${textClass}`}>
              {job.requirements.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No requirements specified.
            </p>
          )}
        </section>

        {/* Skills */}
        <section className={`${cardClass} mt-6`}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
              ✦
            </div>

            <h3 className="text-xl font-extrabold text-[#211B35] dark:text-white">
              Required Skills
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {job.skills?.length > 0 ? (
              job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:border-fuchsia-200 hover:bg-fuchsia-50 hover:text-fuchsia-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-fuchsia-500/10"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No skills specified.
              </p>
            )}
          </div>
        </section>

        {/* Additional Details */}
        <section className={`${cardClass} mt-6`}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-100 text-xl text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
              ▣
            </div>

            <h3 className="text-xl font-extrabold text-[#211B35] dark:text-white">
              Additional Details
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div className="rounded-xl bg-[#F8F6FF] p-4 dark:bg-[#171327]">
              <p className="text-xs font-semibold text-gray-400">
                Qualification
              </p>
              <p className="mt-2 text-sm font-bold text-[#211B35] dark:text-white">
                {job.qualification || "Not specified"}
              </p>
            </div>

            <div className="rounded-xl bg-[#F8F6FF] p-4 dark:bg-[#171327]">
              <p className="text-xs font-semibold text-gray-400">
                Vacancies
              </p>
              <p className="mt-2 text-sm font-bold text-[#211B35] dark:text-white">
                {job.vacancies}
              </p>
            </div>

            <div className="rounded-xl bg-[#F8F6FF] p-4 dark:bg-[#171327]">
              <p className="text-xs font-semibold text-gray-400">
                Last Date to Apply
              </p>
              <p className="mt-2 text-sm font-bold text-[#211B35] dark:text-white">
                {formatDate(job.lastDate)}
              </p>
            </div>

            <div className="rounded-xl bg-[#F8F6FF] p-4 dark:bg-[#171327]">
              <p className="text-xs font-semibold text-gray-400">
                Job Status
              </p>
              <p className={`mt-2 text-sm font-bold ${job.status?.toLowerCase() === "active"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-500"
                }`}>
                {job.status}
              </p>
            </div>

          </div>
        </section>

        {/* Bottom Apply Section */}
        {job.status?.toLowerCase() === "active" && (
          <section className="mt-6 rounded-2xl border border-violet-100 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#1C1830] md:p-8">
            <h3 className="text-xl font-extrabold text-[#211B35] dark:text-white">
              Interested in this opportunity?
            </h3>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Take the next step towards your career with this opportunity.
            </p>

            <button
              onClick={() => navigate(`/job/${job._id}/apply`)}
              className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-1"
            >
              Apply for this Job →
            </button>
          </section>
        )}

        <footer className="py-8 text-center text-xs text-gray-400 dark:text-gray-600">
          © 2026 JobNest. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

export default JobDetails;
