import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getBundle, getCartBundles, getProfile, getUser, signOut,
  generateBundle, type Bundle,
} from "@/lib/store";
import { BundleCard } from "@/components/BundleCard";
import { CartDrawer } from "@/components/CartDrawer";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({ component: ChatPage });

type Msg =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "ai-text"; text: string; variant?: "clarify" | "error" }
  | { id: string; kind: "bundle"; bundle: Bundle };

const PLACEHOLDERS = [
  "Need an outfit for a beach wedding in Goa…",
  "Something sharp for a tech conference in Hyderabad…",
  "Casual day out in Delhi winter…",
  "Job interview in Bengaluru — formal but not boring…",
];

const LOADING_MSGS = [
  "Reading your style profile…",
  "Scanning the catalog…",
  "Styling your look…",
  "Balancing palette and proportion…",
];

function ChatPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [profileEmail, setProfileEmail] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // guard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = getUser();
    if (!u) { navigate({ to: "/login" }); return; }
    const p = getProfile();
    if (!p?.onboarded) { navigate({ to: "/onboarding" }); return; }
    setProfileEmail(u.email);
    setReady(true);
    refreshCart();
    const h = () => refreshCart();
    window.addEventListener("intentio:change", h);
    return () => window.removeEventListener("intentio:change", h);
  }, [navigate]);

  // placeholder rotation
  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // loading text rotation
  useEffect(() => {
    if (!loading) return;
    setLoadingIdx(0);
    const t = setInterval(() => setLoadingIdx(i => (i + 1) % LOADING_MSGS.length), 900);
    return () => clearInterval(t);
  }, [loading]);

  // autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const refreshCart = () => setCartCount(getCartBundles().length);

  const profile = useMemo(() => (ready ? getProfile() : null), [ready, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages(m => [...m, { id: crypto.randomUUID(), kind: "user", text }]);
    setLoading(true);
    try {
      const res = await generateBundle(text);
      if (res.kind === "bundle") {
        const b = getBundle(res.bundleId);
        if (b) setMessages(m => [...m, { id: crypto.randomUUID(), kind: "bundle", bundle: b }]);
      } else if (res.kind === "clarify") {
        setMessages(m => [...m, { id: crypto.randomUUID(), kind: "ai-text", text: res.question, variant: "clarify" }]);
      } else {
        setMessages(m => [...m, { id: crypto.randomUUID(), kind: "ai-text", text: res.message, variant: "error" }]);
      }
    } catch {
      setMessages(m => [...m, { id: crypto.randomUUID(), kind: "ai-text", text: "Something went wrong. Try again.", variant: "error" }]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    signOut();
    toast("Signed out");
    navigate({ to: "/" });
  };

  if (!ready) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-30 h-[60px] border-b border-border">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl">Intentio</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/onboarding" className="pill px-3 py-2 text-xs text-text-secondary hover:text-foreground transition">
              Profile
            </Link>
            <button onClick={() => setCartOpen(true)}
              className="relative pill border border-border bg-surface px-4 py-2 text-sm hover:border-border-light transition">
              <span className="mr-1.5">🛍</span> Bag
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-gradient px-1.5 font-mono text-[10px] font-medium text-background">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={logout} className="pill px-3 py-2 text-xs text-text-secondary hover:text-foreground transition">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-5 py-10 pb-[160px]">
          {messages.length === 0 && !loading && (
            <div className="animate-fade-up py-12 text-center">
              <div className="mb-3 flex justify-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent opacity-60" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent opacity-30" />
              </div>
              <h1 className="font-display text-5xl">What are you looking for?</h1>
              <p className="mt-3 text-text-secondary">Describe any occasion, mood, or scenario.</p>
              {profile && (
                <div className="mt-6 inline-flex items-center gap-2 pill border border-border bg-surface px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                  {profile.gender} · top {profile.top_size} · bottom {profile.bottom_size} · {profile.budget}
                </div>
              )}
            </div>
          )}

          <div className="space-y-5">
            {messages.map(m => {
              if (m.kind === "user") {
                return (
                  <div key={m.id} className="animate-fade-up flex justify-end">
                    <div className="max-w-[80%] rounded-[18px] rounded-br-[6px] border border-border bg-surface px-4 py-3 text-sm">
                      {m.text}
                    </div>
                  </div>
                );
              }
              if (m.kind === "ai-text") {
                const isErr = m.variant === "error";
                return (
                  <div key={m.id} className="animate-fade-up flex">
                    <div className={`max-w-[80%] rounded-[18px] rounded-bl-[6px] border px-4 py-3 text-sm ${
                      isErr ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-accent/30 bg-accent/5"
                    }`}>
                      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                        ✦ Intentio
                      </div>
                      {m.text}
                    </div>
                  </div>
                );
              }
              return <BundleCard key={m.id} bundle={m.bundle} onAdded={refreshCart} />;
            })}

            {loading && (
              <div className="animate-fade-up space-y-4">
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <span className="pulse-dot inline-block h-2.5 w-2.5 rounded-full bg-ai-red" />
                  <span className="font-mono text-[11px] uppercase tracking-wider">{LOADING_MSGS[loadingIdx]}</span>
                </div>
                {/* skeleton bundle */}
                <div className="overflow-hidden rounded-[20px] border border-border bg-surface">
                  <div className="grid grid-cols-3 gap-px bg-border">
                    {[0,1,2].map(i => (
                      <div key={i} className="bg-surface p-5">
                        <div className="shimmer aspect-[3/4] rounded-[12px]" />
                        <div className="shimmer mt-4 h-3 w-2/3 rounded" />
                        <div className="shimmer mt-2 h-3 w-1/3 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="glass border-t border-border">
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-4">
            <div className="relative flex-1">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
                disabled={loading}
                placeholder={PLACEHOLDERS[placeholderIdx]}
                className="pill w-full border border-border bg-surface px-6 py-4 pr-14 text-sm outline-none transition focus:border-accent disabled:opacity-60"
              />
            </div>
            <button onClick={send} disabled={!input.trim() || loading}
              className="grid h-12 w-12 place-items-center rounded-full bg-gold-gradient text-background transition hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
              aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className="border-t border-border/50 py-1 text-center font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Prototype · Showcase only · Not a real store
          </div>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
