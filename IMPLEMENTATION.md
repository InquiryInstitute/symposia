# Symposia Data-Driven Implementation

## Overview

The symposia site has been migrated from hardcoded data to a fully data-driven architecture using Supabase.

## Architecture

### Database
- **Table**: `public.symposia`
- **Migration**: `20260201000000_create_symposia_table.sql`
- **Records**: 3 symposia (Iranian, Absinthe, Buddhist)

### Edge Functions
1. **`/functions/v1/symposia`** - Fetch symposia data
   - `?featured=true` - Get featured symposia
   - `?slug=xxx` - Get single symposium by slug
   
2. **`/functions/v1/create-symposium`** - Generate new symposia from topics
   - Uses LLM to select 6 faculty + 1 heretic
   - Generates speeches using `ask-faculty`
   - Creates symposium record in database

### Static Site (Astro)
- **Build-time data fetching**: Fetches from Supabase during build
- **Environment variables**: 
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY` (GitHub secret required)

## Pages

### Index Page (`/`)
- Dynamically renders featured symposia from Supabase
- Fetches faculty names for display
- Shows "More symposia coming soon" if no data

### Symposium Pages
- `/ayandeh-ye-iran/` - Iranian Symposium
- `/absinthe/` - Absinthe Symposium  
- `/attachment-and-sangha/` - Buddhist Symposium

### Presentation Pages
- `/absinthe/present` - Interactive presentation
- `/attachment-and-sangha/present` - Placeholder (coming soon)

## Setup Instructions

### 1. Database Migration
The migration has been applied. To verify:
```sql
SELECT slug, title, featured FROM public.symposia;
```

### 2. Edge Functions
Both functions are deployed:
- `symposia` - ✅ Deployed
- `create-symposium` - ✅ Deployed

### 3. GitHub Secrets
For GitHub Pages builds, add secret:
- Name: `PUBLIC_SUPABASE_ANON_KEY`
- Value: (Get from Supabase dashboard)

### 4. Local Development
Create `.env` file:
```
PUBLIC_SUPABASE_URL=https://pilmscrodlitdrygabvo.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Usage

### Adding New Symposia

**Option 1: Via Database**
```sql
INSERT INTO public.symposia (id, slug, title, ...) VALUES (...);
```

**Option 2: Via Edge Function**
```bash
curl -X POST https://pilmscrodlitdrygabvo.supabase.co/functions/v1/create-symposium \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"topic": "Your symposium topic here"}'
```

### Updating Existing Symposia
Update records directly in Supabase dashboard or via SQL. The site will pick up changes on next build.

## Testing

### Local Build
```bash
npm run build
```

### Verify Data Fetch
```bash
curl "https://pilmscrodlitdrygabvo.supabase.co/functions/v1/symposia?featured=true" \
  -H "apikey: $ANON_KEY"
```

## Status

✅ Migration applied
✅ Edge functions deployed
✅ Code updated
✅ Pages created
✅ Local build verified
⏳ GitHub secret pending (required for production builds)

## Next Steps

1. Add `PUBLIC_SUPABASE_ANON_KEY` as GitHub secret
2. Trigger rebuild via GitHub Actions
3. Verify live site shows symposia
4. (Optional) Add more symposia via `create-symposium` function
