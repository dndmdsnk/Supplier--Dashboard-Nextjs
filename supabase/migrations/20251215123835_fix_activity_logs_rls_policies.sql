-- 1️⃣ Drop old policies (if any)
DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_logs;
DROP POLICY IF EXISTS "Suppliers can view activities on their contracts" ON public.activity_logs;

-- 2️⃣ Admin policy (can view all activity)
CREATE POLICY "Admins can view all activity"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- 3️⃣ Supplier policy (can view activities for contracts they own)
CREATE POLICY "Suppliers can view activities on their contracts"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.contracts c
    WHERE c.id = activity_logs.contract_id
      AND c.supplier_id = auth.uid()
  )
);

-- 4️⃣ System insert policy (for service_role)
CREATE POLICY "System can insert activity logs"
ON public.activity_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- 5️⃣ Grant access
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT INSERT ON public.activity_logs TO service_role;
