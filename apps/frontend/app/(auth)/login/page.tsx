"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

type Mode = "password" | "magic-link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        setMagicSent(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (magicSent) {
    return (
      <div className="w-full max-w-md px-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-10 text-center shadow-2xl">
          <div className="mb-4 text-4xl">📬</div>
          <h1 className="text-xl font-semibold text-white mb-2">Check your email</h1>
          <p className="text-sm text-zinc-400">
            We sent a sign-in link to <span className="text-white font-medium">{email}</span>.
            Click the link in the email to sign in.
          </p>
          <button
            onClick={() => { setMagicSent(false); setMode("password"); }}
            className="mt-6 text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-6">
      {/* Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-10 shadow-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 mb-4">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cain AIOS</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {mode === "password" ? "Sign in to your account" : "Get a magic link"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Password (only in password mode) */}
          {mode === "password" && (
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                       px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 mt-2"
          >
            {loading
              ? "Signing in…"
              : mode === "password"
                ? "Sign in"
                : "Send magic link"}
          </button>
        </form>

        {/* Mode toggle */}
        <div className="mt-6 text-center">
          {mode === "password" ? (
            <button
              id="toggle-magic-link"
              onClick={() => { setMode("magic-link"); setError(null); }}
              className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors underline underline-offset-2"
            >
              Sign in with a magic link instead
            </button>
          ) : (
            <button
              id="toggle-password"
              onClick={() => { setMode("password"); setError(null); }}
              className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors underline underline-offset-2"
            >
              Sign in with password instead
            </button>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-6 text-center text-xs text-zinc-600">
        Access is by invitation only. Contact your administrator.
      </p>
    </div>
  );
}
