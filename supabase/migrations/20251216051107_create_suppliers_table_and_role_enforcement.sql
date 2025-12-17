/*
============================================================
SUPPLIERS TABLE – COMPLETE FINAL FIX
============================================================

Features:
- user_id → auth.users.id (NOT NULL, UNIQUE)
- email NOT NULL
- full_name NOT NULL (fallback to email if missing)
- company_name, phone, address, business_registration_number default to '' if missing
- verified DEFAULT false
- created_at / updated_at
- Trigger auto-creates supplier on signup
- Backfills existing users
- RLS policies for authenticated users
- Indexes for performance
- Safe to re-run
*/

-------------------------------------------------------------
-- 1. CREATE TABLE IF NOT EXISTS
-------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  company_name text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  business_registration_number text DEFAULT '',
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-------------------------------------------------------------
-- 2. ADD MISSING COLUMNS (IF TABLE EXISTS)
-------------------------------------------------------------
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS company_name text DEFAULT '';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone text DEFAULT '';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address text DEFAULT '';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS business_registration_number text DEFAULT '';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure NOT NULL constraints
ALTER TABLE suppliers ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE suppliers ALTER COLUMN email SET NOT NULL;
ALTER TABLE suppliers ALTER COLUMN full_name SET NOT NULL;

-- Ensure UNIQUE constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'suppliers_user_id_unique'
  ) THEN
    ALTER TABLE suppliers ADD CONSTRAINT suppliers_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-------------------------------------------------------------
-- 3. INDEXES
-------------------------------------------------------------
CREATE INDEX IF NOT EXISTS suppliers_user_id_idx ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS suppliers_verified_idx ON suppliers(verified);
CREATE INDEX IF NOT EXISTS suppliers_created_at_idx ON suppliers(created_at DESC);

-------------------------------------------------------------
-- 4. ENABLE RLS
-------------------------------------------------------------
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------
-- 5. RLS POLICIES
-------------------------------------------------------------
DROP POLICY IF EXISTS "Suppliers can view own profile" ON suppliers;
CREATE POLICY "Suppliers can view own profile"
ON suppliers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Suppliers can update own profile" ON suppliers;
CREATE POLICY "Suppliers can update own profile"
ON suppliers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------------
-- 6. UPDATED_AT TRIGGER
-------------------------------------------------------------
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-------------------------------------------------------------
-- 7. ENFORCE SUPPLIER ROLE ON AUTH USERS
-------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.raw_user_meta_data = jsonb_set(
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"supplier"'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_supplier_role_on_auth_users ON auth.users;
CREATE TRIGGER enforce_supplier_role_on_auth_users
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-------------------------------------------------------------
-- 8. CREATE SUPPLIER RECORD AFTER USER SIGNUP
-------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_supplier_record()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.suppliers (
      user_id, email, full_name, company_name, phone, address, business_registration_number, created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_registration_number', ''),
    NEW.created_at
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS create_supplier_record_on_auth_users ON auth.users;
CREATE TRIGGER create_supplier_record_on_auth_users
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_supplier_record();

-------------------------------------------------------------
-- 9. BACKFILL EXISTING USERS
-------------------------------------------------------------
INSERT INTO suppliers (
    user_id, email, full_name, company_name, phone, address, business_registration_number, created_at
)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email) AS full_name,
    COALESCE(u.raw_user_meta_data->>'company_name', '') AS company_name,
    COALESCE(u.raw_user_meta_data->>'phone', '') AS phone,
    COALESCE(u.raw_user_meta_data->>'address', '') AS address,
    COALESCE(u.raw_user_meta_data->>'business_registration_number', '') AS business_registration_number,
    u.created_at
FROM auth.users u
LEFT JOIN suppliers s ON s.user_id = u.id
WHERE s.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Update existing rows with NULL values
UPDATE suppliers s
SET 
    email = COALESCE(u.email, s.email),
    full_name = COALESCE(u.raw_user_meta_data->>'full_name', s.full_name, u.email),
    company_name = COALESCE(u.raw_user_meta_data->>'company_name', s.company_name, ''),
    phone = COALESCE(u.raw_user_meta_data->>'phone', s.phone, ''),
    address = COALESCE(u.raw_user_meta_data->>'address', s.address, ''),
    business_registration_number = COALESCE(u.raw_user_meta_data->>'business_registration_number', s.business_registration_number, '')
FROM auth.users u
WHERE s.user_id = u.id;

-------------------------------------------------------------
-- 10. GRANTS
-------------------------------------------------------------
GRANT SELECT, UPDATE ON suppliers TO authenticated;
