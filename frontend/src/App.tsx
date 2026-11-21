import React, { useEffect, useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { PublicPortal } from './pages/PublicPortal';
import { AdminPanel } from './pages/AdminPanel';
import { getAppPrefix } from './lib/assets';
import { api } from './services/api';

type RouteView = 'landing' | 'village' | 'admin' | 'superadmin';

export interface ParsedRoute {
  view: RouteView;
  villageSlug: string;
  initialTab?: string;
  initialSubTab?: string;
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

  // 1. Check hash routes first for backward compatibility (#/desa/pohjejer, #/admin, #/superadmin)
  if (hash.startsWith('#/superadmin')) {
    const segs = hash.slice(2).split('/').filter(Boolean);
    return { view: 'superadmin', villageSlug: DEFAULT_VILLAGE_SLUG, initialTab: segs[1] || 'overview' };
  }
  if (hash.startsWith('#/admin')) {
    const segs = hash.slice(2).split('/').filter(Boolean);
    return { view: 'admin', villageSlug: DEFAULT_VILLAGE_SLUG, initialTab: segs[1] || 'dashboard' };
  }
  if (hash.startsWith('#/desa')) {
    const [hashPath, hashQuery] = hash.slice(2).split('?');
    const segments = hashPath.split('/').filter(Boolean);
    const slug = segments[1] || DEFAULT_VILLAGE_SLUG;
    const subTab = segments[2] || (hashQuery ? new URLSearchParams(hashQuery).get('tab') || undefined : undefined);
    const deepSub = segments[3] || undefined;
    return { view: 'village', villageSlug: slug, initialTab: subTab, initialSubTab: deepSub };
  }

  // 2. Check clean URL path (/superadmin/:tab, /admin/:tab, /desa/:slug/:tab/:subTab)
  if (cleanPath === '/superadmin' || cleanPath.startsWith('/superadmin/')) {
    const segments = cleanPath.split('/').filter(Boolean);
    return { view: 'superadmin', villageSlug: DEFAULT_VILLAGE_SLUG, initialTab: segments[1] || 'overview' };
  }

  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
    const segments = cleanPath.split('/').filter(Boolean);
    return { view: 'admin', villageSlug: DEFAULT_VILLAGE_SLUG, initialTab: segments[1] || 'dashboard' };
  }

  if (cleanPath === '/desa' || cleanPath.startsWith('/desa/')) {
    const segments = cleanPath.split('/').filter(Boolean);
    const slug = segments[1] || DEFAULT_VILLAGE_SLUG;
    const subTab = segments[2] || searchParams.get('tab') || undefined;
    const deepSub = segments[3] || undefined;
    return { view: 'village', villageSlug: slug, initialTab: subTab, initialSubTab: deepSub };
  }

  return { view: 'landing', villageSlug: DEFAULT_VILLAGE_SLUG };
}

export function navigateToPath(targetPath: string, replace = false) {
  if (typeof window === 'undefined') return;
  const prefix = getAppPrefix();
  const normalized = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  const fullPath = prefix ? `${prefix}${normalized === '/' ? '/' : normalized}` : normalized;
  if (window.location.pathname !== fullPath) {
    if (replace) {
      window.history.replaceState({}, '', fullPath);
    } else {
      window.history.pushState({}, '', fullPath);
    }
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function App() {
  const [route, setRoute] = useState<ParsedRoute>(() => parseLocationRoute());
  const [customHostVillage, setCustomHostVillage] = useState<{ slug: string; name: string; customDomain: string } | null>(null);
  const [hostChecked, setHostChecked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const prefix = getAppPrefix();
    const h = (window.location.hostname || '').toLowerCase();
    return Boolean(prefix || !h || h === 'localhost' || h === '127.0.0.1');
  });

  useEffect(() => {
    if (hostChecked) return;
    api
      .resolveHost(window.location.hostname)
      .then((res) => {
        if (res?.matched && res?.slug) {
          setCustomHostVillage({
            slug: String(res.slug),
            name: String(res.name || ''),
            customDomain: String(res.customDomain || window.location.hostname),
          });
        }
      })
      .catch(() => {})
      .finally(() => setHostChecked(true));
  }, [hostChecked]);

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

  if (!hostChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6] text-xs font-semibold text-slate-600">
        Memuat portal desa...
      </div>
    );
  }

  if (route.view === 'admin' || route.view === 'superadmin') {
    return (
      <AdminPanel
        initialAdminTab={route.view === 'admin' ? route.initialTab : undefined}
        initialSuperTab={route.view === 'superadmin' ? route.initialTab : undefined}
        onAdminTabChange={(nextTab) => {
          const prefix = getAppPrefix();
          const nextPath = `${prefix}/admin/${encodeURIComponent(nextTab)}`;
          if (window.location.pathname !== nextPath) {
            window.history.pushState({}, '', nextPath);
          }
        }}
        onSuperTabChange={(nextTab) => {
          const prefix = getAppPrefix();
          const nextPath = `${prefix}/superadmin/${encodeURIComponent(nextTab)}`;
          if (window.location.pathname !== nextPath) {
            window.history.pushState({}, '', nextPath);
          }
        }}
        onBackToPortal={(slug?: string) => {
          if (customHostVillage) {
            navigateToPath('/');
            return;
          }
          navigateToPath(`/desa/${slug || route.villageSlug || DEFAULT_VILLAGE_SLUG}`);
        }}
        onBackToLanding={() => {
          navigateToPath('/');
        }}
      />
    );
  }

  // Custom Domain (.desa.id) langsung menyajikan Portal Resmi Desa di root /
  if (customHostVillage && route.view === 'landing') {
    const cleanPath = stripProxyPrefix(window.location.pathname || '/');
    const segs = cleanPath.split('/').filter(Boolean);
    const tabFromRoot = segs[0] || undefined;
    const subFromRoot = segs[1] || undefined;
    return (
      <PublicPortal
        villageSlug={customHostVillage.slug}
        initialTab={tabFromRoot}
        initialSubTab={subFromRoot}
        onTabChange={(tab, sub) => {
          let nextPath = '/';
          if (tab && tab !== 'beranda') {
            nextPath = `/${tab}`;
            if (tab === 'infografis' && sub && sub !== 'penduduk') {
              nextPath += `/${sub}`;
            }
          }
          if (window.location.pathname !== nextPath) {
            window.history.pushState({}, '', nextPath);
          }
        }}
        onOpenAdmin={() => {
          navigateToPath('/admin/dashboard');
        }}
      />
    );
  }

  if (route.view === 'village') {
    return (
      <PublicPortal
        villageSlug={route.villageSlug || DEFAULT_VILLAGE_SLUG}
        initialTab={route.initialTab}
        initialSubTab={route.initialSubTab}
        onTabChange={(tab, sub) => {
          const slug = route.villageSlug || DEFAULT_VILLAGE_SLUG;
          const prefix = getAppPrefix();
          let nextPath = `/desa/${slug}`;
          if (tab && tab !== 'beranda') {
            nextPath = `/desa/${slug}/${tab}`;
            if (tab === 'infografis' && sub && sub !== 'penduduk') {
              nextPath += `/${sub}`;
            }
          }
          const full = `${prefix}${nextPath}`;
          if (window.location.pathname !== full) {
            window.history.pushState({}, '', full);
          }
        }}
        onBackToPlatform={() => {
          navigateToPath('/');
        }}
        onOpenAdmin={() => {
          navigateToPath('/admin/dashboard');
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
        navigateToPath('/admin/dashboard');
      }}
    />
  );
}
