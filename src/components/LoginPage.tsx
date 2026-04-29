import { useState } from "react";
import { User, Lock, AlertCircle, Loader2 } from "lucide-react";
import { login } from "../services/auth";

interface LoginPageProps {
  isDark: boolean;
  onLogin: () => void;
}

export function LoginPage({ isDark, onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        onLogin();
      } else {
        setError(result.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 blur-3xl opacity-30"
        style={{
          background: isDark
            ? "radial-gradient(circle, #4a1a4a 0%, transparent 70%)"
            : "radial-gradient(circle, #b91372 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 blur-3xl opacity-20"
        style={{
          background: isDark
            ? "radial-gradient(circle, #b91372 0%, transparent 70%)"
            : "radial-gradient(circle, #4a1a4a 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-3xl opacity-10"
        style={{
          background: "radial-gradient(circle, #b91372 0%, transparent 70%)",
        }}
      />

      {/* Login Card */}
      <div
        className="w-full max-w-md shadow-2xl p-8 md:p-12 relative z-10 backdrop-blur-sm"
        style={{
          backgroundColor: isDark
            ? "rgba(10, 17, 40, 0.8)"
            : "rgba(255, 255, 255, 0.9)",
          border: `1px solid ${
            isDark ? "rgba(74, 26, 74, 0.3)" : "rgba(185, 19, 114, 0.2)"
          }`,
        }}
      >
        {/* Logo/Icon Area */}
        <div className="flex justify-center mb-8">
          <div
            className="w-20 h-20 flex items-center justify-center"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)"
                : "linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)",
            }}
          >
            <User className="w-10 h-10 text-white" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-8">
            <h1
              className="text-4xl mb-2"
              style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
            >
              Hello
            </h1>
            <p
              className="text-sm opacity-60"
              style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
            >
              Sign into your Account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-3 flex items-center gap-2 text-sm"
              style={{
                backgroundColor: isDark
                  ? "rgba(185, 19, 114, 0.2)"
                  : "rgba(185, 19, 114, 0.1)",
                border: "1px solid rgba(185, 19, 114, 0.5)",
                color: isDark ? "#ff6b9d" : "#b91372",
              }}
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm opacity-75"
              style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
            >
              Username
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50"
                style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
              />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-12 pr-4 py-4 transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: isDark
                    ? "rgba(74, 26, 74, 0.2)"
                    : "rgba(185, 19, 114, 0.1)",
                  color: isDark ? "#f5f0ff" : "#0a1128",
                  border: isDark
                    ? "1px solid rgba(74, 26, 74, 0.3)"
                    : "1px solid rgba(185, 19, 114, 0.3)",
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm opacity-75"
              style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50"
                style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
              />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-12 pr-4 py-4 transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: isDark
                    ? "rgba(74, 26, 74, 0.2)"
                    : "rgba(185, 19, 114, 0.1)",
                  color: isDark ? "#f5f0ff" : "#0a1128",
                  border: isDark
                    ? "1px solid rgba(74, 26, 74, 0.3)"
                    : "1px solid rgba(185, 19, 114, 0.3)",
                }}
              />
            </div>
            <div className="mt-2 text-right">
              <button
                type="button"
                className="text-sm opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: isDark ? "#b91372" : "#4a1a4a" }}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 transition-all hover:scale-105 hover:shadow-lg text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)"
                : "linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>

          <div className="text-center mt-6">
            <p
              className="text-sm opacity-60"
              style={{ color: isDark ? "#f5f0ff" : "#0a1128" }}
            >
              Don't have an account?{" "}
              <button
                type="button"
                className="opacity-100 hover:underline"
                style={{ color: isDark ? "#b91372" : "#4a1a4a" }}
              >
                Register Now
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
