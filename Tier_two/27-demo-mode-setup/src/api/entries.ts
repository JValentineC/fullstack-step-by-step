import type { ApiEntry, PaginatedResponse } from "../data/entries.ts";
import { DemoData } from "../data/demo-data.ts";

// ── Demo mode: when VITE_API_URL is not set (e.g. GitHub Pages) ───
const DEMO = !import.meta.env.VITE_API_URL;

// In development Vite proxies /api → localhost:4000.
// In production (GH Pages) VITE_API_URL points to the deployed backend.
const BASE = `${import.meta.env.VITE_API_URL ?? ""}/api`;

export interface FetchEntriesParams {
  tag?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

function authHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function fetchEntries(
  params: FetchEntriesParams = {},
): Promise<PaginatedResponse> {
  if (DEMO) return DemoData.fetchEntries(params);

  const query = new URLSearchParams();
  if (params.tag) query.set("tag", params.tag);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  const qs = query.toString();
  const url = `${BASE}/entries${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

export async function fetchTags(): Promise<string[]> {
  if (DEMO) return DemoData.fetchTags();

  const res = await fetch(`${BASE}/entries/tags`);
  if (!res.ok) throw new Error(`GET entries/tags failed: ${res.status}`);
  return res.json();
}

export async function fetchEntry(id: number): Promise<ApiEntry> {
  if (DEMO) {
    const entry = await DemoData.fetchEntry(id);
    if (!entry) throw new Error(`Entry ${id} not found`);
    return entry;
  }

  const res = await fetch(`${BASE}/entries/${id}`);
  if (!res.ok) throw new Error(`GET entries/${id} failed: ${res.status}`);
  return res.json();
}

export async function createEntry(
  body: { title: string; summary: string; mood: string; tags: string },
  token: string | null,
): Promise<ApiEntry> {
  if (DEMO) return DemoData.createEntry(body);

  const res = await fetch(`${BASE}/entries`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST entries failed: ${res.status}`);
  return res.json();
}

export async function updateEntry(
  id: number,
  body: { title: string; summary: string; mood: string; tags: string },
  token: string | null,
): Promise<ApiEntry> {
  if (DEMO) {
    const updated = await DemoData.updateEntry(id, body);
    if (!updated) throw new Error(`Entry ${id} not found`);
    return updated;
  }

  const res = await fetch(`${BASE}/entries/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT entries/${id} failed: ${res.status}`);
  return res.json();
}

export async function deleteEntry(
  id: number,
  token: string | null,
): Promise<void> {
  if (DEMO) {
    const ok = await DemoData.deleteEntry(id);
    if (!ok) throw new Error(`Entry ${id} not found`);
    return;
  }

  const res = await fetch(`${BASE}/entries/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`DELETE entries/${id} failed: ${res.status}`);
}
