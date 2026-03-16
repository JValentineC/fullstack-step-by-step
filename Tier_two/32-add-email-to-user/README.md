# Step 32 - Add Email to User

## Goal

Add an **email** column to the User table so every account has an email address on file. Update the registration endpoint to require and validate email, and add an email field to the frontend registration form.

## What You'll Practice

| Skill | How |
|---|---|
| ALTER TABLE / schema migration | Add a new unique column to an existing table |
| Server-side validation | Regex check for valid email format |
| Unique constraints | Prevent duplicate emails in the database |
| Conditional form fields | Show email input only in register mode |
| Demo data sync | Keep DemoData types and dummy JSON in sync with real schema |

## Prerequisites

- Completed **Step 31** (Show Entry Author)
- Familiar with SQL ALTER TABLE and unique constraints
- Understand TypeScript interfaces and form state

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 31-show-entry-author 32-add-email-to-user
cd 32-add-email-to-user
npm install
```

### 2. Add email column to User table

Run this SQL on your database to add the column:

```sql
ALTER TABLE User ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '' AFTER username;
CREATE UNIQUE INDEX User_email_key ON User(email);
```

Update the Prisma schema (`prisma/schema.prisma`) so it stays in sync:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique @db.VarChar(100)
  email     String   @unique @db.VarChar(255)
  password  String   @db.VarChar(255)
  createdAt DateTime @default(now())

  entries Entry[]
}
```

### 3. Update the UserRow type

In `server/lib/db.ts`, add `email` to the interface:

```ts
export interface UserRow extends RowDataPacket {
  id: number
  username: string
  email: string
  password: string
  createdAt: Date
}
```

### 4. Update the auth routes

In `server/routes/auth.ts`:

**Register** — accept email, validate format, check uniqueness, store it:

```ts
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    res.status(400).json({ error: 'username, email, and password are required' })
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    res.status(400).json({ error: 'Invalid email address' })
    return
  }

  // ... check uniqueness of both username AND email
  const [existing] = await pool.execute<UserRow[]>(
    'SELECT id FROM User WHERE username = ? OR email = ?',
    [String(username), String(email)]
  )

  // ... INSERT includes email
  'INSERT INTO User (username, email, password) VALUES (?, ?, ?)'
})
```

**Login** — SELECT email so the response includes it:

```ts
'SELECT id, username, email, password FROM User WHERE username = ?'
```

**`/me`** — query the database for fresh user data instead of just decoding the JWT:

```ts
const [rows] = await pool.execute<UserRow[]>(
  'SELECT id, username, email FROM User WHERE id = ?', [payload.userId]
)
```

### 5. Update frontend AuthUser type

In `src/api/auth.ts`:

```ts
export interface AuthUser {
  id: number;
  username: string;
  email: string;
}
```

Update `register()` to accept and send email:

```ts
export async function register(username: string, email: string, password: string)
```

### 6. Add email field to LoginPage

In `src/components/LoginPage.tsx`, add `email` state and a conditional input that only appears in register mode:

```tsx
const [email, setEmail] = useState("");

{mode === "register" && (
  <div className="form-control">
    <label htmlFor="auth-email" className="label">
      <span className="label-text">Email</span>
    </label>
    <input
      id="auth-email"
      type="email"
      className="input input-bordered w-full"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      autoComplete="email"
      required
    />
  </div>
)}
```

### 7. Update demo layer

Add `email` to `DemoUser` interface, `dummy-users.json`, and all auth return types in `demo-data.ts`.

## Helpful Hints

- **Unique constraint on email** prevents two accounts from registering with the same address.
- The regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` is a simple server-side check — not exhaustive, but catches obvious mistakes.
- The `/me` endpoint now queries the database instead of just decoding the JWT, so it always returns fresh data.

## Do / Don't

| Do | Don't |
|---|---|
| Validate email on the server | Rely only on `type="email"` in the browser |
| Use a UNIQUE index on the email column | Allow duplicate emails |
| Show the email field only in register mode | Show it on login (email isn't needed to log in) |
| Update the demo layer types | Forget to sync DemoUser with the real schema |

## Check Your Work

1. `npm run build` passes with zero errors
2. Register a new account — email field appears and is required
3. Log in — email field is hidden
4. The `/api/auth/me` response includes `email`
5. Demo mode (GitHub Pages) — registration with email works in localStorage

## Stretch

- Add email validation on the frontend with a real-time "invalid email" message
- Show the user's email on a profile/settings page
