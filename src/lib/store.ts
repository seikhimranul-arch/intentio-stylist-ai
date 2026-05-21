// LocalStorage-backed mock store for auth, profile, bundles
import { findProducts, type Gender, type Product } from "@/data/products";

export type Budget = "value" | "mid" | "premium";

export interface Profile {
  user_id: string;
  email: string;
  gender: Gender;
  top_size: string;
  bottom_size: string;
  shoe_size: string | null;
  budget: Budget;
  styles: string[];
  no_gos: string[];
  onboarded: boolean;
}

export interface BundleItem {
  product_id: string;
  role: "TOP" | "BOTTOM" | "FOOTWEAR";
  reason: string;
  snapshot: {
    name: string;
    brand: string;
    price: number;
    image: string;
    color: string;
    material: string;
    category: string;
  };
}

export interface Bundle {
  id: string;
  user_id: string;
  intent: string;
  summary: string;
  items: BundleItem[];
  total: number;
  status: "history" | "cart" | "purchased";
  created_at: string;
}

const K_USER = "intentio.user";
const K_PROFILE = "intentio.profile";
const K_BUNDLES = "intentio.bundles";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(key);
  return v ? (JSON.parse(v) as T) : null;
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("intentio:change", { detail: key }));
}

// ---- auth ----
export function getUser(): { id: string; email: string } | null {
  return read(K_USER);
}
export function signUp(email: string, _password: string) {
  const user = { id: crypto.randomUUID(), email };
  write(K_USER, user);
  // create blank profile
  const p: Profile = {
    user_id: user.id, email, gender: "neutral", top_size: "M", bottom_size: "32",
    shoe_size: null, budget: "mid", styles: [], no_gos: [], onboarded: false,
  };
  write(K_PROFILE, p);
  return user;
}
export function signIn(email: string, _password: string) {
  let user = getUser();
  if (!user || user.email !== email) {
    user = { id: crypto.randomUUID(), email };
    write(K_USER, user);
    const existing = getProfile();
    if (!existing || existing.email !== email) {
      const p: Profile = {
        user_id: user.id, email, gender: "neutral", top_size: "M", bottom_size: "32",
        shoe_size: null, budget: "mid", styles: [], no_gos: [], onboarded: false,
      };
      write(K_PROFILE, p);
    }
  }
  return user;
}
export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(K_USER);
  window.dispatchEvent(new CustomEvent("intentio:change", { detail: K_USER }));
}

// ---- profile ----
export function getProfile(): Profile | null {
  return read(K_PROFILE);
}
export function upsertProfile(patch: Partial<Profile>) {
  const cur = getProfile();
  const user = getUser();
  if (!user) return null;
  const next: Profile = {
    user_id: user.id, email: user.email, gender: "neutral", top_size: "M",
    bottom_size: "32", shoe_size: null, budget: "mid", styles: [], no_gos: [],
    onboarded: false, ...(cur ?? {}), ...patch,
  };
  write(K_PROFILE, next);
  return next;
}

// ---- bundles ----
export function getBundles(): Bundle[] {
  return read<Bundle[]>(K_BUNDLES) ?? [];
}
export function getBundle(id: string): Bundle | undefined {
  return getBundles().find(b => b.id === id);
}
export function getCartBundles(): Bundle[] {
  return getBundles().filter(b => b.status === "cart");
}
export function setBundleStatus(id: string, status: Bundle["status"]) {
  const all = getBundles().map(b => b.id === id ? { ...b, status } : b);
  write(K_BUNDLES, all);
}

// ---- mock generate-bundle ----
export type GenerateResponse =
  | { kind: "bundle"; bundleId: string }
  | { kind: "clarify"; question: string }
  | { kind: "empty"; message: string };

const REASONS: Record<"TOP" | "BOTTOM" | "FOOTWEAR", (p: Product, intent: string) => string> = {
  TOP: (p) => `${p.material.toLowerCase()} in ${p.color.toLowerCase()} sets a refined, occasion-ready tone without trying too hard.`,
  BOTTOM: (p) => `Balances the top with a clean ${p.color.toLowerCase()} ${p.material.toLowerCase()} cut — versatile and comfortable.`,
  FOOTWEAR: (p) => `${p.brand} ${p.name.toLowerCase()} ties the look together and reads intentional, not generic.`,
};

export async function generateBundle(intent: string): Promise<GenerateResponse> {
  await new Promise(r => setTimeout(r, 1800 + Math.random() * 800));
  const text = intent.trim();
  if (text.length < 4) {
    return { kind: "empty", message: "Tell me a bit more — even one sentence works." };
  }
  if (text.split(/\s+/).length < 3 && !/wedding|interview|date|party|office/i.test(text)) {
    return { kind: "clarify", question: "Got it — is this for a formal occasion, a casual day out, or something in between?" };
  }
  const profile = getProfile();
  const gender = profile?.gender ?? "neutral";
  const picks = findProducts(text, gender);

  const items: BundleItem[] = picks.map((p, i) => {
    const role = (["TOP","BOTTOM","FOOTWEAR"] as const)[i];
    return {
      product_id: p.id, role,
      reason: REASONS[role](p, text),
      snapshot: {
        name: p.name, brand: p.brand, price: p.price, image: p.image,
        color: p.color, material: p.material, category: p.category,
      },
    };
  });
  const total = items.reduce((s, it) => s + it.snapshot.price, 0);
  const user = getUser();
  const bundle: Bundle = {
    id: crypto.randomUUID(),
    user_id: user?.id ?? "anon",
    intent: text,
    summary: buildSummary(text, items),
    items, total, status: "history",
    created_at: new Date().toISOString(),
  };
  const all = getBundles();
  all.unshift(bundle);
  write(K_BUNDLES, all);
  return { kind: "bundle", bundleId: bundle.id };
}

function buildSummary(intent: string, items: BundleItem[]) {
  const palette = items.map(i => i.snapshot.color.toLowerCase()).join(", ");
  return `For "${intent.replace(/"/g, "'")}" — a ${palette} palette that feels considered, weather-aware, and unmistakably you.`;
}

export function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
