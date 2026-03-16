import { DemoData } from "../data/demo-data.ts";

const DEMO = !import.meta.env.VITE_API_URL;
const BASE = `${import.meta.env.VITE_API_URL ?? ""}/api/friendships`;

export interface Friendship {
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

export interface FriendshipStatus {
  status: string;
  id?: number;
  userAId?: number;
  userBId?: number;
  createdAt?: string;
  updatedAt?: string;
}

function authHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function sendFriendRequest(
  token: string,
  targetUserId: number,
): Promise<Friendship> {
  if (DEMO) return DemoData.sendFriendRequest(targetUserId);

  const res = await fetch(`${BASE}/request`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ targetUserId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? `Send friend request failed: ${res.status}`);
  }
  return res.json();
}

export async function respondToFriendRequest(
  token: string,
  friendshipId: number,
  status: "ACCEPTED" | "DECLINED",
): Promise<Friendship> {
  if (DEMO) return DemoData.respondToFriendRequest(friendshipId, status);

  const res = await fetch(`${BASE}/${friendshipId}/respond`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Respond failed" }));
    throw new Error(body.error ?? `Respond failed: ${res.status}`);
  }
  return res.json();
}

export async function deleteFriendship(
  token: string,
  friendshipId: number,
): Promise<void> {
  if (DEMO) return DemoData.deleteFriendship(friendshipId);

  const res = await fetch(`${BASE}/${friendshipId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Delete failed" }));
    throw new Error(body.error ?? `Delete friendship failed: ${res.status}`);
  }
}

export async function fetchFriendships(
  token: string,
  status?: string,
): Promise<Friendship[]> {
  if (DEMO) return DemoData.fetchFriendships(status);

  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`${BASE}${query}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Fetch failed" }));
    throw new Error(body.error ?? `Fetch friendships failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchFriendshipStatus(
  token: string,
  userId: number,
): Promise<FriendshipStatus> {
  if (DEMO) return DemoData.fetchFriendshipStatus(userId);

  const res = await fetch(`${BASE}/status/${userId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Fetch failed" }));
    throw new Error(
      body.error ?? `Fetch friendship status failed: ${res.status}`,
    );
  }
  return res.json();
}
