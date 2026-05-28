# Intentio Phase 2: Prototype Showcase & AI Scaling

This plan covers two distinct goals based on your request:
1. **Immediate Prototype Showcase**: Implement a frontend mock bypass so you can demo the UI to stakeholders right now without hitting the Gemini API quota.
2. **Phase 2 Development**: A complete architectural upgrade to integrate a massive Kaggle fashion database and rebuild the AI engine to completely eliminate rate limits.

## User Review Required

> [!IMPORTANT]
> Since you need to showcase this *immediately*, please approve this plan by clicking **Approve**. As soon as you do, I will instantly apply the "Demo Bypass" code to your live site so you can use it for your showcase today. 

## Open Questions

- For the Kaggle database, do you have a specific dataset in mind (e.g., the Myntra Fashion Dataset or H&M Dataset)? 
- Do you want to stick with Gemini 2.0 Flash for Phase 2 (by upgrading to a paid Google Cloud billing account), or would you prefer we swap the backend to use OpenAI/Anthropic which have much more stable API limits?

---

## Proposed Changes: Immediate Showcase Fix

To allow you to showcase the frontend right now, I will intercept the AI call in the frontend store and return a beautifully formatted, hardcoded mock outfit.

### Frontend Application

#### [MODIFY] [store.ts](file:///c:/Product%20Sprint/intentio-git/src/lib/store.ts)
- Modify the `generateBundle` function to bypass the Supabase Edge Function.
- Inject a hardcoded "Demo Bundle" containing 3 high-quality items (Linen Shirt, Tapered Chinos, White Sneakers) with generated rationale.
- Save this bundle directly to local storage so the Chat UI renders it perfectly with shimmering animations and correct cart logic.

---

## Proposed Changes: Phase 2 Development (Next Steps)

Once the showcase is complete, we will begin Phase 2 to build a production-ready, scalable backend.

### 1. Kaggle Database Integration (Supabase)
Currently, the Edge function fails because the dummy database only has 20 items. We will fix this by injecting thousands of real products.
- **Dataset Parsing**: Create a Node.js/Python script to download and parse a Kaggle fashion CSV dataset.
- **Data Normalization**: Map the Kaggle columns to our Supabase schema (`name`, `brand`, `category`, `price`, `gender`, `image_url`).
- **Batch Insertion**: Bulk upload 10,000+ items into the Supabase `products` table using the Supabase Admin SDK.

### 2. RAG Architecture (Vector Search)
Passing thousands of items to an LLM will break the context window and cause massive rate limits. We will implement **Retrieval-Augmented Generation (RAG)**.
- **pgvector**: Enable the `pgvector` extension in Supabase.
- **Embeddings**: Generate vector embeddings for every product in the Kaggle database based on its style, material, and category.
- **Semantic Search**: When a user asks for "Goa vibe sunny", the database will perform a vector similarity search to instantly retrieve the top 20 most relevant items *before* calling the AI.

### 3. Bulletproof AI Edge Function
- **Token Optimization**: By only passing the top 20 vector-matched items to Gemini (instead of the whole catalog), we reduce the token usage by 95%, drastically lowering the chance of hitting 429 Rate Limits.
- **Provider Fallbacks**: Implement a fallback mechanism in the Edge Function so if Gemini throws a 429, it silently switches to OpenAI (gpt-4o-mini) to ensure the user *always* gets an outfit.

## Verification Plan

### Immediate Prototype
- Verify the "casual day out" prompt instantly returns the mocked bundle.
- Verify the UI animations, Cart Drawer, and total pricing calculate correctly.

### Phase 2
- Verify Supabase contains 10,000+ products with vector embeddings.
- Test the Edge function locally using the Supabase CLI to confirm it retrieves items via pgvector and successfully generates an outfit without hitting rate limits.
