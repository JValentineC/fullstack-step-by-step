/**
 * demo-data.ts — GitHub Pages "offline" data layer
 *
 * When the real API is unreachable (e.g. on GitHub Pages with no backend),
 * the app can import these helpers instead. They load the dummy JSON files
 * once, merge anything the user has added/edited in the current browser via
 * localStorage, and expose the same shapes the rest of the code expects.
 *
 * Usage:
 *   import { DemoData } from '../data/demo-data'
 *
 * This keeps the GH Pages demo fully functional — users can browse, filter,
 * paginate, "log in", and even create entries that survive page reloads
 * (until they clear site data).
 */

import type { Entry, Mood, PaginatedResponse, ApiEntry } from "./entries";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const LOGS_KEY = "jvc_demo_logs";
const USERS_KEY = "jvc_demo_users";
const AUTH_KEY = "jvc_demo_auth";
const FRIENDS_KEY = "jvc_demo_friendships";
const BASE_URL: string =
  (import.meta as unknown as { env: { BASE_URL?: string } }).env.BASE_URL ??
  "/";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface DemoUser {
  id: number;
  username: string;
  email: string;
  password: string; // plain-text for demo only — never do this in prod!
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  role: "admin" | "intern";
  createdAt: string;
}

export interface DemoFriendship {
  id: number;
  userAId: number;
  userBId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  userAUsername?: string;
  userAHandle?: string;
  userBUsername?: string;
  userBHandle?: string;
}

/* ------------------------------------------------------------------ */
/*  Internal cache (in-memory for the session)                         */
/* ------------------------------------------------------------------ */
let logsCache: Entry[] | null = null;
let usersCache: DemoUser[] | null = null;

