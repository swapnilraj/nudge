# gentlenudge.dev

This folder contains the marketing site for **Gentle Nudge**, designed to be deployed on Vercel.

## Local dev

```bash
cd site
npm install
npm run dev
```

## Configure the Google Play link (optional)

Set an environment variable in Vercel (or locally):

- `NEXT_PUBLIC_PLAY_STORE_URL` = your Play listing URL

If not set, the homepage shows “coming soon”.

## Deploy on Vercel

1. Import this GitHub repo into Vercel.
2. Set **Root Directory** to `site/`.
3. Add your domain `gentlenudge.dev` and (optionally) `www.gentlenudge.dev`.
4. Set environment variable `NEXT_PUBLIC_PLAY_STORE_URL` when you have it.

## Privacy Policy URL

Use:

- `https://gentlenudge.dev/privacy`

The privacy policy is rendered from the repo’s `PRIVACY_POLICY.md`.


