import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchUserDirectory } from "../api/users";
import type { DirectoryUser } from "../api/users";
import {
  fetchFriendships,
  sendFriendRequest,
  deleteFriendship,
} from "../api/friendships";
import type { Friendship } from "../api/friendships";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Footer from "./Footer";

/** Debounce helper — returns value after delay ms of inactivity */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Determine the friendship status between current user and another user */
function getFriendInfo(
  userId: number,
  myId: number,
  friendships: Friendship[],
): { status: string; friendshipId?: number } {
  const f = friendships.find(
    (fr) =>
      fr.userAId === Math.min(myId, userId) &&
      fr.userBId === Math.max(myId, userId),
  );
  if (!f) return { status: "NONE" };
  return { status: f.status, friendshipId: f.id };
}

function UsersPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const loadData = useCallback(
    async (query?: string) => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const [userList, friendList] = await Promise.all([
          fetchUserDirectory(token, query),
          fetchFriendships(token),
        ]);
        setUsers(userList);
        setFriendships(friendList);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadData(debouncedSearch || undefined);
  }, [debouncedSearch, loadData]);

  async function handleAddFriend(targetUserId: number) {
    if (!token) return;
    setActionLoading(targetUserId);
    try {
      await sendFriendRequest(token, targetUserId);
      await loadData(debouncedSearch || undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemoveFriend(friendshipId: number) {
    if (!token) return;
    setActionLoading(friendshipId);
    try {
      await deleteFriendship(token, friendshipId);
      await loadData(debouncedSearch || undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 container mx-auto px-4 py-8"
      >
        <h2 className="text-3xl font-bold mb-6">Users Directory</h2>

        {/* Search input */}
        <label className="form-control w-full max-w-md mb-6">
          <div className="label">
            <span className="label-text">Search by name or handle</span>
          </div>
          <input
            type="search"
            className="input input-bordered w-full"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users by name or handle"
          />
        </label>

        {loading && <p aria-live="polite">Loading users...</p>}

        {error && (
          <div className="alert alert-error mb-4">
            <span role="alert">{error}</span>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <p>
            {search
              ? "No users match your search."
              : "No registered users yet."}
          </p>
        )}

        {!loading && users.length > 0 && (
          <>
            <p className="mb-4 text-sm opacity-70">
              {users.length} user{users.length !== 1 ? "s" : ""} found
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((u) => {
                const isMe = user?.id === u.id;
                const info = user
                  ? getFriendInfo(u.id, user.id, friendships)
                  : { status: "NONE" };

                return (
                  <div key={u.id} className="card bg-base-200 shadow-md">
                    <div className="card-body items-center text-center">
                      {/* Avatar */}
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={`${u.displayName ?? u.username}'s avatar`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-neutral text-neutral-content flex items-center justify-center text-xl font-bold">
                          {(u.displayName ?? u.username)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      {/* Name and handle */}
                      <Link
                        to={`/u/${u.handle}`}
                        className="card-title text-lg link link-hover"
                      >
                        {u.displayName ?? u.username}
                      </Link>
                      <p className="text-sm opacity-60">@{u.handle}</p>

                      {/* Bio snippet */}
                      {u.bio && (
                        <p className="text-sm mt-1 line-clamp-2">{u.bio}</p>
                      )}

                      {/* Stats */}
                      <div className="flex gap-3 mt-2 text-xs opacity-60">
                        <span>{u.entryCount} entries</span>
                        <span>
                          Joined{" "}
                          {new Date(u.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Friend action buttons */}
                      {!isMe && user && (
                        <div className="card-actions mt-3">
                          {info.status === "NONE" && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={actionLoading === u.id}
                              onClick={() => handleAddFriend(u.id)}
                            >
                              {actionLoading === u.id
                                ? "Sending..."
                                : "Add Friend"}
                            </button>
                          )}
                          {info.status === "PENDING" && (
                            <button
                              type="button"
                              className="btn btn-warning btn-sm btn-outline"
                              disabled={actionLoading === info.friendshipId}
                              onClick={() =>
                                handleRemoveFriend(info.friendshipId!)
                              }
                            >
                              {actionLoading === info.friendshipId
                                ? "Canceling..."
                                : "Pending -- Cancel"}
                            </button>
                          )}
                          {info.status === "ACCEPTED" && (
                            <button
                              type="button"
                              className="btn btn-success btn-sm btn-outline"
                              disabled={actionLoading === info.friendshipId}
                              onClick={() =>
                                handleRemoveFriend(info.friendshipId!)
                              }
                            >
                              {actionLoading === info.friendshipId
                                ? "Removing..."
                                : "Friends -- Unfriend"}
                            </button>
                          )}
                          {info.status === "DECLINED" && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={actionLoading === u.id}
                              onClick={() => handleAddFriend(u.id)}
                            >
                              {actionLoading === u.id
                                ? "Sending..."
                                : "Send Request Again"}
                            </button>
                          )}
                        </div>
                      )}

                      {isMe && (
                        <span className="badge badge-ghost mt-3">You</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default UsersPage;
