export function getAppPrefix(): string {
  if (typeof window === 'undefined') return '';
  const p = window.location.pathname || '/';
  const appMatch = p.match(/^(\/app\/[^/]+)/);
  if (appMatch) return appMatch[1];
  const proxyMatch = p.match(/^(\/api\/v1\/app-catalog\/proxy\/\d+)/);
  if (proxyMatch) return proxyMatch[1];
  return '';
}

export function sidesaAsset(filename: string): string {
  return `${getAppPrefix()}/assets/sidesa/${filename}`;
}

export function resolveAssetUrl(url?: string | null, fallback?: string): string {
  if (!url) return fallback || '';
  if (url.startsWith('/assets/')) {
    return `${getAppPrefix()}${url}`;
  }
  return url;
}
