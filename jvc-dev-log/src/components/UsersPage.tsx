import { useEffect, useState } from "react";
import { fetchUsers } from "../api/auth";
import type { RegisteredUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Footer from "./Footer";

function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetchUsers(token)
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 container mx-auto px-4 py-8"
      >
        <h2 className="text-3xl font-bold mb-6">Registered Users</h2>

        {loading && <p aria-live="polite">Loading users…</p>}

        {error && (
          <div className="alert alert-error mb-4">
            <span role="alert">{error}</span>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <p>No registered users yet.</p>
        )}

        {!loading && users.length > 0 && (
          <>
            <p className="mb-4 text-sm opacity-70">
              {users.length} user{users.length !== 1 ? "s" : ""} registered
            </p>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Registered</th>
                    <th>Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td className="font-semibold">{u.username}</td>
                      <td>
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td>
                        <span className="badge badge-outline">
                          {u.entryCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default UsersPage;
