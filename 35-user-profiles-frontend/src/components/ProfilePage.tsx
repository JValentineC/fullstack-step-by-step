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

        {profile.bio && (
          <p className="mt-2 max-w-md">{profile.bio}</p>
        )}

        <p className="text-xs opacity-50 mt-2">
          Joined {new Date(profile.createdAt).toLocaleDateString()}
        </p>

        {isOwner && (
          <div className="card-actions mt-4">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onEdit}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Display Name</span>
          </div>
          <input
            type="text"
            className="input input-bordered w-full"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={200}
          />
        </label>

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Bio</span>
          </div>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={2000}
          />
        </label>

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Avatar URL</span>
          </div>
          <input
            type="url"
            className="input input-bordered w-full"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            maxLength={500}
            placeholder="https://example.com/photo.jpg"
          />
        </label>

        <div className="card-actions justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            Save
          </button>
        </div>
      </div>
    </form>
  );
}

function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const { user, token, setAuth } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isOwner = !!(user && handle && user.handle === handle.toLowerCase());

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    setError("");
    fetchProfile(handle)
      .then((p) => setProfile(p))
      .catch(() => setError("User not found."))
      .finally(() => setLoading(false));
  }, [handle]);

  async function handleSave(data: { displayName: string; bio: string; avatarUrl: string }) {
    if (!token) return;
    setSaving(true);
    try {
      const updated = await updateProfile(token, {
        displayName: data.displayName || null,
        bio: data.bio || null,
        avatarUrl: data.avatarUrl || null,
      });
      setProfile({
        id: updated.id,
        username: updated.username,
        handle: updated.handle,
        displayName: updated.displayName,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl,
        createdAt: updated.createdAt,
      });
      // Keep auth context in sync
      if (user) {
        setAuth(token, {
          ...user,
          displayName: updated.displayName,
          bio: updated.bio,
          avatarUrl: updated.avatarUrl,
        });
      }
      setEditing(false);
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
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
        {loading && <p aria-live="polite">Loading profile…</p>}
        {error && (
          <div className="text-center py-8">
            <p className="text-error font-semibold">{error}</p>
            <Link to="/entries" className="btn btn-ghost btn-sm mt-4">
              ← Back to Entries
            </Link>
          </div>
        )}
        {profile && !editing && (
          <div className="max-w-md mx-auto">
            <ProfileCard
              profile={profile}
              isOwner={isOwner}
              onEdit={() => setEditing(true)}
            />
          </div>
        )}
        {profile && editing && (
          <div className="max-w-md mx-auto">
            <EditProfileForm
              profile={profile}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
            {saving && <p aria-live="polite" className="text-center mt-2">Saving…</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ProfilePage;
