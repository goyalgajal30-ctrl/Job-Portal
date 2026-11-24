import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

function CreateJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    skills: "",
    qualification: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    jobType: "",
    location: "",
    vacancies: 1,
    lastDate: "",
  });

  const [loading, setLoading] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAuthError = (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      navigate("/login");
      return true;
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.salaryMin) > Number(formData.salaryMax)) {
      alert("Minimum salary cannot be greater than maximum salary");
      return;
    }

    if (Number(formData.vacancies) < 1) {
      alert("Number of vacancies must be at least 1");
      return;
    }

    if (formData.lastDate < getTodayDate()) {
      alert("Last date cannot be in the past");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),

        requirements: formData.requirements
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        skills: formData.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        qualification: formData.qualification.trim(),
        experience: formData.experience.trim(),

        salary: {
          min: Number(formData.salaryMin),
          max: Number(formData.salaryMax),
        },

        jobType: formData.jobType,
        location: formData.location.trim(),
        vacancies: Number(formData.vacancies),
        lastDate: formData.lastDate,
      };

      const response = await axios.post(`${API_BASE}/job/create`, jobData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(response.data.message || "Job created successfully");
      navigate("/company/dashboard");
    } catch (error) {
      if (!handleAuthError(error)) {
        alert(error.response?.data?.message || "Job creation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-violet-100 bg-[#FAF9FF] px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#171327] dark:text-white dark:focus:border-violet-400 dark:focus:bg-[#211B35] dark:focus:ring-violet-500/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#302747] dark:text-gray-200";

  const sectionClass =
    "rounded-2xl border border-violet-100 bg-[#FCFBFF] p-5 md:p-6 dark:border-white/10 dark:bg-[#171327]/70";

  return (
    <div className="min-h-screen bg-[#F8F6FF] px-4 py-8 transition-colors duration-300 dark:bg-[#100D1D] sm:px-6 md:py-12">

      <div className="mx-auto max-w-4xl">

        {/* Top Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-violet-700 transition hover:text-fuchsia-600 dark:text-violet-400"
          >
            <span className="text-lg">←</span>
            Back
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 font-extrabold text-white">
              J
            </div>

            <span className="text-lg font-extrabold text-[#211B35] dark:text-white">
              JobNest<span className="text-fuchsia-500">.</span>
            </span>
          </div>

          <ThemeToggle />
        </div>

        {/* Main Form Card */}
        <div className="overflow-hidden rounded-[28px] border border-violet-100 bg-white shadow-xl shadow-violet-100/50 dark:border-white/10 dark:bg-[#1C1830] dark:shadow-black/20">

          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-600 px-6 py-9 text-white md:px-10">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[35px] border-white/10" />
            <div className="absolute -bottom-20 right-1/3 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl" />

            <div className="relative z-10">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold tracking-[2px] text-purple-100">
                COMPANY WORKSPACE
              </span>

              <h2 className="mt-6 text-3xl font-extrabold md:text-4xl">
                Post a New Vacancy
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-purple-100">
                Find the right talent for your organization. Add job details and publish your opportunity.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 p-5 md:p-10">

            {/* Basic Details */}
            <section className={sectionClass}>
              <div className="mb-5">
                <h3 className="text-lg font-extrabold text-[#211B35] dark:text-white">
                  Job Information
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Add the basic information about this vacancy.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Job Title</label>

                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="MERN Stack Developer"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Job Description</label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the job role, responsibilities and expectations..."
                    rows="5"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Requirements</label>

                  <input
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="Good communication, Problem solving"
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Separate multiple requirements with commas.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Required Skills</label>

                  <input
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, Node.js, MongoDB"
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Separate multiple skills with commas.
                  </p>
                </div>
              </div>
            </section>

            {/* Candidate Requirements */}
            <section className={sectionClass}>
              <div className="mb-5">
                <h3 className="text-lg font-extrabold text-[#211B35] dark:text-white">
                  Candidate Requirements
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Specify the qualification and experience required.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Qualification</label>

                  <input
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="BCA / B.Tech"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Experience</label>

                  <input
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Fresher / 2 Years"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Salary & Job Details */}
            <section className={sectionClass}>
              <div className="mb-5">
                <h3 className="text-lg font-extrabold text-[#211B35] dark:text-white">
                  Salary & Job Details
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Provide compensation and employment information.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Minimum Salary (₹)</label>

                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    placeholder="20000"
                    min="0"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Maximum Salary (₹)</label>

                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    placeholder="40000"
                    min="0"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Job Type</label>

                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select Job Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Location</label>

                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Jaipur, Rajasthan"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Number of Vacancies</label>

                  <input
                    type="number"
                    name="vacancies"
                    value={formData.vacancies}
                    onChange={handleChange}
                    min="1"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Last Date to Apply</label>

                  <input
                    type="date"
                    name="lastDate"
                    value={formData.lastDate}
                    onChange={handleChange}
                    min={getTodayDate()}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-5 dark:border-white/10 dark:bg-violet-500/5">
              <p className="text-sm font-semibold text-[#302747] dark:text-gray-200">
                Ready to publish your vacancy?
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Please review all the details before publishing your job.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-4 font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Publishing..." : "Publish Job →"}
              </button>
            </div>

          </form>
        </div>

        <footer className="py-6 text-center text-xs text-gray-400 dark:text-gray-600">
          © 2026 JobNest. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default CreateJob;
