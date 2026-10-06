# Chemizen Labs — Website Build Plan

## Direction and working method
Build a polished scientific education website from content.txt and the supplied assets. Brand: Chemizen Labs. Complete and check sections sequentially without approval pauses.

Warm ivory, ink black, coral accents and dark navy; Manrope body/navigation and selective Source Serif 4 editorial headings. Spacious asymmetric compositions, fine borders and restrained motion. Liquid glass on floating navigation and hero panel only. No decorative gradient backgrounds or repetitive card grids.

## Implementation order
1. Foundation and floating header: Next.js/TypeScript, responsive shared layouts, inset glass wordmark/navigation, active routes and accessible mobile menu.
2. Hero: supplied background, readable glass message panel, Register/Enquire actions and rounded square forthcoming-video placeholder. Stack on mobile.
3. Overview/audiences/protein: factual overview and five audiences, optimized derivative of protien.obj with custom materials; lazy viewer with slow rotation, drag, pause/reset, occluded labels, reduced motion and static fallback.
4. Offerings: dark horizontal carousel of all eight offerings; touch, keyboard and arrow navigation, partial next card; separate forthcoming IJPCSR feature.
5. Testimonials: clearly marked local preview placeholders; hide unfilled testimonials in production.
6. Insights: three original referenced articles on molecular docking, interpreting ADMET and reproducible CADD; sectional article pages with explanatory diagrams and clearly marked illustrative data.
7. Instructor: concise supplied Mohan L. Manchalkar profile and typographic portrait placeholder.
8. Footer: contact/navigation/privacy/enquiry links and supplied earth image last.
9. Supporting pages and backend, then complete responsive and interaction review.

## Routes and backend
Public: /, /services, /services/[slug], /workshops, /journal, /insights, /insights/[slug], /about, /enquiry, /privacy, /register.
Admin: /admin/login and /admin/enquiries with paginated inbox, details, status filters and New → Contacted → Closed updates.

Independent Next.js site prepared for Vercel, Supabase PostgreSQL/email-password authentication and Resend notifications. No public admin registration. Server authorization and database RLS protect records; secrets never enter browser code.

/register redirects to configured Google Form or explains registration is pending. Enquiry collects name/email, optional phone/institution, service, message and consent. POST /api/enquiries validates, rate-limits and blocks spam, deduplicates by submission token, saves before notification and preserves input on failure. Store contact data, creation time, handling status and delivery status. Failed notification is visible to admin and retryable with Resend idempotency keys.

Blogs are versioned local content, not a CMS. Do not fabricate schedules, syllabi, results, endorsements or protein functional annotations.

## Verification and launch
Check each section at desktop/mobile before proceeding. Final checks at 360, 768, 1024 and 1440px: overflow, navigation, functional/pending actions, glass readability, focus, reduced motion, viewer fallback/occlusion, carousel touch/keyboard, production build and backend tests for validation, duplicates, database/email failure and unauthorized access.

Launch needs Google Form URL, Supabase project/migration/admin account, verified Resend sender and credentials. Optional video, portrait, brochure, social links and testimonials must not leave broken controls. Keep undated internship schedule unpublished and certification claims pending confirmation.

## Progress
- Completed sequentially: foundation/header, hero, overview/protein, eight-offering carousel/journal, development-only testimonials, insights, instructor, Earth footer, supporting routes, enquiry/admin implementation.
- Model optimized from 33,840,064 to 2,092,692 bytes; original preserved.
- TypeScript checks, production build and database/submission tests passed. See QA.md for the current verification record.
- Browser visual and interaction checks remain outstanding: browser-tool access to localhost was declined. No alternative browser access was attempted.
- Live services and deployment await user-owned Supabase/Resend credentials, administrator provisioning, the Google Form URL and final launch-content confirmation. Setup is documented in README.md and .env.example.