/* ------------------------------------------------------------------ */
/*  Bootstrap: load JSON → merge localStorage overrides                */
/* ------------------------------------------------------------------ */
async function loadLogs(): Promise<Entry[]> {
  if (logsCache) return logsCache;

  // 1. Fetch the static seed file shipped in public/data/
  const res = await fetch(`${BASE_URL}data/dummy-logs.json`);
  const seed: Entry[] = res.ok ? await res.json() : [];

  // 2. Check localStorage for user-added / edited entries
  const stored = localStorage.getItem(LOGS_KEY);
  const local: Entry[] = stored ? JSON.parse(stored) : [];

  // 3. Merge: local entries override seeds with the same id
  const merged = new Map<number, Entry>();
  for (const e of seed)
    merged.set(e.id, {
      ...e,
      author: e.author ?? null,
      visibility: e.visibility ?? "PUBLIC",
    });
  for (const e of local)
    merged.set(e.id, {
      ...e,
      author: e.author ?? null,
      visibility: e.visibility ?? "PUBLIC",
    });

  logsCache = Array.from(merged.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return logsCache;
}

async function loadUsers(): Promise<DemoUser[]> {
  if (usersCache) return usersCache;
  const res = await fetch(`${BASE_URL}data/dummy-users.json`);
  usersCache = res.ok ? await res.json() : [];
  return usersCache!;
}

function persistLogs(logs: Entry[]): void {
  logsCache = logs;
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

function loadFriendships(): DemoFriendship[] {
  const stored = localStorage.getItem(FRIENDS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function persistFriendships(friendships: DemoFriendship[]): void {
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friendships));
}

function getDemoUserId(): number {
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) throw new Error("Not authenticated");
  return JSON.parse(atob(auth)).id;
}

function pairNormalize(a: number, b: number): [number, number] {
  return a < b ? [a, b] : [b, a];
}

/* ------------------------------------------------------------------ */
/*  Public API — mirrors the real api/ layer                           */
/* ------------------------------------------------------------------ */
export const DemoData = {
  /* ---------- entries -------------------------------------------- */

  async fetchEntries(
    params: {
      tag?: string;
      page?: number;
      limit?: number;
      sort?: string;
      order?: "asc" | "desc";
    } = {},
  ): Promise<PaginatedResponse> {
    let logs = await loadLogs();

    // Filter by tag
    if (params.tag) {
      logs = logs.filter((e) =>
        e.tags.some((t) => t.toLowerCase() === params.tag!.toLowerCase()),
      );
    }

    // Sort
    const sort = params.sort ?? "createdAt";
    const order = params.order ?? "asc";
    logs = [...logs].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sort];
      const bVal = (b as unknown as Record<string, unknown>)[sort];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });

    // Paginate
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const total = logs.length;
    const totalPages = Math.ceil(total / limit);
    const data: ApiEntry[] = logs
      .slice((page - 1) * limit, page * limit)
      .map(toApiEntry);

    return { data, page, limit, total, totalPages };
  },

  async fetchTags(): Promise<string[]> {
    const logs = await loadLogs();
    const tagSet = new Set<string>();
    for (const e of logs) e.tags.forEach((t) => tagSet.add(t));
    return Array.from(tagSet).sort();
  },

  async fetchEntry(id: number): Promise<ApiEntry | null> {
    const logs = await loadLogs();
    const found = logs.find((e) => e.id === id);
    return found ? toApiEntry(found) : null;
  },

  async createEntry(body: {
    title: string;
    summary: string;
    mood: string;
    tags: string;
    visibility?: string;
  }): Promise<ApiEntry> {
    const logs = await loadLogs();
    const maxId = logs.reduce((max, e) => Math.max(max, e.id), 0);
    const now = new Date().toISOString();
    const auth = localStorage.getItem(AUTH_KEY);
    const username = auth ? JSON.parse(auth).username : null;
    const entry: Entry = {
      id: maxId + 1,
      title: body.title,
      summary: body.summary,
      mood: body.mood as Mood,
      tags: body.tags
        ? body.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      visibility: body.visibility ?? "PUBLIC",
      createdAt: now,
      updatedAt: now,
      author: username,
    };
    logs.unshift(entry);
    persistLogs(logs);
    return toApiEntry(entry);
  },

  async updateEntry(
    id: number,
    body: {
      title: string;
      summary: string;
      mood: string;
      tags: string;
      visibility?: string;
    },
  ): Promise<ApiEntry | null> {
    const logs = await loadLogs();
    const idx = logs.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const updated: Entry = {
      ...logs[idx],
      title: body.title,
      summary: body.summary,
      mood: body.mood as Mood,
      tags: body.tags
        ? body.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      updatedAt: new Date().toISOString(),
      author: logs[idx].author,
      visibility: body.visibility ?? logs[idx].visibility ?? "PUBLIC",
    };
    logs[idx] = updated;
    persistLogs(logs);
    return toApiEntry(updated);
  },

  async deleteEntry(id: number): Promise<boolean> {
    const logs = await loadLogs();
    const idx = logs.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    logs.splice(idx, 1);
    persistLogs(logs);
    return true;
  },

  /* ---------- auth ----------------------------------------------- */

  async login(
    username: string,
    password: string,
  ): Promise<{
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      handle: string;
      displayName: string | null;
      bio: string | null;
      avatarUrl: string | null;
    };
  }> {
    const users = await loadUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password,
    );
    if (!user) throw new Error("Invalid username or password");

    // Fake JWT — just a base64 blob so the rest of the app is happy
    const fakeToken = btoa(
      JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        handle: user.handle,
        demo: true,
      }),
    );
    localStorage.setItem(AUTH_KEY, fakeToken);
    return {
      token: fakeToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        handle: user.handle,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    };
  },

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<{
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      handle: string;
      displayName: string | null;
      bio: string | null;
      avatarUrl: string | null;
    };
  }> {
    const users = await loadUsers();
    if (users.find((u) => u.username === username)) {
      throw new Error("Username already taken");
    }
    const newUser: DemoUser = {
      id: users.reduce((max, u) => Math.max(max, u.id), 0) + 1,
      username,
      email,
      password,
      handle: username
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      displayName: username,
      bio: null,
      avatarUrl: null,
      role: "intern",
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    usersCache = users;
    // Persist newly registered users so they survive reloads
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const fakeToken = btoa(
      JSON.stringify({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        handle: newUser.handle,
        demo: true,
      }),
    );
    localStorage.setItem(AUTH_KEY, fakeToken);
    return {
      token: fakeToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        handle: newUser.handle,
        displayName: newUser.displayName,
        bio: newUser.bio,
        avatarUrl: newUser.avatarUrl,
      },
    };
  },

  async fetchMe(
    token: string,
  ): Promise<{
    id: number;
    username: string;
    email: string;
    handle: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
  }> {
    try {
      const payload = JSON.parse(atob(token));
      // Look up full user data from cache if available
      const users = await loadUsers();
      const user = users.find((u) => u.id === payload.id);
      return {
        id: payload.id,
        username: payload.username,
        email: payload.email ?? "",
        handle:
          user?.handle ?? payload.handle ?? payload.username.toLowerCase(),
        displayName: user?.displayName ?? null,
        bio: user?.bio ?? null,
        avatarUrl: user?.avatarUrl ?? null,
      };
    } catch {
      throw new Error("Not authenticated");
    }
  },

  /* ---------- profiles ------------------------------------------- */

  async fetchProfile(
    handle: string,
  ): Promise<{
    id: number;
    username: string;
    handle: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: string;
  }> {
    const users = await loadUsers();
    const user = users.find((u) => u.handle === handle.toLowerCase());
    if (!user) throw new Error("User not found");
    return {
      id: user.id,
      username: user.username,
      handle: user.handle,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  },

  async updateProfile(data: {
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  }): Promise<{
    id: number;
    username: string;
    email: string;
    handle: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: string;
  }> {
    const auth = localStorage.getItem(AUTH_KEY);
    if (!auth) throw new Error("Not authenticated");
    const payload = JSON.parse(atob(auth));
    const users = await loadUsers();
    const user = users.find((u) => u.id === payload.id);
    if (!user) throw new Error("User not found");

    if (data.displayName !== undefined)
      user.displayName = data.displayName ?? user.username;
    if (data.bio !== undefined) user.bio = data.bio ?? null;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl ?? null;

    usersCache = users;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      handle: user.handle,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  },

  /* ---------- users ---------------------------------------------- */

  async fetchUsers(): Promise<
    { id: number; username: string; createdAt: string; entryCount: number }[]
  > {
    const users = await loadUsers();

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      createdAt: u.createdAt,
      entryCount: 0, // demo mode has no user-entry relationship
    }));
  },

  /* ---------- friendships ---------------------------------------- */

  async sendFriendRequest(targetUserId: number): Promise<DemoFriendship> {
    const userId = getDemoUserId();
    if (targetUserId === userId)
      throw new Error("Cannot send a friend request to yourself");

    const friendships = loadFriendships();
    const [userAId, userBId] = pairNormalize(userId, targetUserId);
    const existing = friendships.find(
      (f) => f.userAId === userAId && f.userBId === userBId,
    );

    if (existing) {
      if (existing.status === "ACCEPTED") throw new Error("Already friends");
      if (existing.status === "PENDING")
        throw new Error("Friend request already pending");
      // DECLINED — allow re-request
      existing.status = "PENDING";
      existing.updatedAt = new Date().toISOString();
      persistFriendships(friendships);
      return existing;
    }

    const now = new Date().toISOString();
    const newFriendship: DemoFriendship = {
      id: friendships.reduce((max, f) => Math.max(max, f.id), 0) + 1,
      userAId,
      userBId,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    };
    friendships.push(newFriendship);
    persistFriendships(friendships);
    return newFriendship;
  },

  async respondToFriendRequest(
    friendshipId: number,
    status: "ACCEPTED" | "DECLINED",
  ): Promise<DemoFriendship> {
    const userId = getDemoUserId();
    const friendships = loadFriendships();
    const friendship = friendships.find((f) => f.id === friendshipId);
    if (!friendship) throw new Error("Friendship not found");
    if (friendship.status !== "PENDING")
      throw new Error("Can only respond to PENDING requests");
    if (friendship.userAId !== userId && friendship.userBId !== userId)
      throw new Error("Not your friendship request");

    friendship.status = status;
    friendship.updatedAt = new Date().toISOString();
    persistFriendships(friendships);
    return friendship;
  },

  async deleteFriendship(friendshipId: number): Promise<void> {
    const userId = getDemoUserId();
    const friendships = loadFriendships();
    const idx = friendships.findIndex((f) => f.id === friendshipId);
    if (idx === -1) throw new Error("Friendship not found");
    const friendship = friendships[idx];
    if (friendship.userAId !== userId && friendship.userBId !== userId)
      throw new Error("Not your friendship");
    friendships.splice(idx, 1);
    persistFriendships(friendships);
  },

  async fetchFriendships(status?: string): Promise<DemoFriendship[]> {
    const userId = getDemoUserId();
    const users = await loadUsers();
    let friendships = loadFriendships().filter(
      (f) => f.userAId === userId || f.userBId === userId,
    );
    if (status) {
      friendships = friendships.filter(
        (f) => f.status === status.toUpperCase(),
      );
    }
    // Enrich with usernames/handles
    return friendships
      .map((f) => {
        const ua = users.find((u) => u.id === f.userAId);
        const ub = users.find((u) => u.id === f.userBId);
        return {
          ...f,
          userAUsername: ua?.username,
          userAHandle: ua?.handle,
          userBUsername: ub?.username,
          userBHandle: ub?.handle,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  },

  async fetchFriendshipStatus(
    otherUserId: number,
  ): Promise<{
    status: string;
    id?: number;
    userAId?: number;
    userBId?: number;
  }> {
    const userId = getDemoUserId();
    const [userAId, userBId] = pairNormalize(userId, otherUserId);
    const friendships = loadFriendships();
    const found = friendships.find(
      (f) => f.userAId === userAId && f.userBId === userBId,
    );
    if (!found) return { status: "NONE" };
    return found;
  },

  /* ---------- utility -------------------------------------------- */

  /** Wipe all localStorage overrides so the demo resets to the seed data */
  reset(): void {
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(FRIENDS_KEY);
    logsCache = null;
    usersCache = null;
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function toApiEntry(e: Entry): ApiEntry {
  return {
    ...e,
    mood: e.mood,
    tags: e.tags.join(", "),
  };
}
