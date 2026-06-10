'use client';

import dynamic from 'next/dynamic';
import { Day, Trip } from '@/lib/types';
import { displayDayLabel } from '@/lib/displayDay';
import { getDayCountries } from '@/lib/routeMeta';

interface MapaTabProps {
  days: Day[];
  trip?: Trip;
}

const TripInteractiveMap = dynamic(
  () => import('@/components/TripInteractiveMap').then((mod) => mod.TripInteractiveMap),
  { ssr: false },
);

function occurrenceAt(items: string[], position: number): number {
  return items.slice(0, position + 1).filter((item) => item === items[position]).length;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`));
}

export function MapaTab({ days, trip }: MapaTabProps) {
  const totalMaps = days.reduce((total, day) => total + day.mapas.length, 0);

  if (days.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 rounded-[2.5rem] bg-[#f4efe7] p-3 shadow-inner shadow-stone-200/70 md:p-6">
      <TripInteractiveMap days={days} trip={trip} />

      <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Google Maps y Garmin</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Mapas y tracks descargables</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Accesos directos por día para abrir la ruta en Google Maps o descargar el GPX aproximado para Garmin.</p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">{totalMaps} mapas</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {days.flatMap((day) => day.mapas.map((map, mapPosition) => ({ day, map, mapPosition }))).map(({ day, map, mapPosition }) => (
            <article key={`day-${day.numero}-map-${map.gpxUrl ?? map.url}`} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-stone-200">
              <div className="border-b border-stone-100 bg-gradient-to-br from-stone-950 to-stone-800 p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">{displayDayLabel(day.numero)} · {formatDate(day.fecha)}</p>
                    <h4 className="mt-2 text-lg font-semibold leading-6">{map.bloque}</h4>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-stone-200">{map.puntos.length} puntos</span>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm font-semibold leading-5 text-stone-950">{day.origen} → {day.destino}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {getDayCountries(day.numero).map((country) => <span key={`maps-card-${day.numero}-${country}`} className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700">{country}</span>)}
                </div>
                <ol className="mt-4 space-y-2">
                  {map.puntos.slice(0, 6).map((point, pointPosition) => (
                    <li key={`day-${day.numero}-map-${mapPosition}-point-${point}-${occurrenceAt(map.puntos, pointPosition)}`} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">{pointPosition + 1}</span>
                      <span className="text-sm text-stone-700">{point}</span>
                    </li>
                  ))}
                </ol>
                {map.puntos.length > 6 && <p className="mt-3 text-xs font-medium text-stone-500">+{map.puntos.length - 6} puntos más en Google Maps</p>}

                <a
                  href={map.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Abrir en Google Maps
                </a>
                {map.gpxUrl && (
                  <a
                    href={map.gpxUrl}
                    download
                    className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                  >
                    Descargar GPX para Garmin
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
