import { DemoData } from "../data/demo-data.ts";

const DEMO = !import.meta.env.VITE_API_URL;
const BASE = `${import.meta.env.VITE_API_URL ?? ""}/api/users`;

export interface UserProfile {
  id: number;
  username: string;
  handle: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface DirectoryUser {
  id: number;
  username: string;
  handle: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  entryCount: number;
}

export async function fetchUserDirectory(
  token: string,
  search?: string,
): Promise<DirectoryUser[]> {
  if (DEMO) return DemoData.fetchUserDirectory(search);

  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${BASE}${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res
      .json()
      .catch(() => ({ error: "Failed to load users" }));
    throw new Error(body.error ?? `Fetch users failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchProfile(handle: string): Promise<UserProfile> {
  if (DEMO) return DemoData.fetchProfile(handle);

  const res = await fetch(`${BASE}/${encodeURIComponent(handle)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "User not found" }));
    throw new Error(body.error ?? `Fetch profile failed: ${res.status}`);
  }
  return res.json();
}

export async function updateProfile(
  token: string,
  data: {
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  },
): Promise<UserProfile & { email: string }> {
  if (DEMO) return DemoData.updateProfile(data);

  const res = await fetch(`${BASE}/me/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Update failed" }));
    throw new Error(body.error ?? `Update profile failed: ${res.status}`);
  }
  return res.json();
}
