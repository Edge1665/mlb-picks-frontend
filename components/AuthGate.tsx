// components/AuthGate.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = { children: React.ReactNode };

export default function AuthGate({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  // simple form state
  const [mode, setMode] = useState<"login" | "signup" | "magic">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setErr(error.message);
  }

  async function handleMagic(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error) setErr(error.message);
    else alert("Check your email for the magic link.");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return <div className="p-6 text-sm">Loading…</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm border rounded-lg p-5 space-y-4">
          <h1 className="text-xl font-semibold text-center">Sign in to MLB Picks</h1>

          <div className="flex gap-2 text-sm justify-center">
            <button
              className={`px-2 py-1 rounded ${mode === "login" ? "bg-black text-white" : "border"}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`px-2 py-1 rounded ${mode === "signup" ? "bg-black text-white" : "border"}`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
            <button
              className={`px-2 py-1 rounded ${mode === "magic" ? "bg-black text-white" : "border"}`}
              onClick={() => setMode("magic")}
            >
              Magic Link
            </button>
          </div>

          <form
            onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleMagic}
            className="space-y-3"
          >
            <div className="space-y-1">
              <label className="text-sm">Email</label>
              <input
                type="email"
                className="w-full border rounded px-2 py-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode !== "magic" && (
              <div className="space-y-1">
                <label className="text-sm">Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-2 py-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {err && <p className="text-red-600 text-sm">{err}</p>}

            <button type="submit" className="w-full bg-black text-white rounded py-2">
              {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Magic Link"}
            </button>
          </form>

          <p className="text-xs text-center text-neutral-500">
            By continuing you agree to the Terms. You can switch between Login / Sign up / Magic Link above.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated view: show sign-out in the header and render app children
  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="text-sm text-neutral-700">Signed in</div>
        <button onClick={handleSignOut} className="text-sm underline">
          Sign out
        </button>
      </div>
      {children}
    </div>
  );
}
