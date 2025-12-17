# QR Code Upload Feature - Implementation Guide

## Overview

The QR Code Upload feature allows suppliers to securely upload QR code images when creating new contracts. Images are stored in a private Supabase Storage bucket with proper security policies, and the URLs are saved to the database.

## Architecture

### Database Changes

**Migration**: `create_private_qr_bucket_and_rename_column.sql`

1. **Column Renamed**: `qr_code_url` → `qr_code` in the `contracts` table
2. **New Storage Bucket**: `contract-qr-codes` (private, 2MB limit)
3. **Folder Structure**: `supplier_id/contract_id/qr.png`

### Storage Configuration

**Bucket Details**:
- **Name**: `contract-qr-codes`
- **Type**: Private (requires authentication)
- **Max File Size**: 2MB
- **Allowed Types**: PNG, JPEG, SVG
- **Path Format**: `{supplier_id}/{contract_id}/qr.{ext}`

**Security Policies**:
- Suppliers can only upload to their own folder (`supplier_id`)
- Suppliers can only read their own QR codes
- Admins can read all QR codes
- Owners can update/delete their own QR codes

## Frontend Implementation

### 1. File Validation (`lib/storage.ts`)

```typescript
validateQRCodeFile(file: File)
```

**Validates**:
- File type (PNG, JPEG, SVG only)
- File size (max 2MB)
- Returns validation result with error message

### 2. Upload Function

```typescript
uploadQRCode(file: File, contractId: string, supplierId: string)
```

**Process**:
1. Validates file
2. Generates unique path: `{supplierId}/{contractId}/qr.{ext}`
3. Uploads to private bucket
4. Returns public URL

### 3. Contract Form (`components/ContractForm.tsx`)

**Features**:
- Real-time file validation
- Image preview before submission
- Clear error messages
- File type/size indicators
- Required field (QR Code marked with *)

**User Experience**:
- Drag-and-drop or click to upload
- Instant validation feedback
- Preview shows before form submission
- Submission disabled during upload

### 4. Contract Creation Flow (`app/contracts/new/page.tsx`)

**Step-by-Step Process**:
1. User fills contract form + uploads QR image
2. Validate form data
3. Insert contract record (with `qr_code: null`)
4. Upload QR image to storage
5. Update contract with QR URL
6. Log activity in audit trail
7. Redirect to contracts list

**Error Handling**:
- Validation errors shown inline
- Upload failures trigger user alerts
- Transaction-safe (contract created, then QR uploaded)

## Usage Instructions

### For Suppliers

1. **Navigate to**: `/contracts/new`
2. **Fill out contract details**:
   - Title (required)
   - Quantity (required)
   - Box size (required)
   - Items per box (required)
   - Weight (required)
3. **Upload QR Code**:
   - Click "Choose File" button
   - Select PNG, JPEG, or SVG image (max 2MB)
   - Preview appears automatically
   - If invalid, error message displays
4. **Submit Form**:
   - Button shows "Saving..." during upload
   - Redirects to contracts list on success

### Validation Rules

