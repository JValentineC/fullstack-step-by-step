import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool, type UserRow } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/users — directory listing with optional search (auth required)
router.get("/", requireAuth, async (req, res) => {
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";

  let sql = `
    SELECT u.id, u.username, u.handle, u.displayName, u.bio, u.avatarUrl, u.createdAt,
           COUNT(e.id) AS entryCount
    FROM \`User\` u
    LEFT JOIN \`Entry\` e ON e.userId = u.id`;

  const params: string[] = [];

  if (search) {
    sql += `
    WHERE u.username LIKE ? OR u.handle LIKE ? OR u.displayName LIKE ?`;
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  sql += `
    GROUP BY u.id
    ORDER BY u.username ASC`;

  const [rows] = await pool.execute<(UserRow & RowDataPacket)[]>(sql, params);

  res.json(
    rows.map((r: any) => ({
      id: r.id,
      username: r.username,
      handle: r.handle,
      displayName: r.displayName,
      bio: r.bio,
      avatarUrl: r.avatarUrl,
      createdAt: r.createdAt,
      entryCount: Number(r.entryCount),
    })),
  );
});

// GET /api/users/:handle — public profile lookup
router.get("/:handle", async (req, res) => {
  const handle = String(req.params.handle).toLowerCase();

  const [rows] = await pool.execute<UserRow[]>(
    "SELECT id, username, email, handle, displayName, bio, avatarUrl, createdAt FROM `User` WHERE handle = ?",
    [handle],
  );

  if (rows.length === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const u = rows[0];
  res.json({
    id: u.id,
    username: u.username,
    handle: u.handle,
    displayName: u.displayName,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
  });
});

// PUT /api/users/me/profile — update own profile (auth required)
router.put("/me/profile", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { displayName, bio, avatarUrl } = req.body;

  // Validate lengths
  if (
    displayName !== undefined &&
    displayName !== null &&
    String(displayName).length > 200
  ) {
    res
      .status(400)
      .json({ error: "displayName must be 200 characters or fewer" });
    return;
  }
  if (bio !== undefined && bio !== null && String(bio).length > 2000) {
    res.status(400).json({ error: "bio must be 2000 characters or fewer" });
    return;
  }
  if (
    avatarUrl !== undefined &&
    avatarUrl !== null &&
    String(avatarUrl).length > 500
  ) {
    res
      .status(400)
      .json({ error: "avatarUrl must be 500 characters or fewer" });
    return;
  }

  await pool.execute<ResultSetHeader>(
    "UPDATE `User` SET displayName = ?, bio = ?, avatarUrl = ? WHERE id = ?",
    [
      displayName != null ? String(displayName) : null,
      bio != null ? String(bio) : null,
      avatarUrl != null ? String(avatarUrl) : null,
      userId,
    ],
  );

  // Return updated profile
  const [rows] = await pool.execute<UserRow[]>(
    "SELECT id, username, email, handle, displayName, bio, avatarUrl, createdAt FROM `User` WHERE id = ?",
    [userId],
  );

  const u = rows[0];
  res.json({
    id: u.id,
    username: u.username,
    email: u.email,
    handle: u.handle,
    displayName: u.displayName,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
  });
});

export default router;
