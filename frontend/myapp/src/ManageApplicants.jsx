
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

function ManageApplicants() {
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [blockingId, setBlockingId] = useState("");
  const [unblockingId, setUnblockingId] = useState("");
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [resumePreview, setResumePreview] = useState("");
  const [previewLoading, setPreviewLoading] = useState("");

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

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError("");

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_BASE}/job-apply/company-applicants`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      setApplicants(response.data.applicants || []);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err.response?.data?.message || "Failed to fetch applicants");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_BASE}/job-apply/blocked-users`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      setBlockedUsers(response.data.blockedUsers || []);
    } catch (err) {
      if (!handleAuthError(err)) {
        console.log(
          "Blocked users error:",
          err.response?.data?.message || err.message
        );
      }
    }
  };

  useEffect(() => {
    fetchApplicants();
    fetchBlockedUsers();
  }, []);

  useEffect(() => {
    return () => {
      if (resumePreview) {
        URL.revokeObjectURL(resumePreview);
      }
    };
  }, [resumePreview]);

  const viewResume = async (id) => {
    try {
      setPreviewLoading(id);

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_BASE}/job-apply/resume/${id}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
          responseType: "blob",
        }
      );

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const previewUrl = URL.createObjectURL(pdfBlob);
      setResumePreview(previewUrl);
    } catch (err) {
      if (!handleAuthError(err)) {
        alert(err.response?.data?.message || "Unable to preview resume");
      }
    } finally {
      setPreviewLoading("");
    }
  };

  const closePreview = () => {
    setResumePreview("");
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        navigate("/login");
        return;
      }

      await axios.put(
        `${API_BASE}/job-apply/status/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant._id === id ? { ...applicant, status } : applicant
        )
      );
    } catch (err) {
      if (!handleAuthError(err)) {
        alert(err.response?.data?.message || "Status update failed");
      }
    } finally {
      setUpdatingId("");
    }
  };

  const blockUser = async (userId, userName) => {
    if (!userId) return;

    const confirmBlock = window.confirm(
      `Are you sure you want to block ${userName}? This user will not be able to apply for any of your company's jobs.`
    );

    if (!confirmBlock) return;

    try {
      setBlockingId(userId);

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${API_BASE}/job-apply/block-user/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      alert(response.data.message || "User blocked successfully");
      await fetchBlockedUsers();
    } catch (err) {
      if (!handleAuthError(err)) {
        alert(err.response?.data?.message || "Unable to block user");
      }
    } finally {
      setBlockingId("");
    }
  };

  const unblockUser = async (userId, userName) => {
    if (!userId) return;

    const confirmUnblock = window.confirm(
      `Are you sure you want to unblock ${userName}?`
    );

    if (!confirmUnblock) return;

    try {
      setUnblockingId(userId);

      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        navigate("/login");
        return;
      }

      const response = await axios.delete(
        `${API_BASE}/job-apply/unblock-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      alert(response.data.message || "User unblocked successfully");
      await fetchBlockedUsers();
    } catch (err) {
      if (!handleAuthError(err)) {
        alert(err.response?.data?.message || "Unable to unblock user");
      }
    } finally {
      setUnblockingId("");
    }
  };

  const isUserBlocked = (userId) => {
    return blockedUsers.some(
      (item) => item.userId?._id === userId
    );
  };

  const getStatusColor = (status) => {
    if (status === "accepted") {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    }

    if (status === "shortlisted") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    }

    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8F6FF] text-gray-700 dark:bg-[#100D1D] dark:text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
        <p className="font-medium">Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6FF] px-4 py-7 transition-colors duration-300 dark:bg-[#100D1D] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-violet-100 bg-white/90 p-5 shadow-sm shadow-violet-100/50 dark:border-violet-900/40 dark:bg-[#171327] dark:shadow-none sm:p-7">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1 text-xs font-bold tracking-wide text-white">
                JOBNEST
              </span>
              <span className="text-xs font-medium text-violet-500">
                Company Dashboard
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
              Manage Applicants
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Review applications, manage candidate status and view resumes.
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
              onClick={() => navigate("/company/manage-interviews")}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              Interviews →
            </button>
          </div>
        </header>

        {/* STATISTICS */}
        <div className="mb-7 grid gap-5 sm:grid-cols-2">
          <div className="group rounded-2xl border border-violet-100 bg-white p-6 shadow-sm shadow-violet-100/50 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100 dark:border-violet-900/40 dark:bg-[#1C1830] dark:shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Applicants
                </p>
                <h2 className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white">
                  {applicants.length}
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl dark:bg-violet-500/20">
                👥
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-violet-600 dark:text-violet-300">
              Applications received for your jobs
            </p>
          </div>

          <div className="group rounded-2xl border border-fuchsia-100 bg-white p-6 shadow-sm shadow-fuchsia-100/50 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-fuchsia-100 dark:border-fuchsia-900/40 dark:bg-[#1C1830] dark:shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Blocked Users
                </p>
                <h2 className="mt-2 text-4xl font-extrabold text-fuchsia-600 dark:text-fuchsia-400">
                  {blockedUsers.length}
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-100 text-2xl dark:bg-fuchsia-500/20">
                🚫
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-fuchsia-600 dark:text-fuchsia-300">
              Users restricted from applying
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            <p>{error}</p>

            <button
              onClick={fetchApplicants}
              className="font-bold underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* BLOCKED USERS SECTION */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm shadow-violet-100/50 dark:border-violet-900/40 dark:bg-[#1C1830] dark:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-xl dark:bg-red-500/15">
                🚫
              </div>

              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">
                  Blocked Users
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Manage users who cannot apply to your company's jobs.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowBlockedUsers(!showBlockedUsers)}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:scale-[1.02] hover:shadow-lg dark:shadow-none"
            >
              {showBlockedUsers ? "Hide Blocked Users" : "View Blocked Users"}
            </button>
          </div>

          {showBlockedUsers && (
            <div className="border-t border-violet-100 p-5 dark:border-violet-900/40 sm:p-6">
              {blockedUsers.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mb-3 text-3xl">✨</div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    No blocked users found.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {blockedUsers.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-red-100 bg-red-50/70 p-5 dark:border-red-900/40 dark:bg-red-900/10 sm:flex-row sm:items-center"
                    >
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {item.userId?.name || "Unknown User"}
                        </h3>

                        <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                          {item.userId?.email || "Email unavailable"}
                        </p>

                        <span className="mt-3 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                          Blocked
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          unblockUser(
                            item.userId?._id,
                            item.userId?.name || "this user"
                          )
                        }
                        disabled={unblockingId === item.userId?._id}
                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {unblockingId === item.userId?._id
                          ? "Unblocking..."
                          : "Unblock User"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* APPLICANTS HEADING */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white sm:text-2xl">
              All Applications
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Review and manage candidates who applied for your jobs.
            </p>
          </div>

          <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            {applicants.length} Applications
          </span>
        </div>

        {/* APPLICANTS */}
        {applicants.length === 0 ? (
          <div className="rounded-3xl border border-violet-100 bg-white px-6 py-16 text-center shadow-sm dark:border-violet-900/40 dark:bg-[#1C1830]">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-4xl dark:bg-violet-500/15">
              📄
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              No Applications Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              Applications for your jobs will appear here once candidates start
              applying.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {applicants.map((applicant) => {
              const userId = applicant.userId?._id;
              const blocked = userId ? isUserBlocked(userId) : false;

              return (
                <article
                  key={applicant._id}
                  className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm shadow-violet-100/50 transition hover:shadow-lg hover:shadow-violet-100/60 dark:border-violet-900/40 dark:bg-[#1C1830] dark:shadow-none"
                >
                  {/* CANDIDATE DETAILS */}
                  <div className="p-5 sm:p-7">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row">
                      <div className="flex gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xl font-bold text-white shadow-md shadow-violet-200 dark:shadow-none">
                          {(applicant.userId?.name || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h2 className="break-words text-xl font-extrabold text-gray-900 dark:text-white">
                            {applicant.userId?.name || "Candidate"}
                          </h2>

                          <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                            {applicant.userId?.email || "Email unavailable"}
                          </p>

                          <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                            <span>💼</span>
                            {applicant.jobId?.title || "Job"}
                          </div>

                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            📍 {applicant.jobId?.location || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
                        <span
                          className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${getStatusColor(
                            applicant.status
                          )}`}
                        >
                          {applicant.status || "pending"}
                        </span>

                        {blocked && (
                          <span className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            User Blocked
                          </span>
                        )}

                        {applicant.resume && (
                          <button
                            onClick={() => viewResume(applicant._id)}
                            disabled={previewLoading !== ""}
                            className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-bold text-violet-700 transition hover:bg-violet-50 disabled:opacity-50 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-500/10"
                          >
                            {previewLoading === applicant._id
                              ? "Loading Resume..."
                              : "📄 View Resume"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* COVER LETTER */}
                    <div className="mt-6 rounded-2xl bg-[#F8F6FF] p-5 dark:bg-[#171327]">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                        Cover Letter
                      </p>

                      <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600 dark:text-gray-300">
                        {applicant.coverLetter || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* UPDATE STATUS */}
                  <div className="border-t border-violet-100 px-5 py-5 dark:border-violet-900/40 sm:px-7">
                    <p className="mb-4 text-sm font-bold text-gray-900 dark:text-white">
                      Update Application Status
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        disabled={updatingId === applicant._id}
                        onClick={() =>
                          updateStatus(applicant._id, "shortlisted")
                        }
                        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === applicant._id
                          ? "Updating..."
                          : "Shortlist"}
                      </button>

                      <button
                        disabled={updatingId === applicant._id}
                        onClick={() =>
                          updateStatus(applicant._id, "accepted")
                        }
                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Accept
                      </button>

                      <button
                        disabled={updatingId === applicant._id}
                        onClick={() =>
                          updateStatus(applicant._id, "rejected")
                        }
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>

                      {(applicant.status === "accepted" || applicant.status === "shortlisted") && (
                        <button
                          onClick={() =>
                            navigate("/company/schedule-interview", {
                              state: {
                                jobApplyId: applicant._id,
                                applicantName: applicant.userId?.name || "Candidate",
                                jobTitle: applicant.jobId?.title || "Job",
                              },
                            })
                          }
                          className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:opacity-90 dark:shadow-none"
                        >
                          📅 Schedule Interview
                        </button>
                      )}
                    </div>
                  </div>

                  {/* BLOCK USER */}
                  <div className="border-t border-violet-100 bg-violet-50/40 px-5 py-5 dark:border-violet-900/40 dark:bg-[#171327]/60 sm:px-7">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          Candidate Restrictions
                        </p>

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                          Prevent this user from applying to your company's
                          jobs.
                        </p>
                      </div>

                      {blocked ? (
                        <button
                          disabled
                          className="cursor-not-allowed rounded-xl bg-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        >
                          Already Blocked
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            blockUser(
                              userId,
                              applicant.userId?.name || "this user"
                            )
                          }
                          disabled={!userId || blockingId === userId}
                          className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {blockingId === userId
                            ? "Blocking..."
                            : "🚫 Block User"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-10 border-t border-violet-100 py-6 text-center text-xs text-gray-500 dark:border-violet-900/40 dark:text-gray-500">
          © 2026 JobNest. Manage your hiring process with confidence.
        </footer>
      </div>

      {/* RESUME PREVIEW MODAL */}
      {resumePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#100D1D]/80 p-3 backdrop-blur-sm sm:p-6">
          <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-2xl dark:border-violet-800 dark:bg-[#1C1830]">
            <div className="flex items-center justify-between gap-3 border-b border-violet-100 bg-white p-4 dark:border-violet-900/40 dark:bg-[#1C1830] sm:px-6">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">
                  Resume Preview
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Candidate resume document
                </p>
              </div>

              <button
                onClick={closePreview}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Close ✕
              </button>
            </div>

            <iframe
              src={resumePreview}
              title="Resume Preview"
              className="h-full w-full bg-gray-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageApplicants;
