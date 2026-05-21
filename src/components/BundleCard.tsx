import { useState } from "react";
import { type Bundle, inr, setBundleStatus } from "@/lib/store";
import { toast } from "sonner";

export function BundleCard({ bundle, onAdded }: { bundle: Bundle; onAdded?: () => void }) {
  const [inCart, setInCart] = useState(bundle.status === "cart");
  const [pulse, setPulse] = useState(false);

  const addToBag = () => {
    setBundleStatus(bundle.id, "cart");
    setInCart(true);
    setPulse(true);
    setTimeout(() => setPulse(false), 700);
    toast.success("Added to your Intentio Bag ✓  (Showcase cart)");
    onAdded?.();
  };

  return (
    <div className="animate-fade-up overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
      <div className="px-6 pt-5">
        <div className="dotted-top pt-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-text-secondary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent opacity-60" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent opacity-30" />
            <span className="ml-1">Intentio Pick</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">{bundle.items.length} Pieces</span>
        </div>
        <p className="mt-3 font-display text-xl italic leading-snug text-foreground/90">
          "{bundle.summary}"
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">
        {bundle.items.map((item, idx) => (
          <div key={item.product_id} className="animate-fade-up p-5" style={{ animationDelay: `${idx * 120}ms` }}>
            <div className="group relative aspect-[3/4] overflow-hidden rounded-[12px] bg-surface-hover">
              <img src={item.snapshot.image} alt={item.snapshot.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy" />
              <span className="absolute left-3 top-3 pill bg-black/60 px-3 py-1 font-mono text-[10px] tracking-wider text-foreground backdrop-blur">
                {item.role}
              </span>
            </div>
            <div className="mt-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">{item.snapshot.brand}</div>
              <h4 className="mt-1 line-clamp-2 text-base font-medium leading-tight">{item.snapshot.name}</h4>
              <div className="mt-1 text-xs text-text-secondary">{item.snapshot.color} · {item.snapshot.material}</div>
              <div className="mt-2 font-display text-2xl text-gold-gradient">{inr(item.snapshot.price)}</div>
            </div>
            <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs leading-relaxed text-foreground/80">
              <span className="mr-1.5 inline-block h-1 w-1 rounded-full bg-accent align-middle" />
              {item.reason}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">Total</div>
          <div className="font-display text-3xl text-gold-gradient">{inr(bundle.total)}</div>
        </div>
        <button onClick={addToBag} disabled={inCart}
          className={`pill px-7 py-3.5 text-sm font-medium transition ${
            inCart ? "bg-success/20 text-success border border-success/40" : "bg-gold-gradient text-background hover:scale-[1.02]"
          } ${pulse ? "animate-pulse-gold" : ""}`}>
          {inCart ? "In Bag ✓" : "Add to Bag"}
        </button>
      </div>
      <div className="border-t border-border px-6 py-2 text-center font-mono text-[10px] uppercase tracking-wider text-text-muted">
        Showcase cart — no payment required
      </div>
    </div>
  );
}
