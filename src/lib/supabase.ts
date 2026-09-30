import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || '';
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
export const isSupabaseConfigured = /^https:\/\/[^/]+/.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 20 && !/YOUR_|MY_/i.test(SUPABASE_URL + SUPABASE_ANON_KEY);

export const supabase = createClient(isSupabaseConfigured ? SUPABASE_URL : "https://unconfigured.invalid", isSupabaseConfigured ? SUPABASE_ANON_KEY : "unconfigured", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Check connectivity to Supabase
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: 'Supabase connected & ready' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: msg };
  }
}

/**
 * Google OAuth Sign In
 */
export async function signInWithGoogle() {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: currentOrigin,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Sign Out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Upload Image to Supabase Storage Bucket ('meatghar-images')
 */
export async function uploadImageToSupabase(
  file: File,
  folder = 'products'
): Promise<{ url: string | null; error: Error | null }> {
  try {
    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPG, PNG, WebP or GIF image under 5 MB.');
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${crypto.randomUUID()}_${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('meatghar-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error:', uploadError.message);
      return { url: null, error: new Error(uploadError.message) };
    }

    const { data: publicUrlData } = supabase.storage
      .from('meatghar-images')
      .getPublicUrl(path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { url: null, error };
  }
}
