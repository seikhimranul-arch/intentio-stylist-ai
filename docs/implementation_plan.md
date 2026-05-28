# Goal Description
The next phase of Intentio involves transitioning from a small hardcoded dataset to a robust, extensive fashion catalog via a Kaggle database, and resolving our Gemini API rate limits to fully support live traffic without mock bypasses.

## Proposed Changes

### 1. Database Scaling (Kaggle Dataset Integration)
We will expand the current `products` table in Supabase to handle a large-scale Kaggle fashion dataset (e.g., Myntra or H&M catalog).

#### [NEW] `scripts/seed_kaggle_data.ts`
- A script to ingest Kaggle CSV/JSON data.
- Normalize product categories to fit our `TOP`, `BOTTOM`, and `FOOTWEAR` taxonomy.
- Clean and normalize prices, colors, materials, and sizes.
- Batch upload records into Supabase `products` table.

#### [MODIFY] `supabase/schema.sql`
- Add necessary indices to the `products` table on columns `gender`, `category`, `budget`, and `style_tags` to ensure the Edge Function can query thousands of rows efficiently in under 100ms.

### 2. Resolving Gemini Rate Limits
We need to move away from the free tier constraints and optimize our prompt payloads.

#### [MODIFY] `supabase/functions/generate-bundle/index.ts`
- Implement intelligent payload truncation: Instead of sending the entire catalog to the LLM context, we will pre-filter the products using Supabase RPC or advanced Postgres querying, sending only the top 10-15 best matching items to the LLM to choose from.
- Upgrade the Google API key to a paid/production tier.
- Add robust exponential backoff retries for any residual 429 errors.

## Verification Plan

### Automated Tests
- Script a load-test against the `generate-bundle` endpoint simulating 50 concurrent users to verify the LLM rate limit and database query performance.

### Manual Verification
- Re-enable the live LLM (remove mock bypass) and prompt for niche styles (e.g., "Boho beachwear for men") to ensure the Kaggle dataset returns relevant matches.
