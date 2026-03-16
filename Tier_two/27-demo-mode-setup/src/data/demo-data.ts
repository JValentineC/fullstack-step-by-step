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
const BASE_URL: string =
  (import.meta as unknown as { env: { BASE_URL?: string } }).env.BASE_URL ??
  "/";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface DemoUser {
  id: number;
  username: string;
  password: string; // plain-text for demo only — never do this in prod!
  displayName: string;
  role: "admin" | "intern";
  createdAt: string;
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
  for (const e of seed) merged.set(e.id, e);
  for (const e of local) merged.set(e.id, e);

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
  }): Promise<ApiEntry> {
    const logs = await loadLogs();
    const maxId = logs.reduce((max, e) => Math.max(max, e.id), 0);
    const now = new Date().toISOString();
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
      createdAt: now,
      updatedAt: now,
    };
    logs.unshift(entry);
    persistLogs(logs);
    return toApiEntry(entry);
  },

  async updateEntry(
    id: number,
    body: { title: string; summary: string; mood: string; tags: string },
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
  ): Promise<{ token: string; user: { id: number; username: string } }> {
    const users = await loadUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password,
    );
    if (!user) throw new Error("Invalid username or password");

    // Fake JWT — just a base64 blob so the rest of the app is happy
    const fakeToken = btoa(
      JSON.stringify({ id: user.id, username: user.username, demo: true }),
    );
    localStorage.setItem(AUTH_KEY, fakeToken);
    return { token: fakeToken, user: { id: user.id, username: user.username } };
  },

  async register(
    username: string,
    password: string,
  ): Promise<{ token: string; user: { id: number; username: string } }> {
    const users = await loadUsers();
    if (users.find((u) => u.username === username)) {
      throw new Error("Username already taken");
    }
    const newUser: DemoUser = {
      id: users.reduce((max, u) => Math.max(max, u.id), 0) + 1,
      username,
      password,
      displayName: username,
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
        demo: true,
      }),
    );
    localStorage.setItem(AUTH_KEY, fakeToken);
    return {
      token: fakeToken,
      user: { id: newUser.id, username: newUser.username },
    };
  },

  async fetchMe(token: string): Promise<{ id: number; username: string }> {
    try {
      const payload = JSON.parse(atob(token));
      return { id: payload.id, username: payload.username };
    } catch {
      throw new Error("Not authenticated");
    }
  },

  /* ---------- utility -------------------------------------------- */

  /** Wipe all localStorage overrides so the demo resets to the seed data */
  reset(): void {
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(AUTH_KEY);
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
