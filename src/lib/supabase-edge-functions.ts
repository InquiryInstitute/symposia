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
      console.error(`Edge Function faculty failed:`, response.status, errorText);
      throw new Error(`Edge Function faculty failed: ${response.status}`);
    }
    
    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}
