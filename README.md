# Chemizen Labs

Independent Next.js / TypeScript website, with Supabase enquiry storage and private administrator authentication, plus Resend email notifications. Designed and implemented section by section from `plan.md` and `content.txt`.

## Run locally

The local administrator login uses private `LOCAL_ADMIN_EMAIL` and
`LOCAL_ADMIN_PASSWORD` settings in `.env.local`; there are no public demo
credentials. Production authentication uses Supabase. See `DEPLOYMENT.md` for
the Vercel launch checklist.

Requires Node.js 20.9 or newer and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000. Registration shows the two brochure programmes and their Google Form enrolment links. The enquiry form explains when online submission is unavailable. Without Supabase, development reviews persist in the ignored `.local/reviews.json` file; this local mode is never enabled in production.

On the supplied workstation, npm was absent. A local ignored npm copy was installed in `.tools/package`, so the equivalent command here is `node .tools/package/bin/npm-cli.js run dev`.

## Connect the enquiry backend

1. Create a Supabase project and run `supabase/migrations/001_enquiries.sql`, then `supabase/migrations/002_reviews.sql` in its SQL editor. For an existing project with migration 001 applied, run only 002. See `REVIEWS_SETUP.md` for review moderation and local development details.
2. Copy `.env.example` to `.env.local`. Set the Supabase URL, publishable key, service-role key, exact `APP_ORIGIN`, and a random `RATE_LIMIT_SECRET`. Restart the app after configuration changes. Never use a `NEXT_PUBLIC_` name for the service-role or email keys.
3. In Supabase Authentication settings, **disable public user signups**. Create/invite your administrator using Supabase's dashboard and set the password privately there. The site has no registration route for admin accounts.
4. Copy that account's user UUID into this SQL statement and run it in the SQL editor:

```sql
insert into public.admin_members(user_id)
values ('REPLACE-WITH-ADMIN-USER-UUID');
```

5. Sign in at `/admin/login`. `/admin/enquiries` and `/admin/reviews` are protected by verified server-side authentication and an admin membership check. PostgreSQL RLS independently prevents non-admin access. Review submissions remain private until approved.
6. Set up Resend, verify a sender domain, and configure `RESEND_API_KEY`, `RESEND_FROM`, and `ADMIN_EMAIL`. Until email is configured, saved enquiries show an `unconfigured` notification status and remain visible to the admin.
7. Send a real test enquiry after configuration and check both the dashboard and inbox. This live integration has not been exercised without your accounts.

### Enquiry behavior

- Required: name, email, service, 20–5,000 character message and consent. Optional: phone and institution.
- Server validation, request size limits, honeypot field and same-origin checks protect submission.
- Database rate limits: 5 enquiries per network per UTC hour and 3 per email per UTC hour. Administrator login: 15 attempts per network per UTC hour, in addition to Supabase protections.
- Vercel's platform-set network header supplies the network identifier. Outside Vercel, requests intentionally share a conservative `local` bucket. Before deploying to another host, implement its trusted ingress IP header; never blindly trust arbitrary forwarded headers.
- A random submission token and canonical payload hash provide transactional deduplication. Retrying the same token does not insert or notify twice. Changed data with an already-saved token returns a conflict instead of silently overwriting the saved record.
- The enquiry is committed before email is attempted. Email failure does not lose the enquiry. Admins can retry failed, pending or unconfigured notifications once the provider is available. A sending claim can be reclaimed after five minutes.
- Resend uses a stable per-enquiry idempotency key. Its deduplication window is finite (24 hours); after that window an ambiguous provider timeout may lead to a duplicate notification if retried. The saved enquiry itself remains unique. Check provider delivery logs before retrying an old ambiguous failure.
- Rate-limit identifiers are HMAC hashes rather than raw IPs. Old buckets are removed on subsequent rate-limit activity. Enquiry retention and deletion requests are handled by the administrator in Supabase; no automated deletion policy is silently applied.
- Enquiry records and email content are not written to application logs. Notification errors are surfaced as delivery states rather than exposing provider secrets to visitors.

