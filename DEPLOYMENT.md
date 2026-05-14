# PulsePost Deployment Checklist

This project is ready for a split deployment:

- Frontend: Vercel or Netlify
- Backend API: Render, Railway, Fly.io, or a VPS
- Worker: same backend host as a background worker process
- Database: MongoDB Atlas
- Redis: Upstash, Redis Cloud, Railway Redis, or Render Redis
- Media: Cloudinary

## Required Manual Setup

1. Create a MongoDB Atlas cluster and copy the connection string.
2. Create a Redis database and copy the Redis URL.
3. Create a Cloudinary account and copy the cloud name, API key, and API secret.
4. Upload `client/public/AIBG-video.mp4` to Cloudinary or another CDN. It is about 544 MB and should not be deployed as a frontend static asset.
5. Optional: upload `client/public/bg-video.mp4` to Cloudinary too.
6. Create a Meta app and configure Facebook Login for Business.
7. Create a Google Cloud OAuth client and enable the YouTube Data API.
8. Buy or connect your custom domain.
9. Add a public Privacy Policy and Terms page before provider app review.

## Backend Environment

Use `.env.example` as the backend environment template.

Set these URLs after deployment:

```text
CLIENT_URL=https://your-frontend-domain.com
SERVER_URL=https://your-backend-domain.com
META_REDIRECT_URI=https://your-backend-domain.com/api/social/facebook/callback
INSTAGRAM_REDIRECT_URI=https://your-backend-domain.com/api/social/instagram/callback
GOOGLE_REDIRECT_URI=https://your-backend-domain.com/api/social/youtube/callback
```

If your frontend has both apex and `www` domains, put the extra one in `ALLOWED_ORIGINS`:

```text
ALLOWED_ORIGINS=https://www.your-frontend-domain.com
```

For single-account Facebook and Instagram publishing, add these Meta variables:

```text
META_API_VERSION=v21.0
FB_PAGE_ID=your-facebook-page-id
FB_PAGE_ACCESS_TOKEN=your-facebook-page-access-token
IG_USER_ID=your-instagram-business-account-id
IG_ACCESS_TOKEN=your-instagram-access-token
```

When these are present, Facebook and Instagram publishing uses these env credentials directly instead of user OAuth rows in MongoDB.

## Frontend Environment

Use `client/.env.example` as the frontend environment template.

```text
VITE_API_URL=https://your-backend-domain.com/api
VITE_LANDING_HERO_VIDEO_URL=https://your-cdn-url/landing-hero.mp4
VITE_STUDIO_BACKGROUND_VIDEO_URL=https://your-cdn-url/studio-background.mp4
```

## Render Backend

This repo includes `render.yaml`.

In Render, create a Blueprint from the repository, then fill in every `sync: false` environment variable.

If creating services manually:

```text
API build command: npm install
API start command: npm run start --workspace server
Health check path: /api/ready

Worker build command: npm install
Worker start command: npm run worker --workspace server
```

## Vercel Frontend

Set the Vercel project root to `client`.

```text
Framework preset: Vite
Build command: npm run build
Output directory: dist
```

Add the frontend env vars from `client/.env.example`.

## Netlify Frontend

Set the Netlify base directory to `client`.

```text
Build command: npm run build
Publish directory: client/dist
```

If the base directory is already `client`, use:

```text
Publish directory: dist
```

## Provider Callback URLs

Add these exact callback URLs in provider dashboards:

```text
https://your-backend-domain.com/api/social/facebook/callback
https://your-backend-domain.com/api/social/instagram/callback
https://your-backend-domain.com/api/social/youtube/callback
```

## Current Production Limitations

The app currently supports:

- Facebook Page image and video publishing.
- Instagram Business image publishing and Reel/video publishing.
- YouTube video publishing after the user connects YouTube.

Before opening the product to all users, still implement:

- Provider app review for public production usage.

## Smoke Test

1. Open `https://your-backend-domain.com/api/health`.
2. Open `https://your-backend-domain.com/api/ready`.
3. Open the frontend domain.
4. Register a test user.
5. Connect Facebook and Instagram.
6. Upload an image.
7. Publish to Facebook and Instagram.
8. Confirm a scheduled post is picked up by the worker.
