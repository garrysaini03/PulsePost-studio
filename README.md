# PulsePost Studio MERN

PulsePost Studio is structured as a MERN full-stack app for uploading media and publishing it across Facebook, Instagram, and YouTube.

## Stack

- React client
- Express + Node.js API
- MongoDB with Mongoose
- Cloudinary upload storage
- BullMQ worker for scheduled publishing jobs
- JWT authentication
- OAuth connect flows for social platforms

## Project layout

```text
client/   React dashboard
server/   API, database models, OAuth callbacks, upload routes, publish queue worker
```

## Features included in this iteration

- email/password registration and login
- authenticated dashboard shell
- account connection support for Facebook, Instagram, and YouTube
- MongoDB models for users, connected accounts, and posts
- Cloudinary-backed upload pipeline scaffolding
- scheduled publishing queue scaffolding with BullMQ
- API routes for auth, uploads, social connections, and posts

## What is implemented vs what still needs provider credentials

The app now has the right MERN architecture and route flow. To make it fully runnable for live publishing you still need:

1. Install dependencies with `npm install`
2. Create or update `.env`
3. Add your MongoDB, Redis, Cloudinary, Google, and Meta credentials
4. Verify provider-specific scopes and callback URLs inside the social auth config before production use
5. Finish platform-specific publish adapters in `server/src/services/publishService.js`

## Run locally

```powershell
npm install
npm run dev
```

Start the publishing worker in a second terminal:

```powershell
npm run worker
```

Client: `http://localhost:5173`

Server: `http://localhost:5000`

If Redis is not running yet, add `QUEUE_ENABLED=false` to `.env`. The API will still boot, and immediate posts can fall back to direct processing. Scheduled jobs still need Redis and the worker.

## Main backend flow

1. User signs up or logs in and receives a JWT.
2. React dashboard stores the token and calls protected API routes.
3. User clicks a social connect button, which starts an OAuth flow on the backend.
4. OAuth callback stores account tokens in MongoDB.
5. User uploads a video, which is stored through Cloudinary.
6. User creates a post for one or more platforms.
7. Immediate posts are queued now; scheduled posts are delayed into BullMQ.
8. Worker picks up the job and calls the provider publish adapters.

## Important note

Platform APIs change often and some features require app review, business accounts, or restricted scopes. Treat this repository as a production-oriented scaffold, then verify each provider's latest requirements before launch.
