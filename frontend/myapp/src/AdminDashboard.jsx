import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "./ThemeContext";
import { API_BASE } from "./apiConfig";

const API = `${API_BASE}/admin`;

const emptyCompany = {
  companyName: "",
  companyType: "",
  registrationNumber: "",
  establishedDate: "",
  owner: "",
  mailingAddress: {
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  },
  nominalCapital: 0,
  industry: "",
  website: "",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [activeTab, setActiveTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState(emptyCompany);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const admin = JSON.parse(localStorage.getItem("user") || "null");
  const adminName = admin?.name || admin?.fullName || "Admin";
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token || admin?.role !== "admin") {
        logout();
        return;
      }

      const [
        statsRes,
        usersRes,
        companiesRes,
        jobsRes,
        applicationsRes,
      ] = await Promise.all([
        axios.get(`${API}/stats`, config),
        axios.get(`${API}/users`, config),
        axios.get(`${API}/companies`, config),
        axios.get(`${API}/jobs`, config),
        axios.get(`${API}/applications`, config),
      ]);

      setStats(statsRes.data.stats || {});
      setUsers(usersRes.data.users || []);
      setCompanies(companiesRes.data.companies || []);
      setJobs(jobsRes.data.jobs || []);
      setApplications(applicationsRes.data.applications || []);

    } catch (err) {
      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        logout();
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to load dashboard data"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Search Users
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      `${user.name || ""} ${user.email || ""} ${user.phoneNumber || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  // Search Companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) =>
      `${company.companyName || ""} ${company.industry || ""} ${company.user?.email || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [companies, search]);

  // Search Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) =>
      `${job.title || ""} ${job.company?.companyName || ""} ${job.location || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [jobs, search]);

  // Search Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const user = application.userId || {};
      const job = application.jobId || {};
      const company = job.company || {};

      return `${user.name || ""} ${user.email || ""} ${user.phoneNumber || ""} ${job.title || ""} ${company.companyName || ""} ${job.location || ""} ${application.status || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [applications, search]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const currency = (salary) => {
    if (!salary) return "—";

    if (typeof salary === "object") {
      return `₹${Number(salary.min || 0).toLocaleString("en-IN")} - ₹${Number(salary.max || 0).toLocaleString("en-IN")}`;
    }

    return `₹${Number(salary).toLocaleString("en-IN")}`;
  };

  // Delete User
  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(id);

      const res = await axios.delete(
        `${API}/users/${id}`,
        config
      );

      alert(res.data.message || "User deleted successfully");

      await fetchDashboardData();
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to delete user"
      );
    } finally {
      setActionLoading("");
    }
  };

  // Update Application Status
  const updateApplicationStatus = async (id, status) => {
    try {
      setActionLoading(id);

      const res = await axios.put(
        `${API}/applications/${id}`,
        { status },
        config
      );

      await fetchDashboardData();

      alert(
        res.data.message || "Application status updated successfully"
      );

    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
        "Unable to update application status"
      );
    } finally {
      setActionLoading("");
    }
  };

  // Open Company Edit Form
  const handleEditCompany = (company) => {
    setEditingCompany(company._id);

    setCompanyForm({
      companyName: company.companyName || "",
      companyType: company.companyType || "",
      registrationNumber: company.registrationNumber || "",
      establishedDate: company.establishedDate
        ? new Date(company.establishedDate).toISOString().split("T")[0]
        : "",
      owner: company.owner || "",
      mailingAddress: {
        streetAddress: company.mailingAddress?.streetAddress || "",
        city: company.mailingAddress?.city || "",
        state: company.mailingAddress?.state || "",
        zipCode: company.mailingAddress?.zipCode || "",
        country: company.mailingAddress?.country || "",
      },
      nominalCapital: company.nominalCapital ?? 0,
      industry: company.industry || "",
      website: company.website || "",
    });
  };

  // Handle Company Form Changes
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("mailingAddress.")) {
      const field = name.split(".")[1];

      setCompanyForm((prev) => ({
        ...prev,
        mailingAddress: {
          ...prev.mailingAddress,
          [field]: value,
        },
      }));
    } else {
      setCompanyForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Update Company
  const handleUpdateCompany = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await axios.put(
        `${API}/companies/${editingCompany}`,
        {
          ...companyForm,
          nominalCapital: Number(companyForm.nominalCapital),
        },
        config
      );

      alert(res.data.message || "Company updated successfully");

      setEditingCompany(null);
      setCompanyForm(emptyCompany);

      await fetchDashboardData();
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to update company"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Company
  const handleDeleteCompany = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure? This will also delete this company's jobs and their applications."
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(id);

      const res = await axios.delete(
        `${API}/companies/${id}`,
        config
      );

      alert(res.data.message || "Company deleted successfully");

      await fetchDashboardData();
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to delete company"
      );
    } finally {
      setActionLoading("");
    }
  };

  // Delete Job
  const handleDeleteJob = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure? This will also delete all applications for this job."
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(id);

      const res = await axios.delete(
        `${API}/jobs/${id}`,
        config
      );

      alert(res.data.message || "Job deleted successfully");

      await fetchDashboardData();
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to delete job"
      );
    } finally {
      setActionLoading("");
    }
  };

  const tabs = [
    { name: "Overview", icon: "▦" },
    { name: "Users", icon: "♙" },
    { name: "Companies", icon: "▣" },
    { name: "Vacancies", icon: "▤" },
    { name: "Applications", icon: "✉" },
  ];

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      icon: "♙",
      color: "from-violet-500 to-indigo-600",
    },
    {
      title: "Total Companies",
      value: stats.totalCompanies || 0,
      icon: "▣",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs || 0,
      icon: "▤",
      color: "from-fuchsia-500 to-purple-600",
    },
    {
      title: "Applications",
      value: stats.totalApplications || 0,
      icon: "✉",
      color: "from-orange-500 to-pink-500",
    },
  ];

  const cardClass =
    "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151b2e]";

  const headingClass =
    "text-lg font-bold text-slate-800 dark:text-white";

  const thClass =
    "whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

  const tdClass =
    "whitespace-nowrap px-5 py-4 text-sm text-slate-700 dark:text-slate-300";

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  // Application Status Styling
  const getStatusClass = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";
      case "shortlisted":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
      default:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";
    }
  };

  // Users Table
  const renderUsersTable = (data) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
          <tr>
            <th className={thClass}>User</th>
            <th className={thClass}>Email</th>
            <th className={thClass}>Phone</th>
            <th className={thClass}>Joined</th>
            <th className={thClass}>Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length ? (
            data.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>

                    <span className="font-semibold text-slate-800 dark:text-white">
                      {user.name || "—"}
                    </span>
                  </div>
                </td>

                <td className={tdClass}>{user.email || "—"}</td>
                <td className={tdClass}>{user.phoneNumber || "—"}</td>
                <td className={tdClass}>{formatDate(user.createdAt)}</td>

                <td className={tdClass}>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={actionLoading === user._id}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400"
                  >
                    {actionLoading === user._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Companies Table
  const renderCompaniesTable = (data) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
          <tr>
            <th className={thClass}>Company</th>
            <th className={thClass}>Industry</th>
            <th className={thClass}>Owner</th>
            <th className={thClass}>Email</th>
            <th className={thClass}>Joined</th>
            <th className={thClass}>Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length ? (
            data.map((company) => (
              <tr
                key={company._id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className={tdClass}>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {company.companyName || "—"}
                  </span>
                </td>

                <td className={tdClass}>{company.industry || "—"}</td>
                <td className={tdClass}>{company.owner || "—"}</td>
                <td className={tdClass}>{company.user?.email || "—"}</td>
                <td className={tdClass}>{formatDate(company.createdAt)}</td>

                <td className={tdClass}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCompany(company)}
                      className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteCompany(company._id)}
                      disabled={actionLoading === company._id}
                      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400"
                    >
                      {actionLoading === company._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-5 py-10 text-center text-slate-500">
                No companies found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Jobs Table
  const renderJobsTable = (data) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
          <tr>
            <th className={thClass}>Job Title</th>
            <th className={thClass}>Company</th>
            <th className={thClass}>Location</th>
            <th className={thClass}>Applicants</th>
            <th className={thClass}>Salary</th>
            <th className={thClass}>Posted</th>
            <th className={thClass}>Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length ? (
            data.map((job) => (
              <tr
                key={job._id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className={tdClass}>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {job.title || "—"}
                  </span>
                </td>

                <td className={tdClass}>
                  {job.company?.companyName || "—"}
                </td>

                <td className={tdClass}>{job.location || "—"}</td>

                <td className={tdClass}>
                  <span className="rounded-lg bg-violet-100 px-3 py-1 font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                    {job.totalApplicants ?? 0}
                  </span>
                </td>

                <td className={tdClass}>{currency(job.salary)}</td>
                <td className={tdClass}>{formatDate(job.createdAt)}</td>

                <td className={tdClass}>
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    disabled={actionLoading === job._id}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400"
                  >
                    {actionLoading === job._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-5 py-10 text-center text-slate-500">
                No jobs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Applications Table
  const renderApplicationsTable = (data) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
          <tr>
            <th className={thClass}>Applicant</th>
            <th className={thClass}>Contact</th>
            <th className={thClass}>Job</th>
            <th className={thClass}>Company</th>
            <th className={thClass}>Location</th>
            <th className={thClass}>Resume</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Applied Date</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.length ? (
            data.map((application) => (
              <tr
                key={application._id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className={tdClass}>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {application.userId?.name || "—"}
                  </span>
                </td>

                <td className={tdClass}>
                  <div>{application.userId?.email || "—"}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {application.userId?.phoneNumber || "—"}
                  </div>
                </td>

                <td className={tdClass}>
                  <span className="font-semibold">
                    {application.jobId?.title || "—"}
                  </span>
                </td>

                <td className={tdClass}>
                  {application.jobId?.company?.companyName || "—"}
                </td>

                <td className={tdClass}>
                  {application.jobId?.location || "—"}
                </td>

                <td className={tdClass}>
                  {application.resume ? (
                    <a
                      href={application.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300"
                    >
                      View Resume
                    </a>
                  ) : (
                    "—"
                  )}
                </td>

                {/* Updated Application Status Dropdown */}
                <td className={tdClass}>
                  <select
                    value={application.status || "pending"}
                    disabled={actionLoading === application._id}
                    onChange={(e) =>
                      updateApplicationStatus(
                        application._id,
                        e.target.value
                      )
                    }
                    className={`rounded-lg border-0 px-3 py-2 text-xs font-semibold capitalize outline-none ${getStatusClass(application.status)} disabled:opacity-50`}
                  >
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>

                  {actionLoading === application._id && (
                    <p className="mt-1 text-xs text-slate-500">
                      Updating...
                    </p>
                  )}
                </td>

                <td className={tdClass}>
                  {formatDate(application.createdAt)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-5 py-10 text-center text-slate-500">
                No applications found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      id="admin-dashboard"
      className={`min-h-screen ${darkMode ? "dark" : ""} bg-slate-100 text-slate-800 transition-colors duration-300 dark:bg-[#0b1020] dark:text-white`}
    >
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col bg-[#11152a] text-white lg:flex">
          <div className="border-b border-white/10 px-6 py-7">
            <h1 className="text-2xl font-extrabold tracking-wide">
              Hire<span className="text-violet-400">Hub</span>
            </h1>
            <p className="mt-1 text-xs tracking-widest text-slate-400">
              ADMIN PANEL
            </p>
          </div>

          <div className="px-4 py-7">
            <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Main Menu
            </p>

            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    setSearch("");
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeTab === tab.name
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 to-indigo-600/10 p-4">
              <p className="font-semibold text-white">Admin Control</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Manage users, companies, vacancies and applications.
              </p>
            </div>

            <button
              onClick={logout}
              className="mt-5 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              ↪ Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">

          {/* Navbar */}
          <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-[#11182b]/90 md:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">
                Admin Panel
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {activeTab}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-700 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 font-bold text-white">
                  {adminName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {adminName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Administrator
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 lg:hidden"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Mobile Navigation */}
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[#11182b] lg:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setSearch("");
                }}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === tab.name
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-[1600px] space-y-7 p-5 md:p-8">

            {/* Welcome */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4c35a8] via-[#6545c5] to-[#3730a3] p-7 text-white shadow-xl md:p-9">
              <div className="relative z-10 max-w-2xl">
                <p className="text-sm font-medium text-violet-200">
                  Welcome back, {adminName}
                </p>

                <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">
                  Dashboard Overview
                </h1>

                <p className="mt-3 text-sm leading-6 text-violet-100">
                  Monitor your platform activity and manage your job portal
                  from one place.
                </p>
              </div>

              <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border-[35px] border-white/10" />
              <div className="absolute -bottom-28 right-32 h-64 w-64 rounded-full border-[35px] border-white/10" />
            </section>

            {/* Loading */}
            {loading && (
              <div className={`${cardClass} p-10 text-center`}>
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Loading dashboard data...
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-500/20 dark:bg-red-500/10">
                <p className="font-semibold text-red-700 dark:text-red-400">
                  {error}
                </p>

                <button
                  onClick={fetchDashboardData}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Overview */}
                {activeTab === "Overview" && (
                  <>
                    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                      {statCards.map((item) => (
                        <div
                          key={item.title}
                          className={`${cardClass} group p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {item.title}
                              </p>

                              <h3 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                                {item.value}
                              </h3>
                            </div>

                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-2xl text-white shadow-lg`}>
                              {item.icon}
                            </div>
                          </div>
                        </div>
                      ))}
                    </section>

                    <section className={cardClass}>
                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800">
                        <div>
                          <h3 className={headingClass}>Recent Users</h3>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Latest registered users
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveTab("Users")}
                          className="text-sm font-semibold text-violet-600 dark:text-violet-400"
                        >
                          View All →
                        </button>
                      </div>

                      {renderUsersTable(users.slice(0, 5))}
                    </section>

                    <section className={cardClass}>
                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800">
                        <div>
                          <h3 className={headingClass}>Recent Companies</h3>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Latest registered companies
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveTab("Companies")}
                          className="text-sm font-semibold text-violet-600 dark:text-violet-400"
                        >
                          View All →
                        </button>
                      </div>

                      {renderCompaniesTable(companies.slice(0, 5))}
                    </section>

                    <section className={cardClass}>
                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800">
                        <div>
                          <h3 className={headingClass}>Latest Vacancies</h3>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Recently posted jobs
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveTab("Vacancies")}
                          className="text-sm font-semibold text-violet-600 dark:text-violet-400"
                        >
                          View All →
                        </button>
                      </div>

                      {renderJobsTable(jobs.slice(0, 5))}
                    </section>

                    <section className={cardClass}>
                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800">
                        <div>
                          <h3 className={headingClass}>Recent Applications</h3>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Latest job applications
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveTab("Applications")}
                          className="text-sm font-semibold text-violet-600 dark:text-violet-400"
                        >
                          View All →
                        </button>
                      </div>

                      {renderApplicationsTable(applications.slice(0, 5))}
                    </section>
                  </>
                )}

                {/* Users */}
                {activeTab === "Users" && (
                  <section className={cardClass}>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
                      <div>
                        <h3 className={headingClass}>All Users</h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Total {users.length} registered users
                        </p>
                      </div>

                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-violet-500 sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    {renderUsersTable(filteredUsers)}
                  </section>
                )}

                {/* Companies */}
                {activeTab === "Companies" && (
                  <section className={cardClass}>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
                      <div>
                        <h3 className={headingClass}>All Companies</h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Total {companies.length} registered companies
                        </p>
                      </div>

                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search companies..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-violet-500 sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    {renderCompaniesTable(filteredCompanies)}
                  </section>
                )}

                {/* Vacancies */}
                {activeTab === "Vacancies" && (
                  <section className={cardClass}>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
                      <div>
                        <h3 className={headingClass}>All Vacancies</h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Total {jobs.length} posted jobs
                        </p>
                      </div>

                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search jobs..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-violet-500 sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    {renderJobsTable(filteredJobs)}
                  </section>
                )}

                {/* Applications */}
                {activeTab === "Applications" && (
                  <section className={cardClass}>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
                      <div>
                        <h3 className={headingClass}>All Applications</h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Total {applications.length} job applications
                        </p>
                      </div>

                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search applications..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-violet-500 sm:w-72 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    {renderApplicationsTable(filteredApplications)}
                  </section>
                )}
              </>
            )}

            <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
              © {new Date().getFullYear()} HireHub Admin Dashboard
            </footer>
          </div>
        </main>
      </div>

      {/* Edit Company Modal */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#151b2e]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Edit Company
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Update company profile details
                </p>
              </div>

              <button
                onClick={() => setEditingCompany(null)}
                className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateCompany}>
              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Company Name
                  </label>
                  <input
                    name="companyName"
                    value={companyForm.companyName}
                    onChange={handleCompanyChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Company Type
                  </label>
                  <input
                    name="companyType"
                    value={companyForm.companyType}
                    onChange={handleCompanyChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Registration Number
                  </label>
                  <input
                    name="registrationNumber"
                    value={companyForm.registrationNumber}
                    onChange={handleCompanyChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Established Date
                  </label>
                  <input
                    type="date"
                    name="establishedDate"
                    value={companyForm.establishedDate}
                    onChange={handleCompanyChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Owner
                  </label>
                  <input
                    name="owner"
                    value={companyForm.owner}
                    onChange={handleCompanyChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Industry
                  </label>
                  <input
                    name="industry"
                    value={companyForm.industry}
                    onChange={handleCompanyChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Website
                  </label>
                  <input
                    name="website"
                    value={companyForm.website}
                    onChange={handleCompanyChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Nominal Capital
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="nominalCapital"
                    value={companyForm.nominalCapital}
                    onChange={handleCompanyChange}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <h3 className="mb-1 font-bold text-slate-800 dark:text-white">
                    Mailing Address
                  </h3>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Street Address
                  </label>
                  <input
                    name="mailingAddress.streetAddress"
                    value={companyForm.mailingAddress.streetAddress}
                    onChange={handleCompanyChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    City
                  </label>
                  <input
                    name="mailingAddress.city"
                    value={companyForm.mailingAddress.city}
                    onChange={handleCompanyChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    State
                  </label>
                  <input
                    name="mailingAddress.state"
                    value={companyForm.mailingAddress.state}
                    onChange={handleCompanyChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Zip Code
                  </label>
                  <input
                    name="mailingAddress.zipCode"
                    value={companyForm.mailingAddress.zipCode}
                    onChange={handleCompanyChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Country
                  </label>
                  <input
                    name="mailingAddress.country"
                    value={companyForm.mailingAddress.country}
                    onChange={handleCompanyChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
