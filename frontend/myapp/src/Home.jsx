
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Home() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const categories = [
    { icon: "💻", name: "Development", jobs: "1,200+ Jobs" },
    { icon: "🎨", name: "Design", jobs: "850+ Jobs" },
    { icon: "📊", name: "Marketing", jobs: "640+ Jobs" },
    { icon: "📱", name: "Technology", jobs: "920+ Jobs" },
    { icon: "💼", name: "Business", jobs: "540+ Jobs" },
    { icon: "📈", name: "Finance", jobs: "430+ Jobs" },
    { icon: "✍️", name: "Content Writing", jobs: "320+ Jobs" },
    { icon: "🎧", name: "Customer Support", jobs: "280+ Jobs" },
  ];

  const featuredJobs = [
    {
      id: 1,
      company: "Google",
      role: "Frontend Developer",
      type: "Full Time",
      location: "Bangalore, India",
      salary: "₹8L - ₹14L",
      category: "Development",
      logo: "G",
      color: "bg-blue-100 text-blue-600",
      tags: ["React", "JavaScript", "CSS"],
      featured: true,
    },
    {
      id: 2,
      company: "Microsoft",
      role: "React Developer",
      type: "Remote",
      location: "Remote, India",
      salary: "₹6L - ₹12L",
      category: "Development",
      logo: "M",
      color: "bg-sky-100 text-sky-600",
      tags: ["React", "Redux", "API"],
      featured: false,
    },
    {
      id: 3,
      company: "Amazon",
      role: "UI/UX Designer",
      type: "Full Time",
      location: "Hyderabad, India",
      salary: "₹5L - ₹9L",
      category: "Design",
      logo: "a",
      color: "bg-orange-100 text-orange-600",
      tags: ["Figma", "UI Design", "UX"],
      featured: false,
    },
  ];

  const companies = [
    { name: "Google", logo: "G", color: "text-blue-600" },
    { name: "Microsoft", logo: "M", color: "text-sky-600" },
    { name: "Amazon", logo: "a", color: "text-orange-500" },
    { name: "Adobe", logo: "A", color: "text-red-500" },
    { name: "Meta", logo: "∞", color: "text-blue-500" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (location.trim()) params.set("location", location.trim());

    navigate(`/jobs?${params.toString()}`);
  };

  const handlePopularSearch = (value) => {
    navigate(`/jobs?search=${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#F8F6FF] text-[#211B35] transition-colors duration-300 dark:bg-[#100D1D] dark:text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-purple-100/70 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#171327]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xl font-bold text-white shadow-lg shadow-purple-300/40">
              J
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Job<span className="text-violet-600 dark:text-violet-400">Nest</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-gray-600 md:flex dark:text-gray-300">
            <Link to="/" className="text-violet-600 dark:text-violet-400">Home</Link>
            <Link to="/jobs" className="transition hover:text-violet-600">Find Jobs</Link>
            <a href="#categories" className="transition hover:text-violet-600">Categories</a>
            <a href="#companies" className="transition hover:text-violet-600">Companies</a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-purple-50 dark:hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              to="/user-signup"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-300/30 transition hover:-translate-y-0.5 hover:shadow-purple-400/40"
            >
              Sign Up
            </Link>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg border border-purple-100 p-2 text-xl dark:border-white/10"
              aria-label="Toggle menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-purple-100 bg-white px-5 py-5 dark:border-white/10 dark:bg-[#171327] md:hidden">
            <div className="flex flex-col gap-4 text-sm font-semibold">
              <Link onClick={() => setMenuOpen(false)} to="/">Home</Link>
              <Link onClick={() => setMenuOpen(false)} to="/jobs">Find Jobs</Link>
              <a onClick={() => setMenuOpen(false)} href="#categories">Categories</a>
              <a onClick={() => setMenuOpen(false)} href="#companies">Companies</a>
              <Link onClick={() => setMenuOpen(false)} to="/login">Login</Link>
              <Link
                onClick={() => setMenuOpen(false)}
                to="/user-signup"
                className="rounded-xl bg-violet-600 px-4 py-3 text-center text-white"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-700/20" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-fuchsia-300/25 blur-3xl dark:bg-fuchsia-700/20" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-xs font-bold text-violet-700 shadow-sm dark:border-violet-400/20 dark:bg-white/5 dark:text-violet-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              YOUR NEXT OPPORTUNITY STARTS HERE
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
              Find a job that
              <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                fits your future.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-gray-600 sm:text-lg dark:text-gray-400">
              Discover opportunities, connect with top companies and take the
              next step in your career. Your dream job is closer than you think.
            </p>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="mt-9 flex flex-col gap-3 rounded-2xl border border-purple-100 bg-white p-3 shadow-xl shadow-purple-200/30 sm:flex-row dark:border-white/10 dark:bg-[#1C1830] dark:shadow-black/20"
            >
              <div className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2">
                <span className="text-xl">⌕</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title or keyword"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="hidden w-px bg-purple-100 sm:block dark:bg-white/10" />

              <div className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2">
                <span className="text-lg">⌖</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or remote"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-purple-300/40 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Search Jobs →
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold text-gray-500 dark:text-gray-400">
                Popular:
              </span>
              {["React Developer", "Designer", "Remote", "Marketing"].map((item) => (
                <button
                  key={item}
                  onClick={() => handlePopularSearch(item)}
                  className="rounded-full border border-purple-100 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-violet-500/20 dark:hover:text-violet-300"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Dashboard Illustration */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-violet-400/30 to-fuchsia-400/30 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white bg-white/80 p-5 shadow-2xl shadow-purple-300/30 backdrop-blur-xl dark:border-white/10 dark:bg-[#1C1830] dark:shadow-black/30 sm:p-7">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400">YOUR CAREER DASHBOARD</p>
                  <h3 className="mt-1 text-xl font-extrabold">Welcome back! 👋</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl text-white">
                  ✨
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 p-5 text-white">
                <p className="text-sm text-purple-100">Your job search progress</p>
                <div className="mt-2 flex items-end justify-between">
                  <h2 className="text-4xl font-black">75%</h2>
                  <span className="rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold">
                    Almost there!
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
                  <div className="h-full w-3/4 rounded-full bg-white" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-purple-50 p-4 dark:bg-white/5">
                  <span className="text-2xl">💼</span>
                  <h3 className="mt-3 text-2xl font-extrabold">120+</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Jobs matched</p>
                </div>
                <div className="rounded-2xl bg-fuchsia-50 p-4 dark:bg-white/5">
                  <span className="text-2xl">📩</span>
                  <h3 className="mt-3 text-2xl font-extrabold">18</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Applications</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold">Recommended for you</h3>
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">View all</span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-purple-100 p-3 dark:border-white/10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-600">
                    G
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">Frontend Developer</h4>
                    <p className="text-xs text-gray-500">Google · Bangalore</p>
                  </div>
                  <span className="text-xs font-bold text-green-600">New</span>
                </div>
              </div>
            </div>

            <div className="absolute -left-5 top-28 hidden rounded-2xl border border-purple-100 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#27203D] sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-xl">✓</span>
                <div>
                  <p className="text-xs font-bold">Profile viewed</p>
                  <p className="text-[10px] text-gray-500">By a recruiter</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-24 hidden rounded-2xl border border-purple-100 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#27203D] sm:block">
              <p className="text-xs font-bold">🎉 New opportunity!</p>
              <p className="mt-1 text-[10px] text-gray-500">A company viewed your profile</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-purple-100 bg-white/70 py-10 dark:border-white/10 dark:bg-[#171327]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 text-center md:grid-cols-4 lg:px-8">
          {[
            ["10K+", "Active Jobs"],
            ["5K+", "Companies"],
            ["25K+", "Job Seekers"],
            ["8K+", "Successful Hires"],
          ].map(([number, label]) => (
            <div key={label}>
              <h2 className="text-3xl font-black text-violet-600 dark:text-violet-400 sm:text-4xl">
                {number}
              </h2>
              <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="px-5 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                Explore opportunities
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Browse by category
              </h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400">
                Find the right role in your favourite industry.
              </p>
            </div>
            <Link to="/jobs" className="text-sm font-bold text-violet-600 hover:text-fuchsia-600 dark:text-violet-400">
              Explore all jobs →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/jobs?category=${encodeURIComponent(category.name)}`}
                className="group rounded-2xl border border-purple-100 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-purple-200/30 dark:border-white/10 dark:bg-[#1C1830] dark:hover:border-violet-400/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-2xl transition group-hover:scale-110 dark:from-violet-500/20 dark:to-fuchsia-500/20">
                    {category.icon}
                  </div>
                  <span className="text-xl text-gray-300 transition group-hover:translate-x-1 group-hover:text-violet-600">→</span>
                </div>
                <h3 className="mt-5 font-bold">{category.name}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{category.jobs}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="bg-gradient-to-b from-[#F0EAFF] to-[#F8F6FF] px-5 py-20 dark:from-[#19132B] dark:to-[#100D1D] lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                Handpicked for you
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Featured jobs</h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400">
                Explore opportunities from companies you may love.
              </p>
            </div>
            <Link to="/jobs" className="text-sm font-bold text-violet-600 hover:text-fuchsia-600 dark:text-violet-400">
              View all jobs →
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="group rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-200/40 dark:border-white/10 dark:bg-[#1C1830] dark:hover:shadow-black/30"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black ${job.color}`}>
                    {job.logo}
                  </div>
                  {job.featured && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                <p className="mt-6 text-sm font-semibold text-violet-600 dark:text-violet-400">
                  {job.company}
                </p>
                <h3 className="mt-1 text-xl font-extrabold transition group-hover:text-violet-600 dark:group-hover:text-violet-400">
                  {job.role}
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span key={tag} className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 dark:bg-white/5 dark:text-purple-300">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 space-y-3 border-t border-purple-100 pt-5 text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>📍 {job.location}</span>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                      {job.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Annual salary</span>
                    <span className="font-bold text-gray-900 dark:text-white">{job.salary}</span>
                  </div>
                </div>

                <Link
                  to="/jobs"
                  className="mt-6 block rounded-xl border border-violet-200 py-3 text-center text-sm font-bold text-violet-700 transition hover:border-violet-600 hover:bg-violet-600 hover:text-white dark:border-violet-400/30 dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white"
                >
                  View Job Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies */}
      <section id="companies" className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Build your career
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Top companies are hiring
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500 dark:text-gray-400">
            Connect with leading companies and discover exciting career opportunities.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {companies.map((company) => (
              <div
                key={company.name}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-purple-100 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#1C1830]"
              >
                <span className={`text-4xl font-black ${company.color}`}>
                  {company.logo}
                </span>
                <h3 className="font-bold">{company.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 px-7 py-16 text-center text-white shadow-2xl shadow-purple-300/30 sm:px-12 lg:py-20">
          <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full border-[45px] border-white/10" />

          <div className="relative">
            <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold tracking-widest">
              YOUR FUTURE BEGINS TODAY
            </span>
            <h2 className="mx-auto mt-7 max-w-2xl text-3xl font-black sm:text-5xl">
              Ready to find your dream job?
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-purple-100">
              Create your profile, explore opportunities and take the next step
              towards your dream career.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/user-signup"
                className="rounded-xl bg-white px-7 py-4 text-sm font-bold text-violet-700 shadow-lg transition hover:-translate-y-1 hover:bg-purple-50"
              >
                Get Started →
              </Link>
              <Link
                to="/jobs"
                className="rounded-xl border border-white/40 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Explore Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white px-5 py-12 dark:border-white/10 dark:bg-[#171327] lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 font-bold text-white">
                J
              </div>
              <span className="text-xl font-extrabold">
                Job<span className="text-violet-600 dark:text-violet-400">Nest</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-gray-500 dark:text-gray-400">
              Helping people discover opportunities and build better careers.
            </p>
          </div>

          <div>
            <h3 className="font-bold">For Job Seekers</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/jobs" className="hover:text-violet-600">Browse Jobs</Link>
              <Link to="/user-signup" className="hover:text-violet-600">Create Account</Link>
              <Link to="/login" className="hover:text-violet-600">Login</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">For Employers</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/company-signup" className="hover:text-violet-600">Post a Job</Link>
              <Link to="/login" className="hover:text-violet-600">Employer Login</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Explore</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-gray-500 dark:text-gray-400">
              <a href="#categories" className="hover:text-violet-600">Categories</a>
              <a href="#companies" className="hover:text-violet-600">Companies</a>
              <Link to="/jobs" className="hover:text-violet-600">Find Opportunities</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-purple-100 pt-6 text-center text-xs text-gray-400 dark:border-white/10">
          © {new Date().getFullYear()} JobNest. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;
