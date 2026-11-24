import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

function UserProfile() {
  const navigate = useNavigate();

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    About: "",
    address: "",
    skillsInput: "",
    qualificationInput: "",
    experience: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`${API_BASE}/user-profile/getone`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.profile) {
          const prof = res.data.profile;
          setFormData({
            About: prof.About || "",
            address: prof.address || "",
            skillsInput: Array.isArray(prof.skills) ? prof.skills.join(", ") : "",
            qualificationInput: Array.isArray(prof.qualification) ? prof.qualification.join(", ") : "",
            experience: Array.isArray(prof.experience)
              ? prof.experience.map((exp) => ({
                  companyName: exp.companyName || "",
                  from: exp.from ? new Date(exp.from).toISOString().split("T")[0] : "",
                  to: exp.to ? new Date(exp.to).toISOString().split("T")[0] : "",
                }))
              : [],
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { companyName: "", from: "", to: "" },
      ],
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.experience];
      updated[index][field] = value;
      return { ...prev, experience: updated };
    });
  };

  const handleRemoveExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const skillsArray = formData.skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const qualificationArray = formData.qualificationInput
        .split(",")
        .map((q) => q.trim())
        .filter(Boolean);

      const payload = {
        About: formData.About,
        address: formData.address,
        skills: skillsArray,
        qualification: qualificationArray,
        experience: formData.experience.filter((exp) => exp.companyName.trim()),
      };

      const res = await axios.put(`${API_BASE}/user-profile/update`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message || "Profile saved successfully!");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Save profile error:", err);
      setError(err.response?.data?.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F6FF] dark:bg-[#100D1D] dark:text-white">
        <div className="flex items-center gap-3 font-semibold text-violet-600">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          Loading your profile...
        </div>
      </div>
    );
  }

  const parsedSkills = formData.skillsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const calculateCompletion = () => {
    let score = 0;
    if (user.name) score += 20;
    if (formData.About?.trim()) score += 20;
    if (formData.address?.trim()) score += 20;
    if (parsedSkills.length > 0) score += 20;
    if (formData.qualificationInput?.trim() || formData.experience?.length > 0) score += 20;
    return score;
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-[#211B35] transition-colors duration-300 dark:bg-[#100D1D] dark:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-violet-100 bg-white/85 px-6 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#171327]/90 md:px-12">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div
            onClick={() => navigate("/user/dashboard")}
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 font-extrabold text-white">
              J
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Job<span className="text-violet-600 dark:text-violet-400">Nest</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => navigate("/user/dashboard")}
              className="rounded-xl border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 dark:border-violet-400/30 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-10 md:py-12">
        {/* User Card Header */}
        <section className="mb-8 rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-8 text-white shadow-xl shadow-violet-500/15">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-extrabold uppercase shadow-inner backdrop-blur-sm">
              {user.name?.charAt(0) || "U"}
            </div>
            <div className="text-center sm:text-left">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                Job Seeker Profile
              </span>
              <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">
                {user.name || "Candidate Name"}
              </h2>
              <p className="text-sm text-violet-100">
                {user.email} {user.phoneNumber ? `• ${user.phoneNumber}` : ""}
              </p>

              {/* Profile Strength Progress Bar */}
              <div className="mt-4 max-w-xs">
                <div className="flex justify-between text-xs font-semibold text-purple-100">
                  <span>Profile Strength</span>
                  <span className="font-bold text-white">{completionPercentage}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500 shadow-sm"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Messages */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
            <span>✅</span> {message}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* About & Address */}
          <div className="rounded-3xl border border-violet-100 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#1C1830] md:p-8">
            <h3 className="mb-5 text-lg font-bold">1. Personal Summary & Location</h3>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  About Me / Bio
                </label>
                <textarea
                  name="About"
                  rows={4}
                  value={formData.About}
                  onChange={handleChange}
                  placeholder="Introduce yourself, your key strengths, and what kind of roles you are seeking..."
                  className="w-full rounded-2xl border border-violet-100 bg-[#F8F6FF] p-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#171327] dark:focus:ring-violet-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Current Address / City
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore, Karnataka, India"
                  className="w-full rounded-xl border border-violet-100 bg-[#F8F6FF] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#171327] dark:focus:ring-violet-500/10"
                />
              </div>
            </div>
          </div>

          {/* Skills & Qualifications */}
          <div className="rounded-3xl border border-violet-100 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#1C1830] md:p-8">
            <h3 className="mb-5 text-lg font-bold">2. Skills & Education</h3>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Technical & Soft Skills (Comma separated)
                </label>
                <input
                  type="text"
                  name="skillsInput"
                  value={formData.skillsInput}
                  onChange={handleChange}
                  placeholder="e.g. React.js, Node.js, Express, MongoDB, JavaScript, Git"
                  className="w-full rounded-xl border border-violet-100 bg-[#F8F6FF] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#171327] dark:focus:ring-violet-500/10"
                />
                {parsedSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {parsedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Qualifications & Degrees (Comma separated)
                </label>
                <input
                  type="text"
                  name="qualificationInput"
                  value={formData.qualificationInput}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech Computer Science, MCA, Full Stack Web Development Certification"
                  className="w-full rounded-xl border border-violet-100 bg-[#F8F6FF] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#171327] dark:focus:ring-violet-500/10"
                />
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="rounded-3xl border border-violet-100 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#1C1830] md:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">3. Work Experience</h3>
              <button
                type="button"
                onClick={handleAddExperience}
                className="rounded-xl bg-violet-100 px-4 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/30"
              >
                + Add Experience
              </button>
            </div>

            {formData.experience.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-violet-200 p-6 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                No work experience added yet. Click &quot;+ Add Experience&quot; to include your previous or current jobs.
              </p>
            ) : (
              <div className="space-y-5">
                {formData.experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-2xl border border-violet-100 bg-[#F8F6FF] p-5 dark:border-white/10 dark:bg-[#171327]"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="absolute right-4 top-4 text-xs font-bold text-red-500 hover:text-red-700"
                    >
                      ✕ Remove
                    </button>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={(e) =>
                            handleExperienceChange(idx, "companyName", e.target.value)
                          }
                          placeholder="e.g. Infosys, TCS, Freelance"
                          className="w-full rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-[#1C1830]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={exp.from}
                          onChange={(e) =>
                            handleExperienceChange(idx, "from", e.target.value)
                          }
                          className="w-full rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-[#1C1830]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                          To Date (Leave blank if current)
                        </label>
                        <input
                          type="date"
                          value={exp.to}
                          onChange={(e) =>
                            handleExperienceChange(idx, "to", e.target.value)
                          }
                          className="w-full rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-[#1C1830]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/user/dashboard")}
              className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold transition hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-violet-300 disabled:opacity-50 dark:shadow-none"
            >
              {saving ? "Saving Profile..." : "Save Profile to Database"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default UserProfile;
