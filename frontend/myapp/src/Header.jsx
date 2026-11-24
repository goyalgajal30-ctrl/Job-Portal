import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const getDashboardLink = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "company") return "/company/dashboard";
    return "/user/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/85 px-6 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#171327]/90 md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 font-extrabold text-white shadow-md shadow-violet-500/20">
            J
          </div>
          <span className="text-2xl font-extrabold tracking-tight dark:text-white">
            Job<span className="text-violet-600 dark:text-violet-400">Nest</span>
            <span className="text-fuchsia-500">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300 md:flex">
          <Link to="/" className="transition hover:text-violet-600 dark:hover:text-violet-400">
            Home
          </Link>
          <Link to="/jobs" className="transition hover:text-violet-600 dark:hover:text-violet-400">
            Find Jobs
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {token ? (
            <button
              onClick={() => navigate(getDashboardLink())}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-300/40 transition hover:-translate-y-0.5 hover:shadow-violet-400/50"
            >
              Dashboard →
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-violet-50 dark:text-gray-200 dark:hover:bg-white/10"
              >
                Log In
              </Link>
              <Link
                to="/user-signup"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-300/30 transition hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl border border-violet-100 p-2 text-gray-700 dark:border-white/10 dark:text-gray-200"
            aria-label="Toggle Navigation Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="mt-4 border-t border-violet-100 pt-4 dark:border-white/10 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-semibold">
            <Link onClick={() => setMenuOpen(false)} to="/">Home</Link>
            <Link onClick={() => setMenuOpen(false)} to="/jobs">Find Jobs</Link>
            {token ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate(getDashboardLink());
                }}
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-center text-white"
              >
                My Dashboard
              </button>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/login"
                  className="rounded-xl border border-violet-200 py-2 text-center text-violet-700"
                >
                  Log In
                </Link>
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/user-signup"
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-2.5 text-center text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
