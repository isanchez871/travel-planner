'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Day, Trip } from '@/lib/types';
import { displayDayLabel } from '@/lib/displayDay';
import { getDayCountries } from '@/lib/routeMeta';
import { difficultyClass, getTrekkingsForDay } from '@/lib/trekkings';

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

function todayIso() {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function mapKey(day: Day, mapPosition: number) {
  return `${day.numero}-${mapPosition}`;
}

export function MapaTab({ days, trip }: MapaTabProps) {
  const totalMaps = days.reduce((total, day) => total + day.mapas.length, 0);
  const currentDay = days.find((day) => day.fecha === todayIso());
  const initialOpenKeys = useMemo(() => new Set(currentDay?.mapas.map((_, mapPosition) => mapKey(currentDay, mapPosition)) ?? []), [currentDay]);
  const [openMaps, setOpenMaps] = useState(initialOpenKeys);

  if (days.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-2xl bg-[#f4efe7] p-2 shadow-inner shadow-stone-200/70 md:space-y-8 md:rounded-[2.5rem] md:p-6">
      <TripInteractiveMap days={days} trip={trip} initialActiveDay={currentDay?.numero ?? 'all'} />

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Google Maps y Garmin</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-950 md:text-2xl">Mapas y tracks descargables</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">En móvil abre solo el día que necesitas. El detalle completo queda desplegable para evitar ruido.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentDay && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Hoy: {displayDayLabel(currentDay.numero)}</span>}
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">{totalMaps} mapas</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpenMaps(new Set(days.flatMap((day) => day.mapas.map((_, mapPosition) => mapKey(day, mapPosition)))))}
            className="rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white"
          >
            Expandir todos
          </button>
          <button
            type="button"
            onClick={() => setOpenMaps(new Set())}
            className="rounded-full bg-stone-100 px-4 py-2 text-sm font-bold text-stone-700"
          >
            Contraer todos
          </button>
          {currentDay && (
            <button
              type="button"
              onClick={() => setOpenMaps(new Set(currentDay.mapas.map((_, mapPosition) => mapKey(currentDay, mapPosition))))}
              className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800"
            >
              Abrir mapas de hoy
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {days.flatMap((day) => day.mapas.map((map, mapPosition) => ({ day, map, mapPosition }))).map(({ day, map, mapPosition }) => {
            const key = mapKey(day, mapPosition);
            const dayTrekkings = getTrekkingsForDay(day.numero);

            return (
            <details
              key={`day-${day.numero}-map-${map.gpxUrl ?? map.url}`}
              open={openMaps.has(key)}
              onToggle={(event) => {
                const isOpen = event.currentTarget.open;
                setOpenMaps((current) => {
                  const next = new Set(current);
                  if (isOpen) next.add(key);
                  else next.delete(key);
                  return next;
                });
              }}
              className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition open:shadow-lg md:rounded-3xl md:hover:-translate-y-0.5 md:hover:shadow-xl md:hover:shadow-stone-200"
            >
              <summary className="cursor-pointer list-none border-b border-stone-100 bg-gradient-to-br from-stone-950 to-stone-800 p-4 text-white md:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">{displayDayLabel(day.numero)} · {formatDate(day.fecha)}</p>
                    <h4 className="mt-2 text-base font-semibold leading-6 md:text-lg">{day.origen} → {day.destino}</h4>
                    <p className="mt-1 text-xs text-stone-300">{map.bloque}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-stone-200">Ver</span>
                </div>
              </summary>

              <div className="p-4 md:p-5">
                <p className="text-sm font-semibold leading-5 text-stone-950">{day.origen} → {day.destino}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {getDayCountries(day.numero).map((country) => <span key={`maps-card-${day.numero}-${country}`} className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700">{country}</span>)}
                </div>
                <ol className="mt-4 space-y-2">
                  {map.puntos.map((point, pointPosition) => (
                    <li key={`day-${day.numero}-map-${mapPosition}-point-${point}-${occurrenceAt(map.puntos, pointPosition)}`} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">{pointPosition + 1}</span>
                      <span className="text-sm text-stone-700">{point}</span>
                    </li>
                  ))}
                </ol>

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
                {dayTrekkings.length > 0 && (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Trekking este día</p>
                    <div className="mt-2 space-y-2">
                      {dayTrekkings.map((trekking) => (
                        <div key={trekking.title} className="rounded-xl bg-white p-3 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-stone-950">{trekking.title}</p>
                              <p className="mt-1 text-xs text-stone-600">{trekking.distance} · {trekking.duration}</p>
                            </div>
                            <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${difficultyClass(trekking.difficulty)}`}>{trekking.difficultyLabel}</span>
                          </div>
                          <a href={`?tab=trekkings&day=${day.numero}`} className="mt-3 inline-flex rounded-full bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Ver trekking</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}
