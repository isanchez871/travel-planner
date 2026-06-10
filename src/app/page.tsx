import Link from 'next/link';
import { getAllTrips, getTotalDistance } from '@/lib/data';

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`));
}

export default function Home() {
  const trips = getAllTrips();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Travel Planner</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Rutas guardadas</h1>
        </div>
      </header>

      <main className="compact-cards mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Mis viajes</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Próximas rutas</h2>
          </div>
        </div>

        {trips.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center text-stone-500">No hay viajes disponibles</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {trips.map((trip) => (
              <Link key={trip.slug} href={`/viajes/${trip.slug}`} className="group block">
                <article className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-200">
                  <div className="relative h-52 bg-stone-950 p-6 text-white">
                    <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_25%,#f59e0b,transparent_28%),radial-gradient(circle_at_78%_20%,#38bdf8,transparent_24%),linear-gradient(135deg,#0c0a09,#292524)]" />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">{trip.duracionDias} días</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">{getTotalDistance(trip).toLocaleString('es-ES')} km</span>
                      </div>
                      <div>
                        <p className="text-sm text-amber-200">{formatDate(trip.fechaInicio)} - {formatDate(trip.fechaFin)}</p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-tight">{trip.titulo}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="line-clamp-2 text-sm leading-6 text-stone-600">{trip.descripcion}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-5">
                      <span className="text-sm font-medium text-stone-600">{trip.vehiculo.modelo}</span>
                      <span className="text-sm font-semibold text-amber-700 transition group-hover:translate-x-1">Abrir planner</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
