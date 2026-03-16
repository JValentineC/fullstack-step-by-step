import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login, register } from "../api/auth";
import Header from "./Header";
import Footer from "./Footer";

const DEMO = !import.meta.env.VITE_API_URL;

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const errorRef = useRef<HTMLParagraphElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result =
        mode === "login"
          ? await login(username, password)
          : await register(username, password);

      setAuth(result.token, result.user);
      navigate("/entries");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      // Focus the error message so screen readers announce it
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setSubmitting(false);
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
        <h2 className="text-3xl font-bold mb-4">
          {mode === "login" ? "Log In" : "Register"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          <div className="form-control">
            <label htmlFor="auth-username" className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              id="auth-username"
              type="text"
              className="input input-bordered w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="auth-password" className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              id="auth-password"
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              minLength={8}
              required
            />
          </div>

          {error && (
            <div ref={errorRef} tabIndex={-1} className="alert alert-error">
              <span role="alert">{error}</span>
            </div>
          )}

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? "Please wait…"
                : mode === "login"
                  ? "Log In"
                  : "Register"}
            </button>
          </div>
        </form>

        <p className="mt-4">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Log In
              </button>
            </>
          )}
        </p>

        {DEMO && (
          <div className="alert alert-info mt-6 max-w-sm">
            <div>
              <h3 className="font-bold text-sm mb-2">
                🎓 Demo Mode — Sample Credentials
              </h3>
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>jvc</td>
                    <td>hashedpassword_demo_jvc2026</td>
                    <td>admin</td>
                  </tr>
                  <tr>
                    <td>intern_alex</td>
                    <td>hashedpassword_demo_alex2026</td>
                    <td>intern</td>
                  </tr>
                  <tr>
                    <td>intern_maya</td>
                    <td>hashedpassword_demo_maya2026</td>
                    <td>intern</td>
                  </tr>
                  <tr>
                    <td>intern_dev</td>
                    <td>hashedpassword_demo_dev2026</td>
                    <td>intern</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs mt-2 opacity-70">
                Or register a new account — it&apos;s saved in your browser.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default LoginPage;
