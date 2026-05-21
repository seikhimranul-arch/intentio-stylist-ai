import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getProfile, getUser, upsertProfile, type Budget } from "@/lib/store";
import type { Gender } from "@/data/products";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const STYLES = ["Minimalist","Ethnic","Streetwear","Corporate","Boho","Preppy","Edgy","Casual"];
const NOGOS = ["polyester","bright colors","skinny fit","synthetic","sheer"];
const TOP_SIZES = ["XS","S","M","L","XL","XXL","3XL"];
const BOT_SIZES = ["28","30","32","34","36","38","40","42"];
const SHOE_SIZES = ["5","6","7","8","9","10","11","12"];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<Gender>("neutral");
  const [topSize, setTopSize] = useState("M");
  const [bottomSize, setBottomSize] = useState("32");
  const [shoeSize, setShoeSize] = useState<string | null>(null);
  const [budget, setBudget] = useState<Budget>("mid");
  const [styles, setStyles] = useState<string[]>([]);
  const [noGos, setNoGos] = useState<string[]>([]);
  const [customNoGo, setCustomNoGo] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!getUser()) { navigate({ to: "/login" }); return; }
    const p = getProfile();
    if (p?.onboarded) navigate({ to: "/chat" });
  }, [navigate]);

  const toggleStyle = (s: string) => {
    setStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 3 ? [...prev, s] : prev);
  };
  const toggleNoGo = (n: string) => {
    const l = n.toLowerCase();
    setNoGos(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };
  const addCustomNoGo = () => {
    const v = customNoGo.trim().toLowerCase();
    if (v && !noGos.includes(v)) setNoGos([...noGos, v]);
    setCustomNoGo("");
  };

  const finish = async () => {
    if (!gender) return;
    await upsertProfile({ gender, top_size: topSize, bottom_size: bottomSize, shoe_size: shoeSize, budget, styles, no_gos: noGos, onboarded: true });
    toast.success("Profile saved. Let's style.");
    navigate({ to: "/chat" });
  };

  const progress = (step / 4) * 100;
  const canNext = step === 4 ? styles.length > 0 : true;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 dot-grid-bg opacity-30" />
      <div className="relative w-full max-w-2xl rounded-[20px] border border-border bg-surface p-8 shadow-card">
        {/* progress */}
        <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-border-light/40">
          <div className="h-full bg-gold-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> Style Profile
        </div>
        <h2 className="font-display text-3xl">Step {step} of 4 <span className="text-text-muted text-base">· Takes 30 seconds</span></h2>

        <div className="my-8 min-h-[280px]">
          {step === 1 && (
            <div className="animate-slide-right">
              <h3 className="mb-5 font-display text-2xl">What should I style for?</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {([
                  { v: "men", label: "Menswear", emoji: "👔" },
                  { v: "women", label: "Womenswear", emoji: "👗" },
                  { v: "neutral", label: "Gender-neutral", emoji: "✨" },
                ] as const).map(opt => (
                  <button key={opt.v} onClick={() => setGender(opt.v)}
                    className={`rounded-[16px] border p-5 text-left transition ${gender === opt.v ? "border-accent bg-accent/5" : "border-border bg-background hover:border-border-light"}`}>
                    <div className="text-3xl mb-3">{opt.emoji}</div>
                    <div className="text-sm font-medium">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="animate-slide-right space-y-6">
              <h3 className="font-display text-2xl">Your sizes.</h3>
              <SizeGroup label="Top size" options={TOP_SIZES} value={topSize} onChange={setTopSize} />
              <SizeGroup label="Bottom size" options={BOT_SIZES} value={bottomSize} onChange={setBottomSize} />
              <SizeGroup label="Shoe size" suffix="optional" options={SHOE_SIZES} value={shoeSize ?? ""} onChange={(v) => setShoeSize(v || null)} optional />
            </div>
          )}
          {step === 3 && (
            <div className="animate-slide-right">
              <h3 className="mb-5 font-display text-2xl">Budget per piece.</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {([
                  { v: "value", label: "Value", range: "₹500–₹1,500" },
                  { v: "mid", label: "Mid-range", range: "₹1,500–₹4,000" },
                  { v: "premium", label: "Premium", range: "₹4,000+" },
                ] as const).map(opt => (
                  <button key={opt.v} onClick={() => setBudget(opt.v)}
                    className={`rounded-[16px] border p-5 text-left transition ${budget === opt.v ? "border-accent bg-accent/5" : "border-border bg-background hover:border-border-light"}`}>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">Tier</div>
                    <div className="mt-1 text-base font-medium">{opt.label}</div>
                    <div className="mt-2 text-sm text-text-secondary">{opt.range}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="animate-slide-right space-y-6">
              <div>
                <h3 className="mb-1 font-display text-2xl">Pick your vibes.</h3>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-text-secondary">Max 3 · {styles.length}/3 selected</p>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(s => (
                    <button key={s} onClick={() => toggleStyle(s)}
                      className={`pill border px-4 py-2 text-sm transition ${styles.includes(s) ? "border-accent bg-accent/10 text-accent" : "border-border bg-background hover:border-border-light"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-1 font-display text-2xl">No-gos.</h3>
                <p className="mb-4 text-sm text-text-secondary">Things I should never suggest.</p>
                <div className="flex flex-wrap gap-2">
                  {NOGOS.map(n => (
                    <button key={n} onClick={() => toggleNoGo(n)}
                      className={`pill border px-4 py-2 text-sm transition ${noGos.includes(n) ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-background hover:border-border-light"}`}>
                      {n}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <input value={customNoGo} onChange={e => setCustomNoGo(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomNoGo(); }}}
                    placeholder="Add your own (e.g. 'logos')"
                    className="pill flex-1 border border-border bg-background px-4 py-2 text-sm outline-none focus:border-accent" />
                  <button onClick={addCustomNoGo} className="pill bg-foreground px-5 py-2 text-sm font-medium text-background">Add</button>
                </div>
                {noGos.filter(n => !NOGOS.includes(n)).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {noGos.filter(n => !NOGOS.includes(n)).map(n => (
                      <button key={n} onClick={() => toggleNoGo(n)} className="pill border border-destructive bg-destructive/10 px-3 py-1 text-xs text-destructive">
                        {n} ✕
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => setStep(s => Math.max(1, s - 1))}
            className={`pill px-5 py-2.5 text-sm text-text-secondary hover:text-foreground transition ${step === 1 ? "invisible" : ""}`}>
            ← Back
          </button>
          {step < 4 ? (
            <button onClick={() => canNext && setStep(s => s + 1)}
              className="pill bg-foreground px-6 py-3 text-sm font-medium text-background hover:scale-[1.02] transition-transform">
              Continue →
            </button>
          ) : (
            <button onClick={finish} disabled={styles.length === 0}
              className="pill bg-gold-gradient px-6 py-3 text-sm font-medium text-background disabled:opacity-40 hover:scale-[1.02] transition-transform">
              Start Styling ✦
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SizeGroup({ label, options, value, onChange, suffix, optional }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; suffix?: string; optional?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">{label}</span>
        {suffix && <span className="font-mono text-[10px] uppercase text-text-muted">· {suffix}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {optional && (
          <button onClick={() => onChange("")} className={`pill border px-4 py-2 text-sm transition ${value === "" ? "border-accent bg-accent/10 text-accent" : "border-border bg-background"}`}>Skip</button>
        )}
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)}
            className={`pill border px-4 py-2 text-sm transition ${value === o ? "border-accent bg-accent/10 text-accent" : "border-border bg-background hover:border-border-light"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
