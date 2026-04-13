'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getPublicSupabaseEnv } from '@/lib/supabase/config';

export function createBrowserSupabaseClient() {
  const config = getPublicSupabaseEnv();
  if (!config) {
    return null;
  }

  return createBrowserClient(config.url, config.key);
}
