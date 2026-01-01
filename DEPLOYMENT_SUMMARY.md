# Deployment Strategy Summary

## What Was Implemented

### ✅ Code Changes

1. **R2 URL Resolution** (`src/lib/r2.js`)
   - Utility function to resolve MP3 file paths to R2 CDN URLs
   - Uses `PUBLIC_R2_CDN_URL` environment variable
   - Falls back to relative paths for local development

2. **Episode Data Layer** (`src/lib/episodes.js`)
   - Wrapper functions that automatically resolve R2 URLs for MP3 files
   - `getEpisodes()` and `getEpisode(slug)` functions
   - Only MP3 files use R2; cover images remain local

3. **Updated Components**
   - Episode pages use R2 URLs for audio files
   - RSS feed uses R2 URLs for podcast enclosures
   - Home page uses R2 URLs for episode listings

### ✅ Configuration Files

1. **`wrangler.toml`** - Cloudflare Pages/Wrangler configuration
2. **`.cloudflare/pages.json`** - Pages deployment metadata
3. **`scripts/upload-to-r2.js`** - Script to upload MP3s to R2

### ✅ Documentation

1. **`DEPLOYMENT.md`** - Comprehensive deployment guide
2. **`QUICK_START.md`** - Quick reference for deployment

## Architecture

```
┌─────────────────┐
│ Cloudflare Pages│  ← Pre-rendered static site
│  (HTML/CSS/JS)  │
└─────────────────┘
         │
         │ References
         ▼
┌─────────────────┐
│  Cloudflare R2  │  ← MP3 files (50MB each)
│  (Object Store) │  ← Free egress!
└─────────────────┘
```

## Key Benefits

1. **Pre-rendered**: All pages are statically generated at build time
2. **Fast**: Cloudflare Pages serves static files globally
3. **Cost-effective**: R2 has free egress (bandwidth) - perfect for large files
4. **Scalable**: R2 can handle unlimited traffic
5. **Separation**: Large media files don't bloat the Pages deployment

## Next Steps

1. **Set up R2 bucket** (see `QUICK_START.md`)
2. **Upload MP3 files** using `pnpm run upload:r2`
3. **Configure environment variable** `PUBLIC_R2_CDN_URL` in Cloudflare Pages
4. **Deploy** via Git integration or Wrangler CLI

## Environment Variables

- **`PUBLIC_R2_CDN_URL`**: Required in production
  - Example: `https://friday-magnetic.xxxxx.r2.dev`
  - Or custom domain: `https://cdn.yourdomain.com`

## File Structure

```
static/
  episode-1.mp3  ← Upload these to R2
  episode-2.mp3  ← Not served by Pages

src/lib/
  episodes.json  ← Episode metadata (fileUrl points to R2)
  episodes.js     ← Resolves R2 URLs
  r2.js          ← R2 URL utility
```

## Notes

- MP3 files in `static/` are **not** deployed to Pages
- Only episode metadata and site assets are deployed
- MP3s must be uploaded separately to R2
- The site will work locally without R2 (uses relative paths)
- Production requires R2 to be configured
