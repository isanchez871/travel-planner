'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Day, Trip } from '@/lib/types';
import { displayDayLabel } from '@/lib/displayDay';
import { getBaseWithCountry, getCountriesLabel } from '@/lib/routeMeta';

interface MobileDayDashboardProps {
  trip: Trip;
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`));
}

function getMainMap(day: Day) {
  return day.mapas[0] ?? { url: day.rutaGoogleMaps, gpxUrl: undefined };
}

const LAST_DAY_KEY = 'dolomitas-alpes-2026-last-day';

export function MobileDayDashboard({ trip }: MobileDayDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dayFromUrl = Number(searchParams.get('day'));
  const fallbackDay = trip.dias[0]?.numero ?? 0;
  const selectedDay = trip.dias.some((item) => item.numero === dayFromUrl) ? dayFromUrl : fallbackDay;
  const day = trip.dias.find((item) => item.numero === selectedDay) ?? trip.dias[0];
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (searchParams.has('day')) return;

    const storedDay = Number(window.localStorage.getItem(LAST_DAY_KEY));
    if (!trip.dias.some((item) => item.numero === storedDay) || storedDay === fallbackDay) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('day', String(storedDay));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [fallbackDay, pathname, router, searchParams, trip.dias]);

  if (!day) {
    return null;
  }

  const mainMap = getMainMap(day);
  const accommodation = day.alojamientos[0];
  const warnings = day.warnings?.length ? day.warnings : [day.planBClima];
  const dayIndex = trip.dias.findIndex((item) => item.numero === day.numero);
  const previousDay = dayIndex > 0 ? trip.dias[dayIndex - 1] : null;
  const nextDay = dayIndex >= 0 && dayIndex < trip.dias.length - 1 ? trip.dias[dayIndex + 1] : null;

  function setSelectedDay(dayNumber: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (dayNumber === fallbackDay) {
      params.delete('day');
    } else {
      params.set('day', String(dayNumber));
    }

    window.localStorage.setItem(LAST_DAY_KEY, String(dayNumber));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  async function copyDayLink() {
    const params = new URLSearchParams(searchParams.toString());
    params.set('day', String(day.numero));
    const url = `${window.location.origin}${pathname}?${params.toString()}`;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="md:hidden">
      <div className="-mx-4 border-b border-stone-200 bg-white px-4 pb-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 pt-3" aria-label="Seleccionar día">
          {trip.dias.map((item) => {
            const active = item.numero === selectedDay;

            return (
              <button
                key={item.numero}
                type="button"
                onClick={() => setSelectedDay(item.numero)}
                className={`min-w-[4.5rem] rounded-2xl border px-3 py-2 text-left transition ${
                  active ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-200 bg-stone-50 text-stone-700'
                }`}
              >
                <span className="block text-xs font-bold">{displayDayLabel(item.numero)}</span>
                <span className={`mt-0.5 block text-[11px] ${active ? 'text-stone-300' : 'text-stone-500'}`}>{item.distanciaKm} km</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="-mx-4 bg-stone-950 px-4 py-5 text-white shadow-xl shadow-stone-300/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">{formatDate(day.fecha)} · {getCountriesLabel(day.numero)}</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">{day.origen} → {day.destino}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{displayDayLabel(day.numero)}</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-[11px] uppercase tracking-wide text-stone-300">Km</p>
            <p className="mt-1 text-lg font-bold">{day.distanciaKm}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-[11px] uppercase tracking-wide text-stone-300">Tiempo</p>
            <p className="mt-1 text-lg font-bold">{day.drivingTime ?? `${day.duracionHoras} h`}</p>
          </div>
          <div className="rounded-2xl bg-amber-400 p-3 text-stone-950">
            <p className="text-[11px] uppercase tracking-wide text-amber-950/70">Ritmo</p>
            <p className="mt-1 text-sm font-bold">{day.intensidad}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <a href={mainMap.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-red-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-950/20">
            Abrir ruta en Google Maps
          </a>
          {mainMap.gpxUrl && (
            <a href={mainMap.gpxUrl} download className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-stone-950">
              Descargar GPX para Garmin
            </a>
          )}
          <button type="button" onClick={copyDayLink} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-bold text-white">
            {copied ? 'Enlace copiado' : 'Copiar enlace de este día'}
          </button>
        </div>
      </div>

      <div className="-mx-4 space-y-3 bg-stone-100 px-4 py-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={!previousDay} onClick={() => previousDay && setSelectedDay(previousDay.numero)} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-stone-700 shadow-sm disabled:opacity-40">
            Día anterior
          </button>
          <button type="button" disabled={!nextDay} onClick={() => nextDay && setSelectedDay(nextDay.numero)} className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-40">
            Día siguiente
          </button>
        </div>

        <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Dormir</p>
          <p className="mt-2 font-semibold text-stone-950">{getBaseWithCountry(day.numero, day.base)}</p>
          {accommodation && <p className="mt-1 text-sm leading-5 text-stone-600">{accommodation.nombre} · {accommodation.notas}</p>}
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Ojo hoy</p>
          <ul className="mt-2 space-y-2">
            {warnings.slice(0, 3).map((warning) => (
              <li key={warning} className="text-sm leading-5 text-amber-950">{warning}</li>
            ))}
          </ul>
        </article>

        <div className="grid gap-3">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Comida</p>
            <p className="mt-2 text-sm leading-5 text-emerald-950">{day.comidaAhorro}</p>
          </article>

          <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Repostaje</p>
            <p className="mt-2 text-sm leading-5 text-stone-700"><strong className="text-stone-950">Principal:</strong> {day.repostaje.principal}</p>
            <p className="mt-1 text-sm leading-5 text-stone-700"><strong className="text-stone-950">Alternativa:</strong> {day.repostaje.alternativa}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
