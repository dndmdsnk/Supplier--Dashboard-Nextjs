import { supabase } from './supabaseClient';

const BUCKET_NAME = 'contract-qr-codes';
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

export function validateQRCodeFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only PNG, JPEG, and SVG images are allowed.'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  return { valid: true };
}

export async function uploadQRCode(
  file: File,
  contractId: string,
  supplierId: string
): Promise<string | null> {
  try {
    const validation = validateQRCodeFile(file);
    if (!validation.valid) {
      console.error('File validation failed:', validation.error);
      return null;
    }

    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `qr.${fileExt}`;
    const filePath = `${supplierId}/${contractId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading QR code:', error);
    return null;
  }
}

export async function getSignedQRCodeUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
}

export async function deleteQRCode(
  contractId: string,
  supplierId: string
): Promise<boolean> {
  try {
    const patterns = ['qr.png', 'qr.jpg', 'qr.jpeg', 'qr.svg'];
    const filePaths = patterns.map(ext => `${supplierId}/${contractId}/${ext}`);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (error && error.message !== 'The resource was not found') {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return false;
  }
}

export function extractFilePathFromUrl(url: string): string | null {
  try {
    const bucketPattern = new RegExp(`/storage/v1/object/public/${BUCKET_NAME}/(.+)$`);
    const signedPattern = new RegExp(`/storage/v1/object/sign/${BUCKET_NAME}/(.+?)\\?`);

    let match = url.match(bucketPattern);
    if (!match) {
      match = url.match(signedPattern);
    }

    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting file path:', error);
    return null;
  }
}
