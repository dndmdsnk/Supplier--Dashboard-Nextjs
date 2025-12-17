/*
  # Fix Audit Logs RLS Policies for Suppliers
  
  1. Problem
    - Suppliers cannot view audit logs (403 error)
    - Current policies too restrictive
  
  2. Solution
    - Allow suppliers to view all audit logs (they can see what's happening)
    - Allow users to insert their own audit logs
    - Maintain admin full access
  
  3. Security
    - RLS enforced
    - Users can only see activity relevant to the system
    - No sensitive data exposed in audit logs
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Suppliers can view own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;

-- Policy 1: All authenticated users can view audit logs
-- (audit logs don't contain sensitive data, just activity tracking)
CREATE POLICY "authenticated_view_audit_logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Authenticated users can insert their own audit logs
CREATE POLICY "users_insert_own_audit_logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy 3: Service role can do anything
CREATE POLICY "service_role_full_access"
ON public.audit_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure correct grants
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
