import React, { useEffect, useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { PublicPortal } from './pages/PublicPortal';
import { AdminPanel } from './pages/AdminPanel';
import { getAppPrefix } from './lib/assets';

type RouteView = 'landing' | 'village' | 'admin';

export interface ParsedRoute {
  view: RouteView;
  villageSlug: string;
  initialTab?: string;
}

const DEFAULT_VILLAGE_SLUG = 'pohjejer';

function stripProxyPrefix(pathname: string): string {
  let p = pathname || '/';
  const appMatch = p.match(/^\/app\/[^/]+(\/.*)?$/);
  if (appMatch) {
    p = appMatch[1] || '/';
  } else {
    const proxyMatch = p.match(/^\/api\/v1\/app-catalog\/proxy\/\d+(\/.*)?$/);
    if (proxyMatch) {
      p = proxyMatch[1] || '/';
    }
  }
  return p.startsWith('/') ? p : `/${p}`;
}

export function parseLocationRoute(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { view: 'landing', villageSlug: DEFAULT_VILLAGE_SLUG };
  }

  const hash = window.location.hash || '';
  const cleanPath = stripProxyPrefix(window.location.pathname || '/');
  const searchParams = new URLSearchParams(window.location.search || '');

  // 1. Check hash routes first for backward compatibility (#/desa/sugihwaras, #/admin)
  if (hash.startsWith('#/admin')) {
    return { view: 'admin', villageSlug: DEFAULT_VILLAGE_SLUG };
  }
  if (hash.startsWith('#/desa')) {
    const [hashPath, hashQuery] = hash.slice(2).split('?');
    const segments = hashPath.split('/').filter(Boolean); // ['desa', 'sugihwaras', 'profil']
    const slug = segments[1] || DEFAULT_VILLAGE_SLUG;
    const subTab = segments[2] || (hashQuery ? new URLSearchParams(hashQuery).get('tab') || undefined : undefined);
    return { view: 'village', villageSlug: slug, initialTab: subTab };
  }

  // 2. Check clean URL path (/admin, /desa/sugihwaras, /desa/sugihwaras/profil)
  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
    return { view: 'admin', villageSlug: DEFAULT_VILLAGE_SLUG };
  }

  if (cleanPath === '/desa' || cleanPath.startsWith('/desa/')) {
    const segments = cleanPath.split('/').filter(Boolean); // ['desa', 'sugihwaras', 'profil']
    const slug = segments[1] || DEFAULT_VILLAGE_SLUG;
    const subTab = segments[2] || searchParams.get('tab') || undefined;
    return { view: 'village', villageSlug: slug, initialTab: subTab };
  }

  return { view: 'landing', villageSlug: DEFAULT_VILLAGE_SLUG };
}

export function navigateToPath(targetPath: string) {
  if (typeof window === 'undefined') return;
  const prefix = getAppPrefix();
  const normalized = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  const fullPath = prefix ? `${prefix}${normalized === '/' ? '/' : normalized}` : normalized;
  window.history.pushState({}, '', fullPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function App() {
  const [route, setRoute] = useState<ParsedRoute>(() => parseLocationRoute());

  useEffect(() => {
    const syncRoute = () => {
      setRoute(parseLocationRoute());
    };
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  if (route.view === 'admin') {
    return (
      <AdminPanel
        onBackToPortal={(slug?: string) => {
          navigateToPath(`/desa/${slug || route.villageSlug || DEFAULT_VILLAGE_SLUG}`);
        }}
        onBackToLanding={() => {
          navigateToPath('/');
        }}
      />
    );
  }

  if (route.view === 'village') {
    return (
      <PublicPortal
        villageSlug={route.villageSlug || DEFAULT_VILLAGE_SLUG}
        initialTab={route.initialTab}
        onTabChange={(tab) => {
          const slug = route.villageSlug || DEFAULT_VILLAGE_SLUG;
          const prefix = getAppPrefix();
          const nextPath = tab && tab !== 'beranda' ? `/desa/${slug}/${tab}` : `/desa/${slug}`;
          window.history.replaceState({}, '', `${prefix}${nextPath}`);
        }}
        onBackToPlatform={() => {
          navigateToPath('/');
        }}
        onOpenAdmin={() => {
          navigateToPath('/admin');
        }}
      />
    );
  }

  return (
    <LandingPage
      onOpenVillagePortal={(initialTab?: string, slug = DEFAULT_VILLAGE_SLUG) => {
        const cleanSlug = slug || DEFAULT_VILLAGE_SLUG;
        const nextPath =
          initialTab && initialTab !== 'beranda'
            ? `/desa/${cleanSlug}/${encodeURIComponent(initialTab)}`
            : `/desa/${cleanSlug}`;
        navigateToPath(nextPath);
      }}
      onOpenAdmin={() => {
        navigateToPath('/admin');
      }}
    />
  );
}
