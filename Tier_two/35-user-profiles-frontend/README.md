# Step 35 — User Profiles Frontend

## Goal

Add a `/u/:handle` profile route that displays a user's profile card and lets the profile owner edit their display name, bio, and avatar URL.

## What You'll Practice

- Dynamic route parameters with `useParams`
- Conditional rendering based on the logged-in user (owner vs. visitor)
- Calling the profile API (`fetchProfile`, `updateProfile`) built in Step 34
- Keeping `AuthContext` in sync after profile edits
- Building reusable card and form components with daisyUI

## Prerequisites

- Step 34 completed (profile API endpoints and `src/api/users.ts` exist)
- Familiarity with React Router, `useEffect`, and `useState`

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 34-user-profiles-backend 35-user-profiles-frontend
```

Update the folder name and remove files that aren't changing in this step.

---

### 2. Create the ProfilePage component

Create **`src/components/ProfilePage.tsx`**. This single file contains three pieces:

- **`ProfileCard`** — displays avatar (or initial), display name, handle, bio, and join date
- **`EditProfileForm`** — form for display name, bio, and avatar URL
- **`ProfilePage`** — the page shell that fetches the profile, shows the card, and toggles the edit form

```tsx
// src/components/ProfilePage.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";
import { fetchProfile, updateProfile } from "../api/users";
import type { UserProfile } from "../api/users";

function ProfileCard({ profile, isOwner, onEdit }: {
  profile: UserProfile;
  isOwner: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body items-center text-center">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={`${profile.displayName ?? profile.username}'s avatar`}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-neutral text-neutral-content flex items-center justify-center text-3xl font-bold">
            {(profile.displayName ?? profile.username).charAt(0).toUpperCase()}
          </div>
        )}

        <h2 className="card-title text-2xl mt-2">
          {profile.displayName ?? profile.username}
        </h2>
        <p className="text-sm opacity-60">@{profile.handle}</p>

        {profile.bio && <p className="mt-2 max-w-md">{profile.bio}</p>}

        <p className="text-xs opacity-50 mt-2">
          Joined {new Date(profile.createdAt).toLocaleDateString()}
        </p>

        {isOwner && (
          <div className="card-actions mt-4">
            <button type="button" className="btn btn-primary btn-sm" onClick={onEdit}>
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

The **`EditProfileForm`** is a controlled form with three fields:

```tsx
function EditProfileForm({ profile, onSave, onCancel }: {
  profile: UserProfile;
  onSave: (data: { displayName: string; bio: string; avatarUrl: string }) => void;
  onCancel: () => void;
}) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ displayName, bio, avatarUrl });
  }

  return (
    <form onSubmit={handleSubmit} className="card bg-base-200 shadow-md">
      <div className="card-body space-y-4">
        <h3 className="card-title">Edit Profile</h3>
        {/* Display Name, Bio (textarea), Avatar URL inputs */}
        <div className="card-actions justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm">Save</button>
        </div>
      </div>
    </form>
  );
}
```

The **`ProfilePage`** component ties it all together:

```tsx
function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const { user, token, setAuth } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const isOwner = !!(user && handle && user.handle === handle.toLowerCase());

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    fetchProfile(handle)
      .then((p) => setProfile(p))
      .catch(() => setError("User not found."))
      .finally(() => setLoading(false));
  }, [handle]);

  async function handleSave(data: { displayName: string; bio: string; avatarUrl: string }) {
    if (!token) return;
    const updated = await updateProfile(token, {
      displayName: data.displayName || null,
      bio: data.bio || null,
      avatarUrl: data.avatarUrl || null,
    });
    setProfile({ /* updated fields */ });
    // Keep AuthContext in sync
    if (user) {
      setAuth(token, { ...user, displayName: updated.displayName, bio: updated.bio, avatarUrl: updated.avatarUrl });
    }
    setEditing(false);
  }

  // Render: loading → error → ProfileCard or EditProfileForm
}

export default ProfilePage;
```

Key details:
- **`isOwner`** compares the logged-in user's handle to the URL param — only owners see the Edit button.
- After saving, the component updates **both** the local profile state **and** the `AuthContext` so the Header reflects name changes immediately.

---

### 3. Add the profile route to App.tsx

```tsx
// src/App.tsx — add import at the top
import ProfilePage from "./components/ProfilePage";
```

Then add the route inside `<Routes>`:

```tsx
<Route path="/u/:handle" element={<ProfilePage />} />
<Route path="/about" element={<About />} />
```

---

### 4. Link the user's name to their profile in the Header

In **`src/components/Header.tsx`**, replace the plain username display with a NavLink to the profile page.

**Desktop menu** — change the `<em>{user.username}</em>` item to:

```tsx
<li>
  <NavLink to={`/u/${user.handle}`}>
    {user.displayName ?? user.username}
  </NavLink>
</li>
```

**Mobile menu** — replace the `menu-title` item with a clickable link:

```tsx
<li>
  <NavLink to={`/u/${user.handle}`}>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    {user.displayName ?? user.username}
  </NavLink>
</li>
```

---

## Helpful Hints

- **`useParams` returns strings** — the `handle` param is always a string, so comparing it with `user.handle` just works (no `Number()` conversion needed).
- **Empty string → null** — when saving, convert empty strings to `null` so the backend stores `NULL` rather than an empty column.
- **AuthContext sync** — calling `setAuth(token, updatedUser)` after profile edits ensures the Header reflects the new display name instantly without a page reload.
- **Avatar fallback** — the profile card shows the user's first initial in a colored circle when no avatar URL is set.

## Do / Don't

| Do | Don't |
|---|---|
| Compare handles case-insensitively for ownership | Rely on user IDs in the URL (handles are the slug) |
| Update AuthContext after saving profile edits | Forget to sync — the Header would show stale data |
| Use `maxLength` on inputs to match backend limits | Skip client-side length limits and rely only on the API |
| Show a loading state while fetching the profile | Flash an error before the API has responded |

## Check Your Work

1. Run `npm run dev` and open `http://localhost:5173`.
2. Log in with any demo account (e.g. `jvc` / `hashedpassword_demo_jvc2026`).
3. Click your name in the Header — you should land on `/u/jvc` showing the profile card.
4. Click **Edit Profile**, change the display name, and click **Save**.
5. Confirm the Header now shows the updated name.
6. Navigate to `/u/intern-alex` — you should see Alex's profile without an Edit button.
7. Navigate to `/u/nonexistent` — you should see a "User not found" error.

## Stretch

- Add an entry count to the profile card showing how many entries this user has written.
- Add a "Copy profile link" button that copies the `/u/:handle` URL to the clipboard.
