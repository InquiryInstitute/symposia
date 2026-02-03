/**
 * Supabase Edge Function utilities for static sites
 */

function getSupabaseClientConfig() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL || 'https://pilmscrodlitdrygabvo.supabase.co';
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
  return { url, anonKey };
}

function getEdgeFunctionBaseUrl() {
  const { url } = getSupabaseClientConfig();
  return `${url}/functions/v1`;
}

export async function fetchFacultyByHandleFromEdgeFunction(handle: string) {
  const { anonKey } = getSupabaseClientConfig();
  const baseUrl = getEdgeFunctionBaseUrl();
  const functionUrl = `${baseUrl}/faculty?handle=${encodeURIComponent(handle)}`;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // Only add auth headers if anon key is available
  if (anonKey) {
    requestHeaders['apikey'] = anonKey;
    if (anonKey.startsWith('eyJ')) {
      requestHeaders['Authorization'] = `Bearer ${anonKey}`;
    }
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: requestHeaders,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Faculty not found - this is expected for some speakers
        return null;
      }
      // Don't log errors if anon key is missing (expected in production builds)
      if (response.status === 401 && !anonKey) {
        return null;
      }
      const errorText = await response.text();
      console.error(`Edge Function faculty failed for ${handle}:`, response.status, errorText);
      return null; // Return null instead of throwing to allow fallbacks
    }
    
    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      // Timeout - return null to allow fallbacks
      return null;
    }
    // Network errors - return null to allow fallbacks
    return null;
  }
}

export interface Symposium {
  id: string;
  slug: string;
  title: string;
  titleNative?: string;
  titleTranslation?: string;
  description?: string;
  type: string;
  division?: string;
  season?: string;
  level?: string;
  priceUSD: number;
  faculty: string[];
  heretic?: string;
  sessionCount?: number;
  speakingMinutes?: number;
  centralQuestion?: string;
  centralQuestionNative?: string;
  themes?: string[];
  setting?: string;
  featured: boolean;
  imageUrl?: string;
  styleTheme?: string;
  tagline?: string;
  overview?: string;
  outcomes?: string[];
  format?: {
    duration?: string;
    cadence?: string;
    modality?: string;
  };
}

export async function fetchSymposiaFromEdgeFunction(featured?: boolean): Promise<Symposium[]> {
  const { anonKey } = getSupabaseClientConfig();
  const baseUrl = getEdgeFunctionBaseUrl();
  const params = new URLSearchParams();
  if (featured) {
    params.append('featured', 'true');
  }
  const functionUrl = `${baseUrl}/symposia?${params.toString()}`;
  
  const requestHeaders: Record<string, string> = {
    'apikey': anonKey,
    'Content-Type': 'application/json',
  }
  
  if (anonKey && anonKey.startsWith('eyJ')) {
    requestHeaders['Authorization'] = `Bearer ${anonKey}`;
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: requestHeaders,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge Function symposia failed:`, response.status, errorText);
      throw new Error(`Edge Function symposia failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.symposia || [];
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

export async function fetchSymposiumBySlugFromEdgeFunction(slug: string): Promise<Symposium | null> {
  const { anonKey } = getSupabaseClientConfig();
  const baseUrl = getEdgeFunctionBaseUrl();
  const functionUrl = `${baseUrl}/symposia?slug=${encodeURIComponent(slug)}`;
  
  const requestHeaders: Record<string, string> = {
    'apikey': anonKey,
    'Content-Type': 'application/json',
  }
  
  if (anonKey && anonKey.startsWith('eyJ')) {
    requestHeaders['Authorization'] = `Bearer ${anonKey}`;
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: requestHeaders,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      const errorText = await response.text();
      console.error(`Edge Function symposia failed:`, response.status, errorText);
      throw new Error(`Edge Function symposia failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}
