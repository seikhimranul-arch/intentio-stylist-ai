import { useEffect, useState } from "react";
import { getCartBundles, inr, setBundleStatus, type Bundle } from "@/lib/store";
import { toast } from "sonner";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cart, setCart] = useState<Bundle[]>([]);

  const refresh = () => setCart(getCartBundles());

  useEffect(() => {
    if (!open) return;
    refresh();
    const h = () => refresh();
    window.addEventListener("intentio:change", h);
    return () => window.removeEventListener("intentio:change", h);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const grandTotal = cart.reduce((s, b) => s + b.total, 0);

  const remove = (id: string) => {
    setBundleStatus(id, "history");
    refresh();
    toast("Removed from bag");
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-up" style={{ animationDuration: "0.2s" }} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-surface border-l border-border animate-slide-right">
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-text-secondary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> Your Bag
            </div>
            <div className="mt-1 font-display text-2xl">{cart.length} {cart.length === 1 ? "look" : "looks"}</div>
          </div>
          <button onClick={onClose} className="pill h-9 w-9 border border-border text-text-secondary hover:text-foreground hover:border-border-light transition">✕</button>
        </header>
        <div className="px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
          Showcase cart — no real payments
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 && (
            <div className="py-16 text-center">
              <div className="font-display text-xl text-text-secondary">Bag is empty.</div>
              <p className="mt-2 text-sm text-text-muted">Add a styled look from the chat to see it here.</p>
            </div>
          )}
          {cart.map(b => (
            <div key={b.id} className="rounded-[16px] border border-border bg-background p-4">
              <p className="font-display italic text-foreground/90 line-clamp-2 text-sm">"{b.intent}"</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {b.items.map(it => (
                  <div key={it.product_id} className="overflow-hidden rounded-md border border-border bg-surface-hover">
                    <div className="aspect-[3/4]">
                      <img src={it.snapshot.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="p-1 text-center font-mono text-[9px] text-text-secondary">{inr(it.snapshot.price)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-display text-lg text-gold-gradient">{inr(b.total)}</span>
                <button onClick={() => remove(b.id)} className="text-xs text-text-secondary hover:text-destructive transition">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <footer className="border-t border-border px-6 py-5 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">Grand Total</span>
            <span className="font-display text-3xl text-gold-gradient">{inr(grandTotal)}</span>
          </div>
          <button disabled className="pill w-full bg-border-light/30 py-3 text-sm font-medium text-text-secondary cursor-not-allowed">
            Checkout coming soon
          </button>
        </footer>
      </aside>
    </div>
  );
}
