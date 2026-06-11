import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Moto Travel Planner',
    short_name: 'Moto Planner',
    description: 'Roadbook operativo para rutas en moto con mapas, GPX, alojamientos y presupuesto.',
    start_url: '/viajes/dolomitas-alpes-2026',
    display: 'standalone',
    background_color: '#f4efe7',
    theme_color: '#1c1917',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/globe.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
