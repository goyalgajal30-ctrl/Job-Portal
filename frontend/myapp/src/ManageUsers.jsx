
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { API_BASE } from "./apiConfig";

const API = `${API_BASE}/admin`;

function ManageUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token) {
        navigate("/login");
        return;
      }

      if (role !== "admin") {
        navigate("/");
        return;
      }

      const response = await axios.get(`${API}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data.users || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      } else {
        setError(err.response?.data?.message || "Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // DELETE USER
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token) {
        navigate("/login");
        return;
      }

      if (role !== "admin") {
        navigate("/");
        return;
      }

      setDeletingId(id);

      const response = await axios.delete(`${API}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(response.data.message || "User deleted successfully");

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== id)
      );
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      } else {
        alert(err.response?.data?.message || "Failed to delete user");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // SEARCH FILTER
  const filteredUsers = users.filter((user) =>
    `${user.name || ""} ${user.email || ""} ${user.phoneNumber || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-gray-800 dark:bg-[#100D1D] dark:text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-violet-100 bg-white/85 px-5 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#171327]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              JobNest
            </span>
            <span className="text-fuchsia-500">.</span>
          </h1>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => navigate("/admin/dashboard")}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-violet-300 dark:shadow-none"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">

        {/* Heading */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-bold tracking-wider text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
            <span className="h-2 w-2 rounded-full bg-fuchsia-500"></span>
            ADMIN PANEL
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Manage <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">Users</span>
          </h2>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            View, search and manage all registered users on JobNest.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-7 grid gap-5 sm:grid-cols-2">

          <div className="group rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100 dark:border-white/10 dark:bg-[#1C1830] dark:hover:shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Registered Users
                </p>

                <h3 className="mt-3 text-4xl font-extrabold text-violet-700 dark:text-violet-300">
                  {users.length}
                </h3>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl text-white shadow-lg shadow-violet-200 dark:shadow-none">
                👥
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-fuchsia-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-100 dark:border-white/10 dark:bg-[#1C1830] dark:hover:shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Search Results
                </p>

                <h3 className="mt-3 text-4xl font-extrabold text-fuchsia-600 dark:text-fuchsia-300">
                  {filteredUsers.length}
                </h3>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-2xl text-white shadow-lg shadow-fuchsia-200 dark:shadow-none">
                🔎
              </div>
            </div>
          </div>

        </div>

        {/* Search */}
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1C1830] md:flex-row md:items-center">

          <div>
            <h3 className="font-bold">All Users</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Search users by name, email or phone number.
            </p>
          </div>

          <div className="relative w-full md:max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-violet-100 bg-[#F8F6FF] py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-white/10 dark:bg-[#100D1D] dark:text-white dark:focus:ring-violet-500/10"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-violet-600 hover:text-fuchsia-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-violet-100 bg-white py-20 text-center dark:border-white/10 dark:bg-[#1C1830]">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-fuchsia-500"></div>
            <p className="mt-4 font-medium text-gray-500 dark:text-gray-400">
              Loading users...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300">
            <p className="font-semibold">{error}</p>

            <button
              onClick={fetchUsers}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Users Table */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm dark:border-white/10 dark:bg-[#1C1830]">

            <div className="flex items-center justify-between border-b border-violet-100 px-5 py-5 dark:border-white/10">
              <div>
                <h3 className="text-lg font-bold">Registered Users</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {filteredUsers.length} users displayed
                </p>
              </div>

              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                User List
              </span>
            </div>

            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left">

                  <thead className="bg-violet-50 text-xs uppercase tracking-wider text-violet-800 dark:bg-[#25203C] dark:text-violet-300">
                    <tr>
                      <th className="px-6 py-4 font-bold">User</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 font-bold">Phone</th>
                      <th className="px-6 py-4 font-bold">Joined</th>
                      <th className="px-6 py-4 text-center font-bold">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-t border-violet-50 transition hover:bg-violet-50/60 dark:border-white/5 dark:hover:bg-white/5"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white">
                              {(user.name || "U").charAt(0).toUpperCase()}
                            </div>

                            <span className="font-semibold">
                              {user.name || "N/A"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
                          {user.email || "N/A"}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
                          {user.phoneNumber || "N/A"}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("en-IN")
                            : "N/A"}
                        </td>

                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={deletingId === user._id}
                            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                          >
                            {deletingId === user._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            ) : (
              <div className="px-5 py-16 text-center">
                <div className="mb-4 text-5xl">👥</div>

                <h3 className="text-lg font-bold">
                  No users found
                </h3>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {search
                    ? "Try searching with a different name, email or phone number."
                    : "There are no registered users yet."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 border-t border-violet-100 py-6 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400">
          © 2026 <span className="font-bold text-violet-600 dark:text-violet-400">JobNest</span>. All rights reserved.
        </footer>

      </main>
    </div>
  );
}

export default ManageUsers;
