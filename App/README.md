# 2-Year Roadmap App

A React + Vite application for tracking personal roadmap progress with persistent backend storage via Upstash Redis.

## Getting Started

```bash
npm install
npm run dev
```

## Backend Setup (Upstash Redis)

This app uses [Upstash Redis](https://upstash.com/) for persistent storage of roadmap progress. The API routes in `api/` connect to Upstash via REST.

### Local Development

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Create a free Redis database at [Upstash Console](https://console.upstash.com):
   - Sign up or log in
   - Click "Create Database"
   - Select a region close to your users

3. Copy credentials from the Upstash console (under "REST API" section):
   - **UPSTASH_REDIS_REST_URL** — the REST endpoint URL
   - **UPSTASH_REDIS_REST_TOKEN** — the REST authentication token

4. Paste these values into your `.env` file.

### Vercel Deployment

When deploying to Vercel, add the same environment variables in your Vercel project settings:

1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Settings → Environment Variables**
3. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. Redeploy for changes to take effect

> **Tip:** You can also use the [Upstash Integration for Vercel](https://vercel.com/integrations/upstash) to auto-provision and link a database.

## Tech Stack

- **Frontend:** React 19, Vite
- **Backend:** Vercel Serverless Functions (api/)
- **Storage:** Upstash Redis (REST API)
- **Testing:** Vitest, Testing Library, fast-check

## Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run test` — Run tests
- `npm run lint` — Run ESLint

---

## Vite Plugins

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
