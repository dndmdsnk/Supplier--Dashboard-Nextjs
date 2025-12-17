/*
  # QR Code Storage Enhancement - Private Bucket and Column Rename

  ## Overview
  This migration creates a new private storage bucket for QR code images with enhanced
  security and renames the database column for clarity.

  ## 1. Database Changes
  - Rename `qr_code_url` column to `qr_code` in contracts table
  - Maintain all existing data during migration

  ## 2. Storage Bucket
  - **Bucket name**: `contract-qr-codes`
  - **Access**: Private (requires signed URLs)
  - **File size limit**: 2MB
  - **Allowed MIME types**: image/png, image/jpeg, image/svg+xml
  - **Folder structure**: `supplier_id/contract_id/qr.png`

  ## 3. Security Policies
  - **Upload**: Authenticated suppliers can upload only to their own folder
  - **Read**: Suppliers can read only their own QR codes, admins can read all
  - **Update**: Suppliers can update only their own QR codes
  - **Delete**: Suppliers can delete only their own QR codes, admins can delete any

  ## 4. Benefits
  - Enhanced security with private bucket
  - Clear ownership with supplier_id in path
  - No accidental overwrites with structured paths
  - Audit trail with proper folder organization
*/

-- Step 1: Rename the column in contracts table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts'
    AND column_name = 'qr_code_url'
  ) THEN
    ALTER TABLE contracts RENAME COLUMN qr_code_url TO qr_code;
  END IF;
END $$;

-- Step 2: Create the new private storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contract-qr-codes',
  'contract-qr-codes',
  false,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/svg+xml'];

-- Step 3: Drop old storage policies if they exist (for contract-qr-codes bucket)
DROP POLICY IF EXISTS "Suppliers can upload own QR codes" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own QR codes or all if admin" ON storage.objects;
DROP POLICY IF EXISTS "Suppliers can update own QR codes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own QR codes or all if admin" ON storage.objects;

-- Step 4: Create storage policies for the new private bucket

-- Policy 1: Suppliers can upload QR codes only to their own folder
CREATE POLICY "Suppliers can upload own QR codes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contract-qr-codes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can read their own QR codes, admins can read all
CREATE POLICY "Users can read own QR codes or all if admin"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'contract-qr-codes'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
);

-- Policy 3: Suppliers can update their own QR codes
CREATE POLICY "Suppliers can update own QR codes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contract-qr-codes'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'contract-qr-codes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own QR codes, admins can delete any
CREATE POLICY "Users can delete own QR codes or all if admin"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'contract-qr-codes'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
);

-- Step 5: Add helpful comment to the column
COMMENT ON COLUMN contracts.qr_code IS 'Full Supabase Storage URL or signed URL of the QR code image stored in contract-qr-codes bucket';
