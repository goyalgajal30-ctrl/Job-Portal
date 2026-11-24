
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

const API = `${API_BASE}/interview`;

function MyInterviews() {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInterviews = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `${API}/my-interviews`,
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

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "cleared":
            case "selected":
                return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";

            case "not_cleared":
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
            <nav className="sticky top-0 z-40 border-b border-violet-100 bg-white/85 px-5 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#171327]/90 md:px-10">
                <div className="mx-auto flex max-w-6xl items-center justify-between">

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
                            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-violet-300 dark:shadow-none"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">

                {/* Heading */}
                <div className="mb-8">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-bold tracking-wider text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
                        <span className="h-2 w-2 rounded-full bg-fuchsia-500"></span>
                        INTERVIEW TRACKER
                    </div>

                    <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                        My <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">Interviews</span>
                    </h2>

                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                        Check your interview schedule, meeting details and results.
                    </p>
                </div>

                {/* Stats */}
                <div className="mb-8 grid gap-5 sm:grid-cols-2">

                    <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1830]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Total Interviews
                                </p>
                                <h3 className="mt-3 text-4xl font-extrabold text-violet-700 dark:text-violet-300">
                                    {interviews.length}
                                </h3>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl text-white shadow-lg shadow-violet-200 dark:shadow-none">
                                📅
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-fuchsia-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1C1830]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Pending Interviews
                                </p>
                                <h3 className="mt-3 text-4xl font-extrabold text-fuchsia-600 dark:text-fuchsia-300">
                                    {interviews.filter(
                                        (item) => item.status?.toLowerCase() === "pending"
                                    ).length}
                                </h3>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-2xl text-white shadow-lg shadow-fuchsia-200 dark:shadow-none">
                                ⏳
                            </div>
                        </div>
                    </div>

                </div>

                {/* Interview List Heading */}
                <div className="mb-5">
                    <h3 className="text-xl font-bold">Interview Schedule</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Your upcoming and completed interviews.
                    </p>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="rounded-2xl border border-violet-100 bg-white py-20 text-center dark:border-white/10 dark:bg-[#1C1830]">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-fuchsia-500"></div>
                        <p className="mt-4 font-medium text-gray-500 dark:text-gray-400">
                            Loading interviews...
                        </p>
                    </div>
                ) : interviews.length === 0 ? (

                    /* Empty State */
                    <div className="rounded-2xl border border-violet-100 bg-white px-5 py-16 text-center shadow-sm dark:border-white/10 dark:bg-[#1C1830]">
                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-4xl dark:bg-violet-500/10">
                            📅
                        </div>

                        <h2 className="text-xl font-bold">
                            No Interviews Scheduled
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                            Your interview schedules will appear here once a company
                            schedules one. Keep checking for updates.
                        </p>

                        <button
                            onClick={() => navigate("/jobs")}
                            className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 dark:shadow-none"
                        >
                            Explore Jobs →
                        </button>
                    </div>

                ) : (

                    /* Interview Cards */
                    <div className="grid gap-6">
                        {interviews.map((interview) => {
                            const application = interview.jobApplyId;
                            const job = application?.jobId;

                            const status = interview.status || "pending";

                            return (
                                <div
                                    key={interview._id}
                                    className="group overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100 dark:border-white/10 dark:bg-[#1C1830] dark:hover:border-violet-400/30 dark:hover:shadow-none"
                                >
                                    {/* Card Header */}
                                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50/60 p-6 dark:border-white/10 dark:from-violet-500/10 dark:to-fuchsia-500/5">

                                        <div className="flex gap-4">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl text-white shadow-md">
                                                💼
                                            </div>

                                            <div>
                                                <h2 className="text-xl font-bold transition group-hover:text-violet-700 dark:group-hover:text-violet-300">
                                                    {job?.title || interview.jobDescription || "Interview"}
                                                </h2>

                                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                    📍 {job?.location || "Location not available"}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${getStatusStyle(status)}`}
                                        >
                                            {status.replaceAll("_", " ")}
                                        </span>
                                    </div>

                                    <div className="p-6">

                                        {/* Interview Details */}
                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                            <div className="rounded-xl bg-[#F8F6FF] p-4 dark:bg-[#100D1D]">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                    Interview Date
                                                </p>
                                                <p className="mt-2 font-semibold">
                                                    📅 {formatDate(interview.interviewDate)}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-[#F8F6FF] p-4 dark:bg-[#100D1D]">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                    Interview Time
                                                </p>
                                                <p className="mt-2 font-semibold">
                                                    🕒 {interview.interviewTime || "N/A"}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-[#F8F6FF] p-4 dark:bg-[#100D1D]">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                    Interview Mode
                                                </p>
                                                <p className="mt-2 font-semibold capitalize">
                                                    {interview.interviewMode || "N/A"}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Google Meet */}
                                        {interview.interviewMode === "online" && interview.meetLink && (
                                            <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-400/20 dark:bg-violet-500/10">
                                                <p className="text-sm font-semibold text-violet-800 dark:text-violet-300">
                                                    Online Interview
                                                </p>

                                                <a
                                                    href={interview.meetLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-2 inline-flex items-center gap-2 break-all font-semibold text-violet-600 underline transition hover:text-fuchsia-600 dark:text-violet-300 dark:hover:text-fuchsia-300"
                                                >
                                                    Join Google Meet →
                                                </a>
                                            </div>
                                        )}

                                        {/* Job Description */}
                                        <div className="mt-6 border-t border-violet-100 pt-5 dark:border-white/10">
                                            <h3 className="mb-2 font-bold">
                                                Job Description
                                            </h3>

                                            <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                                                {interview.jobDescription || "No description available."}
                                            </p>
                                        </div>

                                        {/* Feedback */}
                                        <div className="mt-5 grid gap-4 sm:grid-cols-2">

                                            <div className="rounded-xl border border-violet-100 p-4 dark:border-white/10">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                    Interview Feedback
                                                </p>

                                                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                                                    {interview.feedback || "Feedback is pending"}
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-fuchsia-100 p-4 dark:border-white/10">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                    Feedback Status
                                                </p>

                                                <p className="mt-2 font-semibold capitalize text-fuchsia-600 dark:text-fuchsia-300">
                                                    {interview.feedbackStatus?.replaceAll("_", " ") || "Pending"}
                                                </p>
                                            </div>

                                        </div>

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

export default MyInterviews;
