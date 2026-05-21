import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { signIn, signUp, getProfile } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@") || password.length < 4) {
      setError("Enter a valid email and a 4+ character password.");
      return;
    }
    try {
      if (mode === "signup") signUp(email, password);
      else signIn(email, password);
      toast.success(mode === "signup" ? "Welcome to Intentio ✦" : "Signed in");
      const p = getProfile();
      navigate({ to: p?.onboarded ? "/chat" : "/onboarding" });
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 dot-grid-bg opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.12), transparent 70%)" }} />

      <Link to="/" className="absolute left-6 top-6 flex items-center gap-2">
        <span className="font-display text-xl">Intentio</span>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
      </Link>

      <div className="animate-fade-up relative w-full max-w-md rounded-[20px] border border-border bg-surface p-8 shadow-card">
        <div className="dotted-top mb-5 pt-3" />
        <div className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> {mode === "signin" ? "Welcome back" : "Create account"}
        </div>
        <h1 className="mb-2 font-display text-4xl">{mode === "signin" ? "Sign in." : "Get started."}</h1>
        <p className="mb-6 text-sm text-text-secondary">
          {mode === "signin" ? "Pick up where you left off." : "Two fields. Thirty seconds. You're styling."}
        </p>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pill w-full border border-border bg-background px-5 py-3 text-sm outline-none transition focus:border-accent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pill w-full border border-border bg-background px-5 py-3 text-sm outline-none transition focus:border-accent"
          />
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
          )}
          <button type="submit" className="pill w-full bg-foreground py-3 text-sm font-medium text-background transition-transform hover:scale-[1.01]">
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          {mode === "signin" ? "New here? " : "Have an account? "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-accent hover:underline">
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
