import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      // Example: save JWT token
      localStorage.setItem("token", res.data.token);

      alert(`Welcome back, ${res.data.user?.name || email}!`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <LogIn className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Sign in
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition
                  placeholder:text-slate-400
                  focus:ring-4 focus:ring-slate-200
                  ${
                    errors.email
                      ? "border-red-400"
                      : "border-slate-300 focus:border-slate-900"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition
                  placeholder:text-slate-400
                  focus:ring-4 focus:ring-slate-200
                  ${
                    errors.password
                      ? "border-red-400"
                      : "border-slate-300 focus:border-slate-900"
                  }`}
                />
                <button
                  type="button"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-50"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
