// components/AuthGate.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

type Props = { children: React.ReactNode };

export default function AuthGate({ children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  // UI state
  const [tab, setTab] = useState<"login" | "signup" | "magic">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // get current session
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => {
      sub.subscription?.unsubscribe();
      mounted = false;
    };
  }, []);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setErr(error.message);
  }

  async function onMagic(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error) setErr(error.message);
    else alert("Check your email for the magic link.");
  }

  async function onSignOut() {
    await supabase.auth.signOut();
    // hard refresh to ensure state/UI resets across pages
    router.replace("/");
    if (typeof window !== "undefined") window.location.reload();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-sm text-neutral-600">Loading…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl shadow-2xl bg-white/95 backdrop-blur border border-slate-200">
          <div className="px-6 pt-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-black text-white grid place-items-center font-bold">MLB</div>
              <h1 className="text-lg font-semibold">MLB Picks</h1>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              Sign in to see today’s HR & hits projections.
            </p>
          </div>

          {/* Tabs */}
          <div className="px-4 mt-4">
            <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 text-sm">
              {(["login", "signup", "magic"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`py-2 rounded-lg transition ${
                    tab === t ? "bg-white shadow font-medium" : "text-slate-600"
                  }`}
                >
                  {t === "login" ? "Login" : t === "signup" ? "Sign Up" : "Magic Link"}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={tab === "login" ? onLogin : tab === "signup" ? onSignup : onMagic}
            className="px-6 py-6 space-y-4"
          >
            <div>
              <label className="text-sm text-neutral-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="you@email.com"
              />
            </div>

            {tab !== "magic" && (
              <div>
                <label className="text-sm text-neutral-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="••••••••"
                />
              </div>
            )}

            {err && <div className="text-sm text-red-600">{err}</div>}

            <button
              type="submit"
              className="w-full rounded-lg bg-black text-white py-2.5 hover:opacity-90 transition"
            >
              {tab === "login" ? "Sign In" : tab === "signup" ? "Create Account" : "Send Magic Link"}
            </button>

            <p className="text-[11px] text-center text-neutral-500">
              You can switch tabs above anytime.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated: small top bar with signout, then content
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-black text-white grid place-items-center text-xs font-bold">
              MLB
            </div>
            <div className="text-sm text-neutral-700">Picks Dashboard</div>
          </div>
          <button onClick={onSignOut} className="text-sm underline hover:no-underline">
            Sign out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
