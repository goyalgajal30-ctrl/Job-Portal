import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

const API = `${API_BASE}/job`;

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState({
    title: "",
    description: "",
    requirements: "",
    skills: "",
    qualification: "",
    experience: "",
    salary: {
      min: "",
      max: "",
    },
    jobType: "Full-time",
    location: "",
    vacancies: 1,
    lastDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Get Existing Job Details
  useEffect(() => {
    const getJob = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const jobData = res.data.job;

        setJob({
          title: jobData.title || "",
          description: jobData.description || "",
          requirements: Array.isArray(jobData.requirements)
            ? jobData.requirements.join(", ")
            : jobData.requirements || "",
          skills: Array.isArray(jobData.skills)
            ? jobData.skills.join(", ")
            : jobData.skills || "",
          qualification: jobData.qualification || "",
          experience: jobData.experience || "",
          salary: {
            min: jobData.salary?.min || "",
            max: jobData.salary?.max || "",
          },
          jobType: jobData.jobType || "Full-time",
          location: jobData.location || "",
          vacancies: jobData.vacancies || 1,
          lastDate: jobData.lastDate
            ? jobData.lastDate.slice(0, 10)
            : "",
        });
      } catch (error) {
        console.log(error);
        alert(error.response?.data?.message || "Job fetching failed");
      } finally {
        setLoading(false);
      }
    };

    getJob();
  }, [id]);

  // Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "min" || name === "max") {
      setJob({
        ...job,
        salary: {
          ...job.salary,
          [name]: value,
        },
      });
    } else {
      setJob({
        ...job,
        [name]: value,
      });
    }
  };

  // Update Job
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(job.salary.min) > Number(job.salary.max)) {
      alert("Minimum salary cannot be greater than maximum salary");
      return;
    }

    if (Number(job.vacancies) < 1) {
      alert("Number of vacancies must be at least 1");
      return;
    }

    try {
      setUpdating(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const jobData = {
        ...job,
        skills: job.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        requirements: job.requirements
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        salary: {
          min: Number(job.salary.min),
          max: Number(job.salary.max),
        },
        vacancies: Number(job.vacancies),
      };

      const res = await axios.put(
        `${API}/update/${id}`,
        jobData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message || "Job updated successfully");
      navigate("/company/manage-jobs");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Job update failed");
    } finally {
      setUpdating(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-violet-100 bg-[#FAF9FF] px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#171327] dark:text-white dark:focus:border-violet-400 dark:focus:bg-[#211B35] dark:focus:ring-violet-500/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#302747] dark:text-gray-200";

  const sectionClass =
    "rounded-2xl border border-violet-100 bg-[#FCFBFF] p-5 md:p-6 dark:border-white/10 dark:bg-[#171327]/70";

  // Loading Screen
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

        {/* Main Card */}
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
                Edit Job Details
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-purple-100">
                Update your vacancy information and keep your job listing accurate.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 p-5 md:p-10">

            {/* Job Information */}
            <section className={sectionClass}>
              <div className="mb-5">
                <h3 className="text-lg font-extrabold text-[#211B35] dark:text-white">
                  Job Information
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Update the basic information about this vacancy.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Job Title</label>
                  <input
                    name="title"
                    placeholder="Job Title"
                    value={job.title}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Job Description</label>
                  <textarea
                    name="description"
                    placeholder="Job Description"
                    value={job.description}
                    onChange={handleChange}
                    rows="5"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Skills</label>
                  <input
                    name="skills"
                    placeholder="Skills (React, Node, MongoDB)"
                    value={job.skills}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Separate multiple skills with commas.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Requirements</label>
                  <input
                    name="requirements"
                    placeholder="Good communication, Problem solving"
                    value={job.requirements}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Separate multiple requirements with commas.
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
                  Update qualification and experience details.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Qualification</label>
                  <input
                    name="qualification"
                    placeholder="Qualification"
                    value={job.qualification}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Experience</label>
                  <input
                    name="experience"
                    placeholder="Experience"
                    value={job.experience}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Salary Details */}
            <section className={sectionClass}>
              <div className="mb-5">
                <h3 className="text-lg font-extrabold text-[#211B35] dark:text-white">
                  Salary & Employment
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Update salary range and employment type.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Minimum Salary (₹)</label>
                  <input
                    type="number"
                    name="min"
                    placeholder="Minimum Salary"
                    value={job.salary.min}
                    onChange={handleChange}
                    min="0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Maximum Salary (₹)</label>
                  <input
                    type="number"
                    name="max"
                    placeholder="Maximum Salary"
                    value={job.salary.max}
                    onChange={handleChange}
                    min="0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Job Type</label>
                  <select
                    name="jobType"
                    value={job.jobType}
                    onChange={handleChange}
                    className={inputClass}
                  >
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
                    placeholder="Job Location"
                    value={job.location}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Number of Vacancies</label>
                  <input
                    type="number"
                    name="vacancies"
                    placeholder="Vacancies"
                    value={job.vacancies}
                    onChange={handleChange}
                    min="1"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Last Date to Apply</label>
                  <input
                    type="date"
                    name="lastDate"
                    value={job.lastDate}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-5 dark:border-white/10 dark:bg-violet-500/5">
              <p className="text-sm font-semibold text-[#302747] dark:text-gray-200">
                Ready to save your changes?
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Review the updated job information before submitting.
              </p>

              <button
                type="submit"
                disabled={updating}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-4 font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {updating ? "Updating..." : "Update Job →"}
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
};

export default EditJob;
