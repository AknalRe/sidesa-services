import React, { useEffect, useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { PublicPortal } from './pages/PublicPortal';
import { AdminPanel } from './pages/AdminPanel';

type RouteView = 'landing' | 'village' | 'admin';

function parseHashRoute(): { view: RouteView; initialTab?: string } {
  if (typeof window === 'undefined') return { view: 'landing' };
  const hash = window.location.hash || '';
  const path = window.location.pathname || '';
  if (hash.startsWith('#/admin') || path.endsWith('/admin')) {
    return { view: 'admin' };
  }
  if (hash.startsWith('#/desa') || path.endsWith('/desa')) {
    const qIdx = hash.indexOf('?');
    if (qIdx !== -1) {
      const params = new URLSearchParams(hash.slice(qIdx + 1));
      const tab = params.get('tab') || undefined;
      return { view: 'village', initialTab: tab };
    }
    return { view: 'village' };
  }
  return { view: 'landing' };
}

export default function App() {
  const [route, setRoute] = useState<{ view: RouteView; initialTab?: string }>(() => parseHashRoute());

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHashRoute());
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route.view === 'admin') {
    return (
      <AdminPanel
        onBackToPortal={() => {
          window.location.hash = '#/desa';
          setRoute({ view: 'village' });
        }}
        onBackToLanding={() => {
          window.location.hash = '#/';
          setRoute({ view: 'landing' });
        }}
      />
    );
  }

  if (route.view === 'village') {
    return (
      <PublicPortal
        initialTab={route.initialTab}
        onBackToPlatform={() => {
          window.location.hash = '#/';
          setRoute({ view: 'landing' });
        }}
        onOpenAdmin={() => {
          window.location.hash = '#/admin';
          setRoute({ view: 'admin' });
        }}
      />
    );
  }

  return (
    <LandingPage
      onOpenVillagePortal={(initialTab?: string) => {
        const nextHash = initialTab && initialTab !== 'beranda' ? `#/desa?tab=${encodeURIComponent(initialTab)}` : '#/desa';
        window.location.hash = nextHash;
        setRoute({ view: 'village', initialTab });
      }}
      onOpenAdmin={() => {
        window.location.hash = '#/admin';
        setRoute({ view: 'admin' });
      }}
    />
  );
}
