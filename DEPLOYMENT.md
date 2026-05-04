# Deployment Guide

This guide covers deploying Friday Magnetic to Cloudflare Pages with R2 for MP3 storage.

## Overview

- **Static Site**: Pre-rendered SvelteKit site deployed to Cloudflare Pages
- **MP3 Storage**: Large audio files stored in Cloudflare R2 (object storage)
- **CDN**: R2 files served via public bucket URL or custom domain

## Prerequisites

1. Cloudflare account
2. `wrangler` CLI installed: `npm install -g wrangler` or `pnpm add -g wrangler`
3. Cloudflare API token or logged in via `wrangler login`

## Step 1: Set Up R2 Bucket

### Create R2 Bucket

```bash
# Create a new R2 bucket in the EU jurisdiction
wrangler r2 bucket create friday-magnetic --jurisdiction eu

# Or use the Cloudflare dashboard:
# 1. Go to R2 in Cloudflare dashboard
# 2. Create bucket named "friday-magnetic" with location: EU
# 3. Attach a custom domain (or enable r2.dev public access)
```

> **Note:** This project's bucket lives in the EU jurisdiction. Every
> `wrangler r2 …` command you run against it needs `--jurisdiction eu`,
> otherwise Cloudflare reports "The specified bucket does not exist."
> The upload script picks this up automatically from `R2_JURISDICTION`
> in `.env`.

### Configure Public Access

You have two options for serving files from R2:

#### Option A: Public Bucket (Easiest)

1. In Cloudflare dashboard, go to R2 → your bucket
2. Click "Settings" → "Public Access"
3. Enable public access
4. Note the public URL (e.g., `https://friday-magnetic.your-account-id.r2.cloudflarestorage.com`)
5. Or use the R2.dev subdomain if available

#### Option B: Custom Domain (Recommended for Production)

1. In R2 bucket settings, configure a custom domain
2. This gives you a cleaner URL like `https://cdn.yourdomain.com`
3. Requires DNS configuration in Cloudflare

### Upload MP3 Files

MP3 files live in `./media/` (gitignored, never bundled into the Pages
build). Upload them to R2 with the bundled script:

```bash
pnpm run upload:r2
```

Or manually:

```bash
wrangler r2 object put friday-magnetic/episode-1.mp3 \
  --file=./media/episode-1.mp3 --jurisdiction eu --remote
```

You can also use the Cloudflare dashboard to upload files.

## Step 2: Configure Environment Variables

### For Local Development

Create a `.env` file (copy from `.env.example`):

```bash
R2_BUCKET=friday-magnetic
R2_JURISDICTION=eu
PUBLIC_R2_CDN_URL=https://static.fm.babicz.hu
CLOUDFLARE_API_TOKEN=<token-with-r2-edit>
```

Generate the API token at <https://dash.cloudflare.com/profile/api-tokens>
with **Account → Workers R2 Storage → Edit** scoped to your account.

### For Cloudflare Pages

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Go to Settings → Environment Variables
3. Add `PUBLIC_R2_CDN_URL` with your R2 public URL

**Important**: The `PUBLIC_` prefix makes the variable available to client-side code in SvelteKit.

## Step 3: Deploy to Cloudflare Pages

### Option A: Git Integration (Recommended)

1. Connect your GitHub/GitLab repository to Cloudflare Pages
2. Configure build settings:
   - **Build command**: `pnpm build`
   - **Build output directory**: `build`
   - **Root directory**: `/` (or leave empty)
3. Add environment variable `PUBLIC_R2_CDN_URL` in Pages settings
4. Deploy!

### Option B: Wrangler CLI

```bash
# Build the site
pnpm build

# Deploy to Cloudflare Pages
wrangler pages deploy build --project-name=friday-magnetic
```

### Option C: Cloudflare Dashboard

1. Go to Cloudflare Dashboard → Pages
2. Create a new project
3. Upload the `build` directory
4. Configure environment variables

## Step 4: Verify Deployment

1. Visit your Cloudflare Pages URL
2. Check that episodes load correctly
3. Verify MP3 files are served from R2 (check network tab)
4. Test RSS feed at `/rss.xml`
5. Verify audio playback works

## Step 5: Add New Episodes

When adding new episodes:

1. Add episode data to `src/lib/episodes.json`
2. Drop the MP3 in `./media/` and upload to R2:
   ```bash
   pnpm run upload:r2
   ```
3. Commit and push (if using Git integration) or rebuild and redeploy

## Troubleshooting

### MP3s not loading

- Verify `PUBLIC_R2_CDN_URL` is set correctly
- Check R2 bucket is public or custom domain is configured
- Verify file paths in R2 match the paths in `episodes.json`
- Check browser console for CORS errors

### 404 errors on episodes

- Ensure `prerender = true` is set in route files
- Verify all routes are statically generated during build
- Check build output includes all episode pages

### RSS feed issues

- Verify RSS feed is pre-rendered (check `/rss.xml` in build output)
- Check enclosure URLs point to R2
- Test RSS feed with a podcast app

## Cost Considerations

- **Cloudflare Pages**: Free tier includes unlimited requests
- **R2 Storage**: $0.015 per GB stored per month
- **R2 Egress**: Free egress (data transfer) - this is the key benefit!
- **Example**: 10 episodes × 50MB = 500MB = ~$0.0075/month storage

R2's free egress makes it perfect for serving large media files compared to traditional CDNs.
