# Reviews and enrolment

## Local development

Start the existing app with `npm run dev`. With Supabase unconfigured, reviews are saved in the ignored `.local/reviews.json` file and survive a development server restart. No example endorsements are seeded.

Submit a review from the homepage or `/reviews`. Sign in using the existing development admin flow and open `/admin/reviews`. Approve, reject or return reviews to pending. Only approved reviews appear on the public site. The homepage shows up to three reviews rated 4 or 5 stars, highest rating first, newest first within the same rating. The full reviews page includes every approved rating and defaults to Top rated; Latest remains available. Helpful reactions allow one current vote per browser and review.

Local development permits 100 review submissions and 300 reaction requests per hour so dummy testing does not stop after three reviews. Production limits remain independent. Local stores keep only write-coordination data across Next.js reloads; the storage methods are recreated so old bundled functions and error classes do not persist.

## Production setup

Run `supabase/migrations/002_reviews.sql` in the same Supabase project after the existing `001_enquiries.sql` migration. Keep the existing admin membership and Supabase configuration. Review submissions use the existing origin, service-role and rate-limit configuration. Row-level security restricts moderation to admins and public reads to approved reviews. Anonymous visitors cannot directly insert, edit or approve reviews.

The public site shows an unavailable state if backend configuration is absent. A configured project must have the new migration applied before enabling reviews. No database credentials are stored in this repository.

Review submission limits are three per network per hour. Helpful reactions use a random HTTP-only browser cookie, with only its HMAC stored in the database, and a local preference for the button state. Reaction limits are 30 requests per network per hour. The existing trusted Vercel ingress policy applies to rate limiting; other hosting requires its own trusted ingress configuration.

## CAPTCHA for reviews and enquiries

Both forms support Cloudflare Turnstile. Create a Managed widget in the [Cloudflare dashboard](https://dash.cloudflare.com/?to=/:account/turnstile), allow your deployed hostname, and set both variables in `.env.local` for development or secure hosting configuration for production:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-widget-site-key
TURNSTILE_SECRET_KEY=your-private-secret-key
```

Restart the development server after changing keys. The public site key is included in the browser bundle; the secret stays server-only. With neither key set, CAPTCHA is inactive and the existing honeypots and rate limits remain. A partially configured widget fails closed. Production rejects known dummy keys.

For localhost testing, Cloudflare's official visible test site key is `1x00000000000000000000AA` and its passing test secret is `1x0000000000000000000000000000000AA`. These simulate verification; they do not stop bots and must not be deployed. Real widgets may also allow localhost in their hostname settings. See [Cloudflare testing guidance](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

The server validates each token with Siteverify before saving either form, checks the action and website hostname for real widgets, and rejects missing, expired, reused or invalid responses. Failed verification preserves entered fields and resets the widget for a fresh token. Transport-only CAPTCHA tokens are removed before validation, hashing or storage. See [server validation guidance](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## Registration

`/register` always presents both programme cards. Their enrolment buttons use the direct links printed beneath each programme in the supplied PDF:

- Network Pharmacology & CADD: https://forms.gle/Tz8z4TW9xeBvGEXs8
- Molecular Docking & Drug Discovery: https://forms.gle/uaY4Zsdg9vysh7VQA

The PDF contains September–October 2026 cohorts. Those dates and the brochure's ₹600 student / ₹800 researcher, faculty and industry fees are identified as brochure details; users are asked to confirm current availability. `GOOGLE_FORM_URL` no longer redirects the selection page to a single programme.

## Footer sharing

The footer QR encodes the site's current origin. It will use the deployed URL when deployed. The Share button opens the device share sheet where supported, then falls back to copying the website URL or showing a selectable link.
