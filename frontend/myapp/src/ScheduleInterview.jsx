
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

const API = `${API_BASE}/interview`;

function ScheduleInterview() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const jobApplyId = state?.jobApplyId;

    const [formData, setFormData] = useState({
        interviewDate: "",
        interviewTime: "",
        jobDescription: state?.jobTitle || "",
        interviewMode: "online",
        meetLink: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!jobApplyId) {
            alert("Application ID not found");
            return;
        }

        if (formData.interviewMode === "online" && !formData.meetLink.trim()) {
            alert("Please enter Google Meet link");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.post(
                `${API}/schedule`,
                {
                    jobApplyId,
                    interviewDate: formData.interviewDate,
                    interviewTime: formData.interviewTime,
                    jobDescription: formData.jobDescription,
                    interviewMode: formData.interviewMode,
                    meetLink:
                        formData.interviewMode === "online" ? formData.meetLink : "",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert(response.data.message || "Interview scheduled successfully");

            navigate("/company/manage-interviews");
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Failed to schedule interview");
        } finally {
            setLoading(false);
        }
    };

    // Missing Application
    if (!jobApplyId) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F6FF] px-5 text-center text-gray-800 dark:bg-[#100D1D] dark:text-white">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-4xl dark:bg-violet-500/10">
                    📋
                </div>

                <h2 className="text-2xl font-bold">
                    Application Details Not Found
                </h2>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Please select an applicant before scheduling an interview.
                </p>

                <button
                    onClick={() => navigate("/company/manage-applicants")}
                    className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 dark:shadow-none"
                >
                    ← Back to Applicants
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F6FF] text-gray-800 dark:bg-[#100D1D] dark:text-white">

            {/* Navbar */}
            <nav className="sticky top-0 z-40 border-b border-violet-100 bg-white/85 px-5 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#171327]/90">
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
                            onClick={() => navigate("/company/manage-applicants")}
                            className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 dark:border-violet-400/30 dark:text-violet-300 dark:hover:bg-violet-500/10"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">

                {/* Page Heading */}
                <div className="mb-8">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-bold tracking-wider text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
                        <span className="h-2 w-2 rounded-full bg-fuchsia-500"></span>
                        COMPANY PANEL
                    </div>

                    <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                        Schedule <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">Interview</span>
                    </h2>

                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                        Set up an interview and share the details with your candidate.
                    </p>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">

                    {/* Main Form */}
                    <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm dark:border-white/10 dark:bg-[#1C1830]">

                        {/* Form Header */}
                        <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50/60 p-6 dark:border-white/10 dark:from-violet-500/10 dark:to-fuchsia-500/5">
                            <h3 className="text-xl font-bold">
                                Interview Details
                            </h3>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Fill in the information below to schedule an interview.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 p-6">

                            {/* Candidate Details */}
                            <div className="rounded-2xl border border-violet-100 bg-[#F8F6FF] p-5 dark:border-white/10 dark:bg-[#100D1D]">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                                    Selected Candidate
                                </p>

                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-bold text-white">
                                        {(state?.applicantName || "C").charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <h4 className="font-bold">
                                            {state?.applicantName || "Candidate"}
                                        </h4>

                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            {state?.jobTitle || "Job"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Date and Time */}
                            <div className="grid gap-5 sm:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Interview Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="interviewDate"
                                        value={formData.interviewDate}
                                        onChange={handleChange}
                                        min={new Date().toLocaleDateString("en-CA")}
                                        required
                                        className="w-full rounded-xl border border-violet-100 bg-[#F8F6FF] p-3.5 text-gray-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#100D1D] dark:text-white dark:focus:ring-violet-500/10"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Interview Time *
                                    </label>

                                    <input
                                        type="text"
                                        name="interviewTime"
                                        value={formData.interviewTime}
                                        onChange={handleChange}
                                        placeholder="Example: 11:00 AM"
                                        required
                                        className="w-full rounded-xl border border-violet-100 bg-[#F8F6FF] p-3.5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#100D1D] dark:text-white dark:focus:ring-violet-500/10"
                                    />
                                </div>

                            </div>

                            {/* Job Description */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Job Description *
                                </label>

                                <textarea
                                    name="jobDescription"
                                    value={formData.jobDescription}
                                    onChange={handleChange}
                                    rows="4"
                                    required
                                    placeholder="Enter interview details..."
                                    className="w-full resize-y rounded-xl border border-violet-100 bg-[#F8F6FF] p-3.5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#100D1D] dark:text-white dark:focus:ring-violet-500/10"
                                />
                            </div>

                            {/* Interview Mode */}
                            <div>
                                <label className="mb-3 block text-sm font-semibold">
                                    Interview Mode *
                                </label>

                                <div className="grid grid-cols-2 gap-4">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                interviewMode: "online",
                                            }))
                                        }
                                        className={`rounded-xl border p-4 text-left transition ${formData.interviewMode === "online"
                                                ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100 dark:border-violet-400 dark:bg-violet-500/10 dark:ring-violet-500/10"
                                                : "border-violet-100 bg-white hover:bg-violet-50 dark:border-white/10 dark:bg-[#100D1D] dark:hover:bg-white/5"
                                            }`}
                                    >
                                        <span className="text-2xl">💻</span>

                                        <p className="mt-2 font-bold">Online</p>

                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Google Meet
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                interviewMode: "offline",
                                                meetLink: "",
                                            }))
                                        }
                                        className={`rounded-xl border p-4 text-left transition ${formData.interviewMode === "offline"
                                                ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100 dark:border-violet-400 dark:bg-violet-500/10 dark:ring-violet-500/10"
                                                : "border-violet-100 bg-white hover:bg-violet-50 dark:border-white/10 dark:bg-[#100D1D] dark:hover:bg-white/5"
                                            }`}
                                    >
                                        <span className="text-2xl">🏢</span>

                                        <p className="mt-2 font-bold">Offline</p>

                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            In-person meeting
                                        </p>
                                    </button>

                                </div>
                            </div>

                            {/* Google Meet Link */}
                            {formData.interviewMode === "online" && (
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Google Meet Link *
                                    </label>

                                    <input
                                        type="url"
                                        name="meetLink"
                                        value={formData.meetLink}
                                        onChange={handleChange}
                                        required
                                        placeholder="https://meet.google.com/..."
                                        className="w-full rounded-xl border border-violet-100 bg-[#F8F6FF] p-3.5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#100D1D] dark:text-white dark:focus:ring-violet-500/10"
                                    />

                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Share a valid Google Meet link with the candidate.
                                    </p>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="border-t border-violet-100 pt-5 dark:border-white/10">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3.5 font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-violet-300 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
                                >
                                    {loading ? (
                                        <>
                                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                                            Scheduling...
                                        </>
                                    ) : (
                                        "Schedule Interview →"
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-5">

                        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1C1830]">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl dark:bg-violet-500/10">
                                📅
                            </div>

                            <h3 className="font-bold">Scheduling Tips</h3>

                            <ul className="mt-4 space-y-4 text-sm text-gray-600 dark:text-gray-300">
                                <li className="flex gap-3">
                                    <span className="font-bold text-violet-600">01.</span>
                                    Choose a convenient date and time.
                                </li>

                                <li className="flex gap-3">
                                    <span className="font-bold text-violet-600">02.</span>
                                    Verify your Google Meet link before scheduling.
                                </li>

                                <li className="flex gap-3">
                                    <span className="font-bold text-violet-600">03.</span>
                                    Provide clear interview details.
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-fuchsia-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 dark:border-white/10 dark:from-violet-500/10 dark:to-fuchsia-500/10">
                            <div className="mb-3 text-2xl">✨</div>

                            <h3 className="font-bold">Make a Great First Impression</h3>

                            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                A clear interview schedule helps candidates prepare and
                                creates a better hiring experience.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-12 border-t border-violet-100 py-6 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                    © 2026 <span className="font-bold text-violet-600 dark:text-violet-400">JobNest</span>. All rights reserved.
                </footer>

            </main>
        </div>
    );
}

export default ScheduleInterview;
