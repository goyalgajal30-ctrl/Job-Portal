import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "./apiConfig";

function UserSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter a valid email address");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phoneNumber.trim())) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_BASE}/auth/signup`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
      });

      alert(response.data.message || "Account created successfully!");

      if (response.data.token && response.data.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", response.data.user.role || "user");
        navigate("/user/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full min-w-0 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-gray-500";

  const fieldClass =
    "flex items-center rounded-xl border border-[#35416b] bg-[#111a3b] px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-300";

  return (
    <div className="min-h-screen bg-[#070B1C] flex items-center justify-center p-4 sm:p-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#53649c] bg-[#090e29] shadow-[0_20px_80px_rgba(30,50,180,0.25)] lg:grid-cols-[0.85fr_1.15fr]">
        {/* LEFT PANEL */}
        <aside className="relative hidden min-h-full overflow-hidden bg-gradient-to-br from-[#2865f5] via-[#294bd5] to-[#6069ec] p-10 text-white lg:flex lg:flex-col xl:p-12">
          {/* Background Effects */}
          <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full border border-white/20" />
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border border-white/20" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/10 blur-2xl" />

          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl font-black text-[#2855df] shadow-lg">
              J
            </div>

            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                JobNest<span className="text-[#a9d7ff]">.</span>
              </h2>
              <p className="text-[11px] font-medium tracking-wide text-blue-100">
                CONNECT · GROW · SUCCEED
              </p>
            </div>
          </div>

          {/* Welcome Content */}
          <div className="relative mt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-green-300" />
              FOR JOB SEEKERS
            </span>

            <h1 className="mt-8 text-5xl font-extrabold leading-[1.12] xl:text-6xl">
              Start your
              <br />
              career journey<span className="text-[#a9d7ff]">.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-blue-100">
              Create your candidate profile, explore thousands of vacancies,
              and connect with employers looking for your unique skills.
            </p>
          </div>

          {/* Benefits */}
          <div className="relative mt-10 space-y-5">
            {[
              "Apply to verified job vacancies with 1 click",
              "Track your application status and interview schedules",
              "Connect directly with hiring companies",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm">
                  ✓
                </div>
                <p className="text-sm font-semibold text-white">{item}</p>
              </div>
            ))}
          </div>

          {/* Bottom Card */}
          <div className="relative mt-auto rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl">
                🚀
              </div>

              <div>
                <h3 className="font-bold">Your next opportunity awaits.</h3>
                <p className="mt-1 text-xs text-blue-100">
                  Join thousands of candidates finding jobs on JobNest.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="relative min-w-0 bg-[#090e29] px-6 py-12 sm:px-10 lg:px-12">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-[#35416b] bg-[#192144] text-2xl text-gray-300 transition hover:bg-[#26345f] hover:text-white"
            aria-label="Go to home"
          >
            ×
          </button>

          <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                JOB SEEKER ACCOUNT
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Create an account
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Sign up as a job seeker and find your next opportunity.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className={labelClass}>Full Name *</label>
                <div className={fieldClass}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email Address *</label>
                <div className={fieldClass}>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={labelClass}>Phone Number *</label>
                <div className={fieldClass}>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="10-digit mobile number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>Password *</label>
                <div className={fieldClass}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className={labelClass}>Confirm Password *</label>
                <div className={fieldClass}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#2169f5] to-[#3855e9] px-5 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:from-[#1c5ee0] hover:to-[#3049d5] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                  {!loading && <span className="text-lg">→</span>}
                </button>
              </div>

              {/* Links */}
              <div className="pt-4 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-blue-400 transition hover:text-blue-300"
                  >
                    Sign in
                  </Link>
                </p>

                <p className="mt-3 text-xs text-gray-500">
                  Looking to hire?{" "}
                  <Link
                    to="/company-signup"
                    className="font-semibold text-blue-400 hover:underline"
                  >
                    Register as Company
                  </Link>
                </p>
              </div>

              <p className="pt-4 text-center text-xs text-gray-500">
                © 2026 JobNest. All rights reserved.
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserSignup;
