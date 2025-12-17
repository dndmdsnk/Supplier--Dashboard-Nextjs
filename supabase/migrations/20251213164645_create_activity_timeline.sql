/*
  # Activity Logs Table for Audit Trail
  - Tracks all contract changes and actions
  - Powers activity feed on dashboard
  - Supports supplier & admin access
*/

-- 1️⃣ Create table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created','updated','status_changed','issue_reported','issue_resolved','comment_added')),
  action_label text NOT NULL,
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2️⃣ Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_contract_id ON public.activity_logs(contract_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- 3️⃣ Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 4️⃣ Policies

-- 4a. Admins can view all activities
CREATE POLICY IF NOT EXISTS "Admins can view all activity"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
  )
);

-- 4b. Suppliers can view activities:
--     - Their own actions
--     - Actions on contracts they are assigned to (supplier_id)
CREATE POLICY IF NOT EXISTS "Suppliers can view relevant activities"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.contracts
    WHERE contracts.id = activity_logs.contract_id
      AND contracts.supplier_id = auth.uid()
  )
);

-- 4c. System can insert logs
CREATE POLICY IF NOT EXISTS "System can insert activity logs"
ON public.activity_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- 5️⃣ Grant permissions
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT INSERT ON public.activity_logs TO service_role;
