'use client';

import { useEffect, useState } from 'react';

export function OfflineSupport() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').then(() => setReady(true)).catch(() => setReady(false));
  }, []);

  if (!ready) return null;

  return (
    <div className="sr-only" aria-live="polite">
      Offline básico preparado para datos propios y GPX. Google Maps requiere mapas offline descargados en su app.
    </div>
  );
}
