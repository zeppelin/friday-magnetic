# Quick Start: Cloudflare Deployment

## TL;DR

1. **Create R2 bucket**: `wrangler r2 bucket create friday-magnetic`
2. **Make it public** in Cloudflare dashboard
3. **Upload MP3s**: `pnpm run upload:r2`
4. **Set environment variable** `PUBLIC_R2_CDN_URL` in Cloudflare Pages
5. **Deploy**: Connect GitHub repo or use `wrangler pages deploy build`

## Detailed Steps

### 1. R2 Setup (5 minutes)

```bash
# Install Wrangler if needed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create bucket
wrangler r2 bucket create friday-magnetic
```

Then in Cloudflare Dashboard:

- Go to R2 → friday-magnetic → Settings
- Enable "Public Access"
- Copy the public URL (e.g., `https://friday-magnetic.xxxxx.r2.dev`)

### 2. Upload MP3 Files

```bash
# Upload all MP3s from static/ directory
pnpm run upload:r2

# Or manually:
wrangler r2 object put friday-magnetic/episode-1.mp3 --file=./static/episode-1.mp3
```

### 3. Configure Environment Variable

**For Cloudflare Pages:**

- Dashboard → Pages → Your Project → Settings → Environment Variables
- Add: `PUBLIC_R2_CDN_URL` = `https://friday-magnetic.xxxxx.r2.dev`

**For local development:**
Create `.env` file:

```
PUBLIC_R2_CDN_URL=https://friday-magnetic.xxxxx.r2.dev
```

### 4. Deploy

**Option A: Git Integration (Recommended)**

1. Push code to GitHub/GitLab
2. Cloudflare Dashboard → Pages → Create Project
3. Connect repository
4. Build settings:
   - Build command: `pnpm build`
   - Build output: `build`
5. Add environment variable `PUBLIC_R2_CDN_URL`
6. Deploy!

**Option B: Manual Deploy**

```bash
pnpm build
wrangler pages deploy build --project-name=friday-magnetic
```

## Adding New Episodes

1. Add to `src/lib/episodes.json`
2. Upload MP3: `wrangler r2 object put friday-magnetic/episode-N.mp3 --file=./static/episode-N.mp3`
3. Commit and push (auto-deploys if using Git integration)

## Cost

- **Pages**: Free (unlimited requests)
- **R2 Storage**: ~$0.015/GB/month
- **R2 Egress**: FREE (unlimited bandwidth!)

Example: 10 episodes × 50MB = 500MB = **$0.0075/month**

## Troubleshooting

**MP3s not loading?**

- Check `PUBLIC_R2_CDN_URL` is set
- Verify R2 bucket is public
- Check file names match in R2 and episodes.json

**Build fails?**

- Ensure `PUBLIC_R2_CDN_URL` is set in Pages environment variables
- Check build logs in Cloudflare dashboard
