import React, { useEffect, useState } from 'react';
import { PublicPortal } from './pages/PublicPortal';
import { AdminPanel } from './pages/AdminPanel';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.hash.startsWith('#/admin') || window.location.pathname.endsWith('/admin');
  });

  useEffect(() => {
    const onHash = () => {
      setIsAdminRoute(window.location.hash.startsWith('#/admin') || window.location.pathname.endsWith('/admin'));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (isAdminRoute) {
    return (
      <AdminPanel
        onBackToPortal={() => {
          window.location.hash = '';
          setIsAdminRoute(false);
        }}
      />
    );
  }

  return (
    <PublicPortal
      onOpenAdmin={() => {
        window.location.hash = '#/admin';
        setIsAdminRoute(true);
      }}
    />
  );
}
