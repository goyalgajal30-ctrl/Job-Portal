
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!resume) {
        setError("Please select your resume");
        return;
      }

      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("coverLetter", coverLetter);

      const response = await axios.post(
        `${API_BASE}/job-apply/apply/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate("/jobs");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setResume(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      setResume(null);
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume size must be less than 5 MB");
      setResume(null);
      e.target.value = "";
      return;
    }

    setError("");
    setResume(file);
  };

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
              onClick={() => navigate("/jobs")}
              className="rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-bold text-violet-700 transition hover:bg-violet-50 dark:border-white/10 dark:text-violet-300 dark:hover:bg-white/5"
            >
              ← All Jobs
            </button>
          </div>
        </div>
      </nav>

      {/* Background */}
      <main className="relative min-h-[calc(100vh-73px)] px-5 py-12 lg:py-16">

        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-700/20" />
        <div className="absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-fuchsia-300/25 blur-3xl dark:bg-fuchsia-700/20" />

        <div className="relative mx-auto max-w-5xl">

          {/* Heading */}
          <div className="mb-9 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-xs font-bold tracking-wider text-violet-700 shadow-sm dark:border-violet-400/20 dark:bg-white/5 dark:text-violet-300">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              TAKE THE NEXT STEP
            </span>

            <h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              Apply for your
              <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                dream job.
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500 dark:text-gray-400 sm:text-base">
              Submit your resume and introduce yourself to the employer.
              Make your next career move with JobNest.
            </p>
          </div>

          {/* Form Layout */}
          <div className="grid items-start gap-7 lg:grid-cols-[1fr_300px]">

            {/* Application Form */}
            <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xl shadow-purple-200/30 sm:p-9 dark:border-white/10 dark:bg-[#1C1830] dark:shadow-black/20">

              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-2xl dark:from-violet-500/20 dark:to-fuchsia-500/20">
                  📄
                </div>

                <div>
                  <h3 className="text-xl font-extrabold">
                    Application Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete the information below.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <span className="text-lg">⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
                  <span className="text-lg">✓</span>
                  <p>{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* Resume Upload */}
                <div className="mb-8">
                  <label className="mb-3 block text-sm font-bold">
                    Upload Resume <span className="text-red-500">*</span>
                  </label>

                  <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-[#F8F6FF] px-5 py-9 text-center transition hover:border-violet-500 hover:bg-violet-50 dark:border-white/15 dark:bg-white/5 dark:hover:border-violet-400 dark:hover:bg-violet-500/10">

                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleResumeChange}
                      required
                      className="hidden"
                    />

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-3xl transition group-hover:scale-110 dark:from-violet-500/20 dark:to-fuchsia-500/20">
                      📤
                    </div>

                    {resume ? (
                      <>
                        <p className="mt-4 max-w-full break-all font-bold text-violet-700 dark:text-violet-300">
                          {resume.name}
                        </p>
                        <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                          ✓ Resume selected successfully
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-4 font-bold">
                          Click to upload your resume
                        </p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Select a PDF file from your device
                        </p>
                      </>
                    )}

                    <span className="mt-5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-200/40">
                      {resume ? "Change Resume" : "Choose File"}
                    </span>
                  </label>

                  <p className="mt-3 text-xs text-gray-400">
                    PDF format only · Maximum file size 5 MB
                  </p>
                </div>

                {/* Cover Letter */}
                <div className="mb-7">
                  <label className="mb-3 block text-sm font-bold">
                    Cover Letter
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Introduce yourself, describe your skills and explain why you are interested in this position..."
                    rows={7}
                    className="w-full resize-none rounded-2xl border border-purple-100 bg-[#F8F6FF] px-5 py-4 text-sm leading-7 outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-violet-400 dark:focus:ring-violet-500/10"
                  />
                  <p className="mt-2 text-right text-xs text-gray-400">
                    {coverLetter.length} characters
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-4 text-sm font-bold text-white shadow-lg shadow-purple-200/40 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-300/40 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-none"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application <span>→</span>
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs text-gray-400">
                  By submitting, you agree to share your application with the employer.
                </p>
              </form>
            </div>

            {/* Side Information */}
            <aside className="space-y-5">

              <div className="rounded-3xl bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-purple-300/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl">
                  ✨
                </div>

                <h3 className="mt-5 text-xl font-extrabold">
                  Make a great first impression
                </h3>

                <p className="mt-3 text-sm leading-7 text-purple-100">
                  A clear resume and a thoughtful cover letter can help
                  employers understand your strengths.
                </p>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1830]">
                <h3 className="font-extrabold">Application Checklist</h3>

                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                      ✓
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      Resume in PDF format
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                      ✎
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      Review your cover letter
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">
                      ↑
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      Submit your application
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-bold">Need to go back?</p>
                <p className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                  You can explore other opportunities before applying.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/jobs")}
                  className="mt-4 text-sm font-bold text-violet-600 hover:text-fuchsia-600 dark:text-violet-400"
                >
                  Browse all jobs →
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white px-5 py-5 dark:border-white/10 dark:bg-[#171327]">
        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} JobNest. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default ApplyJob;
