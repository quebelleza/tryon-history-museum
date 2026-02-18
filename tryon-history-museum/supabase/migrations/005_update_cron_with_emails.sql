-- Migration 005: Update pg_cron job to include email notifications
-- Run this in the Supabase SQL Editor
--
-- IMPORTANT: Set your CRON_SECRET first:
--   ALTER DATABASE postgres SET app.cron_secret = 'your-random-secret-here';
--
-- Then schedule the job:

SELECT cron.schedule(
  'daily-membership-tasks',
  '0 9 * * *',
  $$
    SELECT update_member_statuses();
    SELECT net.http_post(
      url := 'https://tryonhistorymuseum.org/api/emails/send-expiration-warning',
      headers := '{"Authorization": "Bearer ' || current_setting('app.cron_secret') || '"}'::jsonb
    );
    SELECT net.http_post(
      url := 'https://tryonhistorymuseum.org/api/emails/send-expiration-notice',
      headers := '{"Authorization": "Bearer ' || current_setting('app.cron_secret') || '"}'::jsonb
    );
  $$
);
