export type Category = "top" | "bottom" | "footwear";
export type Gender = "men" | "women" | "neutral";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  image: string;
  price: number; // INR integer
  color: string;
  material: string;
  gender: Gender;
  in_stock: boolean;
  tags: string[]; // for naive intent matching
}

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const PRODUCTS: Product[] = [
  // TOPS
  { id: "t1", name: "Ivory Linen Kurta", brand: "Fabindia", category: "top", image: u("photo-1622445275576-721325763afe"), price: 2499, color: "Ivory", material: "Linen", gender: "men", in_stock: true, tags: ["wedding","ethnic","beach","goa","summer"] },
  { id: "t2", name: "Charcoal Oxford Shirt", brand: "Arrow", category: "top", image: u("photo-1602810318383-e386cc2a3ccf"), price: 1899, color: "Charcoal", material: "Cotton", gender: "men", in_stock: true, tags: ["interview","corporate","formal","office","conference"] },
  { id: "t3", name: "Oversized Graphic Tee", brand: "Bewakoof", category: "top", image: u("photo-1521572163474-6864f9cf17ab"), price: 799, color: "Black", material: "Cotton", gender: "neutral", in_stock: true, tags: ["streetwear","casual","weekend","delhi"] },
  { id: "t4", name: "Floral Anarkali Top", brand: "Biba", category: "top", image: u("photo-1610030469983-98e550d6193c"), price: 2299, color: "Rose", material: "Rayon", gender: "women", in_stock: true, tags: ["ethnic","wedding","festive","boho"] },
  { id: "t5", name: "Merino Wool Sweater", brand: "Allen Solly", category: "top", image: u("photo-1620799140408-edc6dcb6d633"), price: 3499, color: "Camel", material: "Wool", gender: "neutral", in_stock: true, tags: ["winter","delhi","casual","preppy"] },
  { id: "t6", name: "Silk Blouse", brand: "AND", category: "top", image: u("photo-1551488831-00ddcb6c6bd3"), price: 2799, color: "Champagne", material: "Silk", gender: "women", in_stock: true, tags: ["corporate","interview","minimalist","conference"] },

  // BOTTOMS
  { id: "b1", name: "Beige Linen Trousers", brand: "Fabindia", category: "bottom", image: u("photo-1473966968600-fa801b869a1a"), price: 2199, color: "Beige", material: "Linen", gender: "neutral", in_stock: true, tags: ["wedding","beach","goa","summer","minimalist"] },
  { id: "b2", name: "Slim Fit Wool Pants", brand: "Van Heusen", category: "bottom", image: u("photo-1594633312681-425c7b97ccd1"), price: 2499, color: "Navy", material: "Wool blend", gender: "men", in_stock: true, tags: ["interview","corporate","formal","office","conference"] },
  { id: "b3", name: "Wide-Leg Cargo", brand: "H&M", category: "bottom", image: u("photo-1624378439575-d8705ad7ae80"), price: 1799, color: "Olive", material: "Cotton", gender: "neutral", in_stock: true, tags: ["streetwear","weekend","casual","edgy"] },
  { id: "b4", name: "High-Rise Palazzo", brand: "Global Desi", category: "bottom", image: u("photo-1583496661160-fb5886a13d44"), price: 1599, color: "Mustard", material: "Rayon", gender: "women", in_stock: true, tags: ["ethnic","boho","festive","casual"] },
  { id: "b5", name: "Tapered Chinos", brand: "Levi's", category: "bottom", image: u("photo-1542272604-787c3835535d"), price: 2299, color: "Stone", material: "Cotton twill", gender: "men", in_stock: true, tags: ["casual","preppy","weekend","smart"] },
  { id: "b6", name: "Pleated Midi Skirt", brand: "Zara", category: "bottom", image: u("photo-1583496661160-fb5886a13d44"), price: 2599, color: "Black", material: "Polyester crepe", gender: "women", in_stock: true, tags: ["corporate","minimalist","interview","conference"] },

  // FOOTWEAR
  { id: "f1", name: "Leather Kolhapuris", brand: "Paaduks", category: "footwear", image: u("photo-1605733513597-a8f8341084e6"), price: 1899, color: "Tan", material: "Leather", gender: "neutral", in_stock: true, tags: ["wedding","ethnic","beach","goa","boho"] },
  { id: "f2", name: "Oxford Brogues", brand: "Hush Puppies", category: "footwear", image: u("photo-1614252369475-531eba835eb1"), price: 4499, color: "Dark Brown", material: "Leather", gender: "men", in_stock: true, tags: ["interview","corporate","formal","conference"] },
  { id: "f3", name: "Chunky White Sneakers", brand: "Adidas", category: "footwear", image: u("photo-1542291026-7eec264c27ff"), price: 5999, color: "White", material: "Leather/Mesh", gender: "neutral", in_stock: true, tags: ["streetwear","casual","weekend","edgy"] },
  { id: "f4", name: "Block Heel Mules", brand: "Mochi", category: "footwear", image: u("photo-1543163521-1bf539c55dd2"), price: 2799, color: "Nude", material: "Suede", gender: "women", in_stock: true, tags: ["ethnic","corporate","interview","minimalist"] },
  { id: "f5", name: "Suede Chelsea Boots", brand: "Clarks", category: "footwear", image: u("photo-1638247025967-b4e38f787b76"), price: 6499, color: "Sand", material: "Suede", gender: "neutral", in_stock: true, tags: ["winter","delhi","preppy","smart"] },
  { id: "f6", name: "Embellished Juttis", brand: "Fizzy Goblet", category: "footwear", image: u("photo-1606107557195-0e29a4b5b4aa"), price: 1599, color: "Gold", material: "Velvet", gender: "women", in_stock: true, tags: ["ethnic","wedding","festive","boho"] },
];

export function findProducts(intent: string, gender: Gender = "neutral"): Product[] {
  const text = intent.toLowerCase();
  const score = (p: Product) => {
    let s = 0;
    for (const t of p.tags) if (text.includes(t)) s += 3;
    if (p.gender === gender || p.gender === "neutral") s += 1;
    return s;
  };
  const pick = (cat: Category): Product => {
    const list = PRODUCTS.filter(p => p.category === cat && (p.gender === gender || p.gender === "neutral" || gender === "neutral"));
    const sorted = [...list].sort((a, b) => score(b) - score(a));
    return sorted[0] ?? list[0];
  };
  return [pick("top"), pick("bottom"), pick("footwear")];
}
