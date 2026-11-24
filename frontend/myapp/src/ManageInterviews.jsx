import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

const API = `${API_BASE}/interview`;

function ManageInterviews() {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({});
    const [result, setResult] = useState({});
    const [updatingId, setUpdatingId] = useState("");

    const fetchInterviews = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `${API}/company-interviews`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setInterviews(response.data.interviews || []);
        } catch (error) {
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("role");
                navigate("/login");
            } else {
                alert(error.response?.data?.message || "Failed to fetch interviews");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, []);

    const updateResult = async (id) => {
        if (!result[id]) {
            alert("Please select interview result");
            return;
        }

        if (!feedback[id]?.trim()) {
            alert("Please enter feedback");
            return;
        }

        try {
            setUpdatingId(id);

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.put(
                `${API}/result/${id}`,
                {
                    status: result[id],
                    feedback: feedback[id],
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert(response.data.message || "Interview result updated!");
            await fetchInterviews();
        } catch (error) {
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("role");
                navigate("/login");
            } else {
                alert(error.response?.data?.message || "Failed to update result");
            }
        } finally {
            setUpdatingId("");
        }
    };

    const getStatusStyle = (status) => {
        if (status === "cleared") {
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
        }

        if (status === "not_cleared") {
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
        }

        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    };

    const formatDate = (date) => {
        if (!date) return "Not specified";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-[#F8F6FF] px-4 py-7 text-gray-800 transition-colors duration-300 dark:bg-[#100D1D] dark:text-white sm:px-6 lg:px-10">
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
                            Manage Interviews
                        </h1>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            View scheduled interviews and update candidate results.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <button
                            onClick={() => navigate("/company/dashboard")}
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:scale-[1.02] hover:shadow-lg dark:shadow-none"
                        >
                            ← Dashboard
                        </button>
                    </div>
                </header>

                {/* STATISTICS */}
                {!loading && (
                    <div className="mb-7 grid gap-5 sm:grid-cols-2">
                        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm dark:border-violet-900/40 dark:bg-[#1C1830]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Total Interviews
                                    </p>

                                    <h2 className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white">
                                        {interviews.length}
                                    </h2>
                                </div>

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl dark:bg-violet-500/20">
                                    📅
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-fuchsia-100 bg-white p-6 shadow-sm dark:border-fuchsia-900/40 dark:bg-[#1C1830]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Pending Results
                                    </p>

                                    <h2 className="mt-2 text-4xl font-extrabold text-fuchsia-600 dark:text-fuchsia-400">
                                        {interviews.filter((item) => item.status === "pending").length}
                                    </h2>
                                </div>

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-100 text-2xl dark:bg-fuchsia-500/20">
                                    ⏳
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* LOADING */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-violet-100 bg-white py-20 dark:border-violet-900/40 dark:bg-[#1C1830]">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>

                        <p className="font-medium text-gray-600 dark:text-gray-300">
                            Loading interviews...
                        </p>
                    </div>
                ) : interviews.length === 0 ? (
                    /* EMPTY STATE */
                    <div className="rounded-3xl border border-violet-100 bg-white px-6 py-16 text-center shadow-sm dark:border-violet-900/40 dark:bg-[#1C1830]">
                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-4xl dark:bg-violet-500/15">
                            📅
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            No Interviews Scheduled
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                            Your scheduled interviews will appear here. Once interviews are
                            arranged, you can manage their results from this page.
                        </p>

                        <button
                            onClick={() => navigate("/company/dashboard")}
                            className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                ) : (
                    /* INTERVIEW LIST */
                    <div className="space-y-5">
                        {interviews.map((interview) => {
                            const application = interview.jobApplyId;
                            const candidate = application?.userId;
                            const job = application?.jobId;

                            return (
                                <article
                                    key={interview._id}
                                    className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm shadow-violet-100/50 transition hover:shadow-lg hover:shadow-violet-100/60 dark:border-violet-900/40 dark:bg-[#1C1830] dark:shadow-none"
                                >
                                    {/* CANDIDATE HEADER */}
                                    <div className="p-5 sm:p-7">
                                        <div className="flex flex-wrap items-start justify-between gap-5">
                                            <div className="flex min-w-0 gap-4">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xl font-bold text-white shadow-md shadow-violet-200 dark:shadow-none">
                                                    {(candidate?.name || "C")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <h2 className="break-words text-xl font-extrabold text-gray-900 dark:text-white">
                                                        {candidate?.name || "Candidate"}
                                                    </h2>

                                                    <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                                                        {candidate?.email || "No email"}
                                                    </p>

                                                    <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                                                        💼 {job?.title || interview.jobDescription || "Job"}
                                                    </div>
                                                </div>
                                            </div>

                                            <span
                                                className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${getStatusStyle(
                                                    interview.status
                                                )}`}
                                            >
                                                {(interview.status || "pending").replace("_", " ")}
                                            </span>
                                        </div>

                                        {/* INTERVIEW DETAILS */}
                                        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <div className="rounded-2xl bg-[#F8F6FF] p-4 dark:bg-[#171327]">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    Interview Date
                                                </p>

                                                <p className="mt-2 font-bold text-gray-900 dark:text-white">
                                                    📅 {formatDate(interview.interviewDate)}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl bg-[#F8F6FF] p-4 dark:bg-[#171327]">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    Interview Time
                                                </p>

                                                <p className="mt-2 font-bold text-gray-900 dark:text-white">
                                                    🕒 {interview.interviewTime || "Not specified"}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl bg-[#F8F6FF] p-4 dark:bg-[#171327]">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    Interview Mode
                                                </p>

                                                <p className="mt-2 font-bold capitalize text-gray-900 dark:text-white">
                                                    {interview.interviewMode || "Not specified"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* GOOGLE MEET */}
                                        {interview.interviewMode === "online" && (
                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 dark:border-violet-900/40 dark:bg-violet-500/10">
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">
                                                        Online Interview
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Join the scheduled meeting using this link.
                                                    </p>
                                                </div>

                                                {interview.meetLink ? (
                                                    <a
                                                        href={interview.meetLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                                                    >
                                                        Join Meeting ↗
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        Meeting link unavailable
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* JOB DESCRIPTION */}
                                        <div className="mt-5 rounded-2xl border border-violet-100 p-5 dark:border-violet-900/40">
                                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                                                Job Description
                                            </p>

                                            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600 dark:text-gray-300">
                                                {interview.jobDescription || "No description provided"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* RESULT FORM */}
                                    {interview.status === "pending" ? (
                                        <div className="border-t border-violet-100 bg-violet-50/40 px-5 py-6 dark:border-violet-900/40 dark:bg-[#171327]/60 sm:px-7">
                                            <div className="mb-5">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    Update Interview Result
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    Select the candidate's result and provide feedback.
                                                </p>
                                            </div>

                                            <div className="grid gap-4">
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        Interview Result
                                                    </label>

                                                    <select
                                                        value={result[interview._id] || ""}
                                                        onChange={(e) =>
                                                            setResult({
                                                                ...result,
                                                                [interview._id]: e.target.value,
                                                            })
                                                        }
                                                        className="w-full rounded-xl border border-violet-200 bg-white p-3 text-sm text-gray-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-violet-800 dark:bg-[#1C1830] dark:text-white dark:focus:ring-violet-900/40"
                                                    >
                                                        <option value="">Select Result</option>
                                                        <option value="cleared">Cleared</option>
                                                        <option value="not_cleared">Not Cleared</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        Candidate Feedback
                                                    </label>

                                                    <textarea
                                                        rows="4"
                                                        placeholder="Enter candidate feedback..."
                                                        value={feedback[interview._id] || ""}
                                                        onChange={(e) =>
                                                            setFeedback({
                                                                ...feedback,
                                                                [interview._id]: e.target.value,
                                                            })
                                                        }
                                                        className="w-full resize-y rounded-xl border border-violet-200 bg-white p-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-violet-800 dark:bg-[#1C1830] dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-violet-900/40"
                                                    />
                                                </div>

                                                <div>
                                                    <button
                                                        onClick={() => updateResult(interview._id)}
                                                        disabled={updatingId === interview._id}
                                                        className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-none"
                                                    >
                                                        {updatingId === interview._id
                                                            ? "Submitting..."
                                                            : "Submit Result →"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* FINAL RESULT */
                                        <div className="border-t border-violet-100 bg-violet-50/40 px-5 py-6 dark:border-violet-900/40 dark:bg-[#171327]/60 sm:px-7">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                        Final Result
                                                    </p>

                                                    <p className="mt-2 text-lg font-extrabold capitalize text-gray-900 dark:text-white">
                                                        {interview.status?.replace("_", " ")}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${getStatusStyle(
                                                        interview.status
                                                    )}`}
                                                >
                                                    {interview.status?.replace("_", " ")}
                                                </span>
                                            </div>

                                            <div className="mt-4 rounded-2xl bg-white p-4 dark:bg-[#1C1830]">
                                                <p className="text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                                                    Feedback
                                                </p>

                                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">
                                                    {interview.feedback || "No feedback provided"}
                                                </p>
                                            </div>
                                        </div>
                                    )}
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
        </div>
    );
}

export default ManageInterviews;
