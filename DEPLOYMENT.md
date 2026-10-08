# Vercel launch setup

Local test reviews and reactions have been cleared. The development enquiry
inbox starts empty; demo entries no longer seed themselves. Local data is
ignored by Git and is never used as production storage.

## Administrator

The newly generated login is stored privately in `.local/admin-credentials.txt`.
It is configured in `.env.local` for local development. Restart `npm run dev`
after changing environment variables. The old demo login and its fixed session
cookie no longer work. Credentials are never displayed on the sign-in page.

Vercel uses Supabase authentication, not the local login:

1. Create a Supabase project and run `supabase/migrations/001_enquiries.sql`,
   then `supabase/migrations/002_reviews.sql` in its SQL editor. These create
   empty tables. For an existing database, apply only missing migrations.
2. Disable public signups in Supabase Authentication. Under Users, use Add user
   to create the email/password from the private credentials file. Confirm the
   account and copy its user UUID.
3. Grant that account administrator access in the SQL editor:

   ```sql
   insert into public.admin_members (user_id)
   values ('REPLACE-WITH-ADMIN-USER-UUID')
   on conflict (user_id) do nothing;
   ```

4. Import the repository into Vercel as a Next.js project. Configure these
   environment variables before deploying:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (private)
   - `RATE_LIMIT_SECRET` (private, generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `APP_ORIGIN` (exact HTTPS origin, e.g. `https://chemizenlabs.com`)
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` for CAPTCHA
   - `RESEND_API_KEY`, `RESEND_FROM`, and `ADMIN_EMAIL` for enquiry emails

   Do not add `LOCAL_ADMIN_EMAIL` or `LOCAL_ADMIN_PASSWORD` to Vercel. They are
   intentionally disabled in production. The Supabase account supplies the
   production credentials. The notification address `ADMIN_EMAIL` is separate
   from the administrator's login email.

5. Set the Supabase Auth Site URL and Turnstile allowed hostname to the deployed
   website, then deploy. Check `/admin/login`, submit a real enquiry and review,
   and verify moderation and email delivery.

Supabase was not connected during cleanup, so no remote account was created
and no remote database records were deleted. Do not deploy until the backend
configuration above is complete: production forms and admin sign-in otherwise
remain unavailable.
