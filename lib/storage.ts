import { supabase } from './supabaseClient';

export async function uploadQRCode(
  file: File,
  contractId: string
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${contractId}.${fileExt}`;
    const filePath = `qr-codes/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('contracts')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading QR code:', error);
    return null;
  }
}

export async function deleteQRCode(url: string): Promise<boolean> {
  try {
    const path = url.split('/storage/v1/object/public/contracts/')[1];
    if (!path) return false;

    const { error } = await supabase.storage
      .from('contracts')
      .remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return false;
  }
}
