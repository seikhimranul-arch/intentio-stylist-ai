import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Landing });

function GoldDot({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full bg-accent ${className}`} />;
}

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* dot grid */}
      <div className="absolute inset-0 dot-grid-bg opacity-60 pointer-events-none" />
      {/* ambient gold glow */}
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.18), transparent 70%)" }} />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-tight">Intentio</span>
          <GoldDot />
        </div>
        <Link to="/login" className="text-sm text-text-secondary hover:text-foreground transition-colors">
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-24 pt-10 md:grid-cols-2 md:pt-20">
        <div className="animate-fade-up">
          <div className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-text-secondary">
            <GoldDot /> AI Stylist · India
          </div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Tell me what you need.
            <br />
            <span className="italic text-gold-gradient">I'll style you.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-text-secondary md:text-lg">
            One sentence. One complete outfit. Describe a wedding, an interview, a weekend — get a curated look in seconds.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Link to="/login" className="pill inline-flex items-center gap-2 bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.02]">
              Get Started <span aria-hidden>→</span>
            </Link>
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
              Free · No credit card · AI prototype
            </span>
          </div>
        </div>

        {/* Floating preview cards */}
        <div className="relative h-[520px]">
          {/* Intent card */}
          <div className="animate-fade-up absolute right-0 top-0 w-[300px] rounded-[20px] border border-border bg-surface p-5 shadow-card" style={{ animationDelay: "0.1s" }}>
            <div className="dotted-top pt-3" />
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
              <GoldDot /> Intent
            </div>
            <p className="font-display text-lg italic leading-snug text-foreground">
              "Beach wedding in Goa, late evening, breezy and elegant."
            </p>
          </div>

          {/* Bundle preview card */}
          <div className="animate-fade-up absolute bottom-0 left-0 w-[340px] rounded-[20px] border border-border bg-surface p-5 shadow-card" style={{ animationDelay: "0.3s" }}>
            <div className="dotted-top pt-3" />
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                <GoldDot /> Intentio Pick
              </div>
              <div className="font-mono text-[10px] text-text-muted">3 ITEMS</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { src: "https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=300&q=80", label: "TOP", price: "₹2,499" },
                { src: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=300&q=80", label: "BOTTOM", price: "₹2,199" },
                { src: "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&w=300&q=80", label: "FEET", price: "₹1,899" },
              ].map((it, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-border">
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface-hover">
                    <img src={it.src} alt="" className="h-full w-full object-cover" />
                    <span className="absolute left-1 top-1 rounded-full bg-black/70 px-2 py-0.5 font-mono text-[9px] tracking-wider text-foreground backdrop-blur">{it.label}</span>
                  </div>
                  <div className="p-1.5 text-center font-mono text-[10px] text-accent">{it.price}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">Total</span>
              <span className="font-display text-lg text-gold-gradient">₹6,597</span>
            </div>
          </div>

          {/* Decorative dot cluster */}
          <div className="absolute right-10 bottom-32 grid grid-cols-4 gap-2 opacity-40">
            {Array.from({ length: 16 }).map((_, i) => <GoldDot key={i} />)}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <GoldDot /> Intentio · Prototype · Not a real store
        </div>
      </footer>
    </div>
  );
}