## Registration and content

- The owner has confirmed ₹600 per workshop and a duration of up to 15 days. Shared workshop details are in `src/lib/workshop.ts`. Dates and batch-specific syllabi still need confirmation; the fee is not applied to separate research services.
- The header has a glass hover/focus highlight. Hero pointer ripples are limited to fine-pointer devices and stop for reduced-motion preferences; they do not appear on other sections or pages.

- `/register` shows two programme cards. The brochure's Google Form links, topics and timings are in `src/lib/programmes.ts`. The old `GOOGLE_FORM_URL` variable no longer bypasses programme selection. Brochure dates and fees are explicitly identified as historical and require confirmation for a new batch.
- Eight services: `src/lib/content.ts`.
- Three sourced educational articles: `src/lib/articles.ts`. Article diagrams and fictional example data are explicitly labeled.
- The hero film and instructor photograph have intentional placeholders. Replace them when genuine media is available; there is no fake video play control.
- `/reviews` displays all approved learner reviews and defaults to Top rated, with Latest available. The homepage shows up to three approved reviews rated 4 or 5 stars. Visitors submit their name, rating and review; administrators moderate at `/admin/reviews`. Helpful reactions are unique per browser cookie and reversible. Development allows 100 submissions/hour for testing; production remains limited to three per network/hour. No fictional testimonials are seeded.
- Reviews and enquiries support server-verified Cloudflare Turnstile CAPTCHA. Set both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`, then restart/rebuild. CAPTCHA is inactive with both keys blank; one missing key fails closed. See `REVIEWS_SETUP.md` for activation and safe localhost testing.
- ISO/MSME claims and historical internship dates are not published until confirmed. Source claims remain in `content.txt`.
- Original assets remain in `assets/`. The supplied `minimalisticDNA.png` has a baked-in checkerboard, so it is not displayed. The glossy DNA asset, hero image, protein geometry and Earth image are used.

## Protein model

`assets/protien.obj` is preserved. `scripts/optimize-model.mjs` parses it, supplies a warm ceramic material (its referenced MTL is missing), welds/simplifies geometry, and writes `public/models/protein.glb`. Size was reduced from 33,840,064 to 2,092,692 bytes. The SVG poster is sampled from the same geometry.

```sh
npm run optimize-model
node scripts/create-poster.mjs
```

The viewer loads near the viewport, pauses when offscreen or the document is hidden, supports drag/pause/reset, and honors reduced motion. Labels attach to geometry and use raycasting for occlusion; they do not claim residue or binding-site identities. The static SVG remains available on loading failure or unsupported WebGL.

## Validation

```sh
npm run typecheck
npm test
npm run build
```

Tests cover validation/spam, save-before-email ordering, database/email failures, idempotency, Google Form redirects, origin checks and request-size limits. An embedded PostgreSQL engine executes the real SQL migration and tests persistence, conflicting retries, rate limits, anonymous/non-admin denial, admin status updates and notification claims. This validates the database policies without needing production credentials.

**Still required:** browser visual/interaction QA at 360, 768, 1024 and 1440px. Browser automation declined access to localhost during implementation, so screenshot review, touch/keyboard interaction, WebGL rendering and live responsive overflow checks have not been claimed as passed. A manual checklist is in `QA.md`.

## Deploy to Vercel

Import this directory as a Next.js project. Use `npm run build`, configure the environment variables for production, and set `APP_ORIGIN` to the exact HTTPS website origin. Use a separate test Supabase project for preview environments where possible. Apply the SQL migration and configure the admin account before enabling enquiries. Do not place `.env.local`, the raw OBJ, or the source content file in `public/`.

The website has not been published. Deployment and live provider verification remain dependent on your accounts and configuration. Add the Google Form, confirm public claims/schedules, and complete browser QA before public launch.
