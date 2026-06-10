import { Trip } from '@/lib/types';
import { getTotalDistance } from '@/lib/data';

interface TripHeaderProps {
  trip: Trip;
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`));
}

export function TripHeader({ trip }: TripHeaderProps) {
  const totalKm = getTotalDistance(trip);

  return (
    <header className="border-b border-stone-200 bg-white/88 text-stone-950 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-end md:justify-between md:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">Roadbook</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{trip.titulo}</h1>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold text-stone-600">
          <span className="rounded-full bg-stone-100 px-3 py-1.5">{formatDate(trip.fechaInicio)} - {formatDate(trip.fechaFin)}</span>
          <span className="rounded-full bg-stone-100 px-3 py-1.5">{trip.duracionDias} días</span>
          <span className="rounded-full bg-stone-100 px-3 py-1.5">{totalKm.toLocaleString('es-ES')} km</span>
          <span className="rounded-full bg-stone-950 px-3 py-1.5 text-white">{trip.vehiculo.modelo}</span>
        </div>
      </div>
    </header>
  );
}
