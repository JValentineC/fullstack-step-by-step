# Step 33 — Social Schema Migrations

## Goal

Add all the database columns and tables needed for social features: profile fields on User, a visibility column on Entry, and a Friendship table — so the next several steps can focus purely on endpoints and UI.

## What You'll Practice

- Evolving a Prisma schema with new columns and a new model
- Writing ALTER TABLE and CREATE TABLE migration SQL
- Keeping TypeScript types (`UserRow`, `EntryRow`, `FriendshipRow`) in sync with the database
- Updating frontend types (`AuthUser`, `Entry`) to include new fields
- Maintaining the demo layer when data shapes change

## Prerequisites

- Step 32 completed (User table already has `email`)
- phpMyAdmin or MySQL CLI access for running migrations

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 32-add-email-to-user 33-social-schema-migrations
cd 33-social-schema-migrations
npm install
```

### 2. Update the Prisma schema

Add profile fields to User, visibility to Entry, and the Friendship model:

```prisma
// prisma/schema.prisma

model User {
  id          Int      @id @default(autoincrement())
  username    String   @unique @db.VarChar(100)
  email       String   @unique @db.VarChar(255)
  password    String   @db.VarChar(255)
  handle      String   @unique @db.VarChar(100)
  displayName String?  @db.VarChar(200)
  bio         String?  @db.Text
  avatarUrl   String?  @db.VarChar(500)
  createdAt   DateTime @default(now())

  entries Entry[]

  friendshipsA Friendship[] @relation("FriendA")
  friendshipsB Friendship[] @relation("FriendB")
}

model Entry {
  id         Int      @id @default(autoincrement())
  title      String   @db.VarChar(255)
  summary    String   @db.Text
  mood       String   @db.VarChar(50)
  tags       String   @default("") @db.VarChar(500)
  visibility String   @default("PUBLIC") @db.VarChar(20)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  userId Int?
  user   User? @relation(fields: [userId], references: [id])

  @@index([tags], name: "idx_entry_tags")
  @@index([createdAt], name: "idx_entry_created")
  @@index([visibility], name: "idx_entry_visibility")
}

model Friendship {
  id        Int      @id @default(autoincrement())
  userAId   Int
  userBId   Int
  status    String   @default("PENDING") @db.VarChar(20)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userA User @relation("FriendA", fields: [userAId], references: [id])
  userB User @relation("FriendB", fields: [userBId], references: [id])

  @@unique([userAId, userBId])
  @@index([userBId], name: "idx_friendship_userB")
}
```

### 3. Run the migration SQL

Run these statements in phpMyAdmin (or MySQL CLI). Remember to `USE icstarslog;` first:

```sql
-- User profile fields
ALTER TABLE `User`
  ADD COLUMN `handle` VARCHAR(100) NOT NULL DEFAULT '' AFTER `password`,
  ADD COLUMN `displayName` VARCHAR(200) NULL AFTER `handle`,
  ADD COLUMN `bio` TEXT NULL AFTER `displayName`,
  ADD COLUMN `avatarUrl` VARCHAR(500) NULL AFTER `bio`;

-- Backfill handles from usernames (lowercase, hyphens for underscores)
UPDATE `User` SET `handle` = LOWER(REPLACE(username, '_', '-')) WHERE `handle` = '';

-- Unique index on handle
CREATE UNIQUE INDEX `User_handle_key` ON `User` (`handle`);

-- Entry visibility
ALTER TABLE `Entry`
  ADD COLUMN `visibility` VARCHAR(20) NOT NULL DEFAULT 'PUBLIC' AFTER `tags`;

CREATE INDEX `idx_entry_visibility` ON `Entry` (`visibility`);

-- Friendship table
CREATE TABLE `Friendship` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userAId` INT NOT NULL,
  `userBId` INT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Friendship_userAId_userBId_key` (`userAId`, `userBId`),
  INDEX `idx_friendship_userB` (`userBId`),
  CONSTRAINT `Friendship_userAId_fkey` FOREIGN KEY (`userAId`) REFERENCES `User`(`id`),
  CONSTRAINT `Friendship_userBId_fkey` FOREIGN KEY (`userBId`) REFERENCES `User`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Update server TypeScript types

```ts
// server/lib/db.ts — add new fields to UserRow, EntryRow, and add FriendshipRow

export interface UserRow extends RowDataPacket {
  id: number
  username: string
  email: string
  password: string
  handle: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  createdAt: Date
}

export interface EntryRow extends RowDataPacket {
  id: number
  title: string
  summary: string
  mood: string
  tags: string
  visibility: string
  createdAt: Date
  updatedAt: Date
  userId: number | null
}

export interface FriendshipRow extends RowDataPacket {
  id: number
  userAId: number
  userBId: number
  status: string
  createdAt: Date
  updatedAt: Date
}
```

### 5. Update auth routes to handle new User fields

The register endpoint generates a `handle` slug from the username, and login/me return the profile fields:

```ts
// server/routes/auth.ts — register INSERT
const handle = String(username).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
await pool.execute(
  'INSERT INTO User (username, email, password, handle) VALUES (?, ?, ?, ?)',
  [String(username), String(email), hashed, handle]
)
```

Login and `/me` SELECT statements now include `handle, displayName, bio, avatarUrl`.

### 6. Update frontend types

```ts
// src/api/auth.ts
export interface AuthUser {
  id: number
  username: string
  email: string
  handle: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
}
```

```ts
// src/data/entries.ts — add visibility to Entry and ApiEntry
export interface Entry {
  // ... existing fields ...
  visibility: string   // "PUBLIC" | "FRIENDS_ONLY"
}
```

### 7. Update the demo layer

- `DemoUser` gets `handle`, `bio`, `avatarUrl` fields
- `loadLogs` merger adds `visibility: e.visibility ?? 'PUBLIC'`
- `createEntry` defaults `visibility: "PUBLIC"`
- `login`/`register`/`fetchMe` return all profile fields
- `dummy-users.json` gets `handle`, `bio`, `avatarUrl` for each user

## Helpful Hints

- **handle** is a URL-safe slug derived from the username — it's what appears in profile URLs like `/u/jvc`
- **visibility** defaults to `"PUBLIC"` so all existing entries remain visible — no data migration needed
- **Friendship pairs** are normalized: `userAId` is always the smaller id. The `@@unique` constraint prevents duplicate requests.
- This step is **schema-only** — no new API endpoints or UI. Those come in steps 34–40.

## Do / Don't

| Do | Don't |
|---|---|
| Run the migration SQL before deploying the new code | Deploy code that references columns that don't exist yet |
| Backfill handles for existing users | Leave `handle` empty — it's a unique NOT NULL column |
| Use `e.visibility ?? 'PUBLIC'` in the demo merger | Assume all JSON entries already have the `visibility` field |
| Test that login still works after the schema change | Skip testing auth — new columns can break `SELECT *` if types mismatch |

## Check Your Work

1. Run `npm run build` — zero TypeScript errors
2. Log in on the demo site — user object now includes `handle`, `displayName`, `bio`, `avatarUrl`
3. Existing entries still display (visibility defaults to `"PUBLIC"`)
4. Register a new user — handle is generated automatically from username
5. Check `dummy-users.json` — each user has `handle`, `bio`, `avatarUrl` fields

## Stretch

- Write a one-off script that backfills `displayName` from a CSV of real names
- Add a database constraint that ensures `Friendship.userAId < Friendship.userBId` to enforce pair normalization
