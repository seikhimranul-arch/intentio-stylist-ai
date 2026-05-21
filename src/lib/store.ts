import { findProducts, type Gender, type Product } from "@/data/products";
import { supabase } from "./supabase";

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

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    const user = { id: data.user.id, email: data.user.email! };
    write(K_USER, user);
    await syncFromSupabase();
    return user;
  }
  return null;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (data.user) {
    const user = { id: data.user.id, email: data.user.email! };
    write(K_USER, user);
    await syncFromSupabase();
    return user;
  }
  return null;
}

export async function signOut() {
  await supabase.auth.signOut();
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(K_USER);
  window.localStorage.removeItem(K_PROFILE);
  window.localStorage.removeItem(K_BUNDLES);
  window.dispatchEvent(new CustomEvent("intentio:change", { detail: K_USER }));
}

// ---- profile ----
export function getProfile(): Profile | null {
  return read(K_PROFILE);
}

export async function upsertProfile(patch: Partial<Profile>) {
  const cur = getProfile();
  const user = getUser();
  if (!user) return null;
  
  const next: Profile = {
    user_id: user.id, email: user.email, gender: "neutral", top_size: "M",
    bottom_size: "32", shoe_size: null, budget: "mid", styles: [], no_gos: [],
    onboarded: false, ...(cur ?? {}), ...patch,
  };
  
  write(K_PROFILE, next);
  
  // Sync to Supabase
  const { error } = await supabase.from('profiles').upsert(next);
  if (error) console.error("Error upserting profile", error);
  
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

export async function setBundleStatus(id: string, status: Bundle["status"]) {
  // Optimistic UI update
  const all = getBundles().map(b => b.id === id ? { ...b, status } : b);
  write(K_BUNDLES, all);
  
  // Sync to Supabase
  const { error } = await supabase.from('bundles').update({ status }).eq('id', id);
  if (error) {
    console.error("Error updating bundle status", error);
    // Revert if failed
    await syncFromSupabase();
  }
}

// ---- generate-bundle ----
export type GenerateResponse =
  | { kind: "bundle"; bundleId: string }
  | { kind: "clarify"; question: string }
  | { kind: "empty"; message: string };

export async function generateBundle(intent: string): Promise<GenerateResponse> {
  const text = intent.trim();
  if (text.length < 4) {
    return { kind: "empty", message: "Tell me a bit more — even one sentence works." };
  }
  
  const { data, error } = await supabase.functions.invoke('generate-bundle', {
    body: { intent: text }
  });

  if (error) {
    console.error("Error invoking edge function", error);
    return { kind: "empty", message: "Sorry, my systems are currently offline. Please try again later." };
  }

  // The Edge Function already created the bundle in the database.
  // We just need to sync it to local storage so the UI can render it.
  if (data?.kind === 'bundle') {
    await syncFromSupabase();
    return { kind: "bundle", bundleId: data.bundleId };
  }

  return data as GenerateResponse;
}

export function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ---- background sync ----
export async function syncFromSupabase() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const user = { id: session.user.id, email: session.user.email! };
  write(K_USER, user);

  // Sync Profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
  if (profile) {
    write(K_PROFILE, profile);
  }

  // Sync Bundles
  const { data: bundles } = await supabase.from('bundles').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (bundles) {
    write(K_BUNDLES, bundles);
  }
}
