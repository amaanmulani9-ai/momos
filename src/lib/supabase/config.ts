function isPlaceholderValue(value: string) {
  return /^your[-_]/i.test(value) || value.includes('supabase-url') || value.includes('supabase-key');
}

function getValidSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!value || isPlaceholderValue(value)) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function getPublicSupabaseEnv() {
  const url = getValidSupabaseUrl();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key || isPlaceholderValue(key)) {
    return null;
  }

  return { url, key };
}

export function getServiceSupabaseEnv() {
  const url = getValidSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key || isPlaceholderValue(key)) {
    return null;
  }

  return { url, key };
}
