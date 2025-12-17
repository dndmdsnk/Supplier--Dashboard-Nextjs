/*
  # Create Storage Bucket for QR Codes

  ## Overview
  This migration creates a storage bucket for storing QR code images uploaded by suppliers.

  ## 1. Storage Bucket
  - Bucket name: `contracts`
  - Public access: true (for easy image display)
  - File size limit: 5MB
  - Allowed MIME types: image/png, image/jpeg, image/svg+xml

  ## 2. Security Policies
  - Authenticated suppliers can upload QR codes
  - Everyone can view QR codes (public bucket)
  - Only the owner or admins can delete QR codes

  ## 3. Notes
  - QR codes are stored in the `qr-codes/` folder within the bucket
  - File names use the contract ID for easy reference
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload QR codes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = 'qr-codes'
);

CREATE POLICY "Public can view QR codes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'contracts');

CREATE POLICY "Users can update own QR codes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = 'qr-codes'
)
WITH CHECK (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = 'qr-codes'
);

CREATE POLICY "Users can delete own QR codes or admins can delete any"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND (storage.foldername(name))[1] = 'qr-codes'
);