-- Lead capture table for email marketing funnel
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  source text NOT NULL DEFAULT 'playbook', -- playbook, webinar, indicator, etc.
  tags text[] DEFAULT '{}',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  ip_address text,
  converted_at timestamptz, -- when they became a paying customer
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Unique email per source (allow same email across different lead magnets)
CREATE UNIQUE INDEX IF NOT EXISTS leads_email_source_idx ON public.leads (email, source);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (email);

-- Index for nurture sequence queries (find leads by source + creation date)
CREATE INDEX IF NOT EXISTS leads_source_created_idx ON public.leads (source, created_at);