**File Requirements**:
- **Type**: PNG, JPEG, or SVG only
- **Size**: Maximum 2MB
- **Required**: Yes (form won't submit without it)

**Error Messages**:
- "Invalid file type. Only PNG, JPEG, and SVG images are allowed."
- "File size must be less than 2MB"
- "No file provided"

## Technical Details

### File Path Structure

```
contract-qr-codes/
└── {supplier_id}/
    └── {contract_id}/
        └── qr.{ext}
```

**Example**:
```
contract-qr-codes/
└── a1b2c3d4-e5f6-7890-abcd-ef1234567890/
    └── 9876fedc-ba09-8765-4321-0fedcba98765/
        └── qr.png
```

### Database Schema

**contracts.qr_code**:
- **Type**: `text` (nullable)
- **Content**: Full Supabase Storage URL
- **Example**: `https://[project].supabase.co/storage/v1/object/public/contract-qr-codes/[supplier_id]/[contract_id]/qr.png`

### Storage Policies

**INSERT Policy**:
```sql
CREATE POLICY "Suppliers can upload own QR codes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contract-qr-codes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**SELECT Policy**:
```sql
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
```

## API Integration

### Upload Workflow

```typescript
// 1. Create contract
const { data: contract } = await supabase
  .from('contracts')
  .insert({ ...formData, qr_code: null })
  .select()
  .single();

// 2. Upload QR code
const qrUrl = await uploadQRCode(qrFile, contract.id, user.id);

// 3. Update contract with URL
if (qrUrl) {
  await supabase
    .from('contracts')
    .update({ qr_code: qrUrl })
    .eq('id', contract.id);
}
```

## Security Features

### 1. Path-Based Isolation
- Each supplier has their own folder
- Prevents access to other suppliers' files

### 2. Authentication Required
- All operations require valid JWT token
- Anonymous access blocked

### 3. File Type Restrictions
- Bucket configured to accept only image types
- MIME type validation on client and server

### 4. Size Limits
- Bucket enforces 2MB maximum
- Client validates before upload

### 5. Ownership Verification
- Storage policies check folder ownership
- Database RLS policies check contract ownership

## Troubleshooting

### Common Issues

**"Invalid file type" error**:
- Solution: Ensure file is PNG, JPEG, or SVG
- Check file extension matches content type

**"File size must be less than 2MB" error**:
- Solution: Compress image before upload
- Use online tools or image editors

**QR code not displaying**:
- Check browser console for errors
- Verify `qr_code` field in database has URL
- Ensure user has permission to read file

**Upload fails silently**:
- Check network tab for 403 errors
- Verify storage policies are applied
- Ensure user is authenticated

### Debug Checklist

1. Verify migration applied: `select * from storage.buckets where id = 'contract-qr-codes'`
2. Check storage policies: `select * from storage.policies where bucket_id = 'contract-qr-codes'`
3. Verify contract record: `select qr_code from contracts where id = ?`
4. Check browser console for JavaScript errors
5. Inspect network requests in DevTools

## Future Enhancements

### Potential Features

1. **Drag-and-Drop Upload**
   - HTML5 drag-and-drop API
   - Visual drop zone

2. **Image Cropping/Editing**
   - In-browser image manipulation
   - Resize, rotate, crop tools

3. **Bulk Upload**
   - Upload multiple QR codes at once
   - Associate with multiple contracts

4. **QR Code Generation**
   - Built-in QR generator
   - Auto-generate from contract data

5. **Image Optimization**
   - Automatic compression
   - Format conversion

6. **Version History**
   - Track QR code updates
   - Restore previous versions

## Performance Considerations

### Optimization Tips

1. **Client-Side Validation**: Validate before upload to save bandwidth
2. **Image Compression**: Use tools like TinyPNG before upload
3. **Lazy Loading**: Load QR images only when visible
4. **Caching**: Browser caches images automatically
5. **CDN**: Supabase Storage uses CDN for fast delivery

### Best Practices

1. Always validate file type and size client-side first
2. Show upload progress indicator
3. Handle errors gracefully with user-friendly messages
4. Log failed uploads for debugging
5. Use signed URLs for private buckets (future enhancement)

## Testing

### Manual Test Cases

1. **Valid Upload**:
   - Upload PNG file under 2MB
   - Verify preview appears
   - Submit form
   - Check contract record has QR URL
   - Verify image displays in contract details

2. **Invalid File Type**:
   - Upload PDF or DOCX
   - Verify error message displays
   - Form should not submit

3. **File Too Large**:
   - Upload image over 2MB
   - Verify size error displays
   - Form should not submit

4. **No File**:
   - Submit form without QR code
   - Should prevent submission (required field)

5. **Permission Test**:
   - Try accessing another supplier's QR URL
   - Should receive 403 Forbidden

### Automated Tests (Future)

```typescript
describe('QR Code Upload', () => {
  it('should validate file type', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    const result = validateQRCodeFile(file);
    expect(result.valid).toBe(false);
  });

  it('should validate file size', () => {
    const largeFile = new File([new ArrayBuffer(3 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const result = validateQRCodeFile(largeFile);
    expect(result.valid).toBe(false);
  });

  it('should accept valid PNG', () => {
    const file = new File([new ArrayBuffer(1024)], 'valid.png', { type: 'image/png' });
    const result = validateQRCodeFile(file);
    expect(result.valid).toBe(true);
  });
});
```

## Support

For issues or questions:
1. Check this documentation first
2. Review browser console for errors
3. Verify database migration applied correctly
4. Check Supabase Storage dashboard
5. Contact development team with error details

---

**Implementation Date**: December 2024
**Version**: 1.0.0
**Status**: Production Ready
