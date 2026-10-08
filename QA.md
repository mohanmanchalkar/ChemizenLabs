# Verification record

## Review fixes and CAPTCHA support — October 8, 2026

- Added Home to desktop/mobile navigation with exact matching for its active state.
- Replaced the development store's cached class instance with shared write queues and fresh methods. Error responses keep their intended status/message across server bundles. Older local records without a votes array are supported.
- Increased development-only limits to 100 review submissions and 300 reaction requests per hour; production PostgreSQL limits remain 3 and 30 respectively.
- Changed the review action to Submit and the success message to a plain thank-you. Admin approval still controls public visibility.
- Homepage reviews require 4 or 5 stars; the full page defaults to Top rated and still includes every published rating.
- Added optional Cloudflare Turnstile to both forms, with server validation, action/hostname checks, token refresh, preserved form fields, and production rejection of dummy keys. Requires the owner's site/secret keys to activate.
- Automated regression checks include fourth local submission, real review/reaction route handlers, repeat/undo reactions, rate-limit responses, writes from separate module instances, older local-store compatibility, CAPTCHA failure cases, and successful CAPTCHA-protected review/enquiry saves. Browser interaction and live Cloudflare checks remain pending.
- Final checks: all 31 tests, TypeScript, and the optimized production build pass.

## Reviews, registration and footer update — October 8, 2026

- Hero now uses upright “Docking”; the trainer and About page include the owner-supplied 1000+ students and faculty figure.
- Added responsive programme selection cards with both brochure Google Forms, labelled brochure dates and fees, and the brochure download.
- Added footer profile links, a liquid glass share control with clipboard/manual fallback, and a QR code for the current site origin.
- Added public reviews, homepage top-rated previews, a name/rating/text submission dialog, Helpful reactions, and protected admin moderation. Unapproved reviews are never public.
- TypeScript, the production build, and all 27 tests pass. New tests execute both real migrations in embedded PostgreSQL and cover approval/rejection, anonymous/non-admin denial, column permissions, duplicate submissions, reaction uniqueness, rate limits, and local persistence.
- Production requires applying `002_reviews.sql` to the existing Supabase project. Live Supabase and browser visual/interaction checks remain outstanding; automated results are not visual verification.
- Manual checks to finish: modal keyboard/focus behavior; mobile cards; QR scanning on the deployed URL; device sharing; submit → approve → public page; Helpful toggle; sorting and pagination.

## Workshop copy and liquid-glass update — September 30, 2026
- Replaced generic marketing headings across public pages with workshop, trainer and research-service descriptions.
- Added the owner-supplied fee (₹600 per workshop) and duration (15 days or less) to the homepage, workshop, registration and trainer information. Research-service fees remain separate.
- Added a clearer glass header, reflective borders, a sliding glass hover/focus highlight and a reflective Register button.
- Added a hero-only custom pointer and canvas water rings. Effects use bounded trails, stop after the rings fade, clear on scroll/blur, and are disabled for touch, reduced motion and forced colors. Decorative layers cannot intercept clicks.
- TypeScript and production build passed for this update. Browser verification is still pending; the previous local-browser access denial has not been bypassed.
- Addressed the server-log hydration warning by rounding SVG coordinates before serialization; a regression test simulates tiny trigonometry differences between runtimes. Added Next.js's smooth-scroll annotation for route navigation.

## Automated checks completed
- TypeScript checks.
- Optimized Next.js production build, with all public and private routes compiled.
- Submission validation, consent, honeypot, duplicates, storage failure, email failure, origin and request-size tests.
- Actual SQL migration executed in embedded PostgreSQL; RLS, rate limits, deduplication, status permissions and notification claims exercised.
- Original protein preserved and optimized GLB generated successfully.

## Browser QA — pending permission
Local browser access was declined by the browser tool. The following are explicit outstanding checks, not completed results:

- At 360, 768, 1024 and 1440px: no page overflow; balanced section spacing; readable glass; correct hero/image crops and Earth horizon.
- Header: every route works; mobile menu opens, focuses its first link, traps focus, closes with Escape and returns focus to its toggle.
- Hero: registration pending state, enquiry route and honest film placeholder.
- Protein: WebGL render, drag, automatic slow rotation, pause/reset, occluded labels, visibility pausing, reduced motion and fallback on load/context failure.
- Carousel: arrows, disabled end states, focus-only arrow keys, Home/End, native touch scroll and usable card links.
- Articles: section navigation, table overflow inside its container, source links and diagrams.
- Form: native validation, consent, preserved text after server/network error and disabled submission while unavailable.
- Admin: login errors, session refresh, logout, pagination/filter/detail views, status update and retry feedback.

## Live service checks — pending user configuration
- Apply Supabase migration, disable public signups, create an administrator and add its UUID to admin_members.
- Confirm anonymous and non-admin requests cannot access the deployed inbox or API.
- Submit a real enquiry, reload the dashboard, and confirm persistence and email delivery.
- Verify email failure/retry using the configured test environment.
- Add Google Form URL and check the external redirect.
- Confirm ISO/MSME documentation, workshop dates and permission for any real testimonials before publication.
