'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Trip } from '@/lib/types';
import { displayDayLabel } from '@/lib/displayDay';
import { getBaseWithCountry, getCountriesLabel } from '@/lib/routeMeta';

export function RideModeTab({ trip }: { trip: Trip }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dayFromUrl = Number(searchParams.get('day'));
  const fallbackDay = trip.dias[0]?.numero ?? 0;
  const selectedDay = trip.dias.some((day) => day.numero === dayFromUrl) ? dayFromUrl : fallbackDay;
  const day = trip.dias.find((item) => item.numero === selectedDay) ?? trip.dias[0];

  useEffect(() => {
    if (searchParams.has('day')) return;

    const storedDay = Number(window.localStorage.getItem('dolomitas-alpes-2026-last-day'));
    if (!trip.dias.some((item) => item.numero === storedDay) || storedDay === fallbackDay) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'modo-ruta');
    params.set('day', String(storedDay));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [fallbackDay, pathname, router, searchParams, trip.dias]);

  if (!day) return null;

  const dayIndex = trip.dias.findIndex((item) => item.numero === day.numero);
  const previousDay = dayIndex > 0 ? trip.dias[dayIndex - 1] : null;
  const nextDay = dayIndex >= 0 && dayIndex < trip.dias.length - 1 ? trip.dias[dayIndex + 1] : null;
  const mainMap = day.mapas[0];
  const accommodation = day.alojamientos[0];
  const warnings = day.warnings?.length ? day.warnings : [day.planBClima];

  function setSelectedDay(dayNumber: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'modo-ruta');

    if (dayNumber === fallbackDay) params.delete('day');
    else params.set('day', String(dayNumber));

    window.localStorage.setItem('dolomitas-alpes-2026-last-day', String(dayNumber));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-3xl bg-stone-950 p-4 text-white shadow-xl shadow-stone-300/50 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Modo durante ruta</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight md:text-5xl">{displayDayLabel(day.numero)}</h2>
            <p className="mt-2 text-sm font-semibold text-stone-300">{getCountriesLabel(day.numero)}</p>
          </div>
          <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-stone-950">{day.intensidad}</span>
        </div>

        <div className="mt-5 rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-sm uppercase tracking-wide text-stone-300">Ruta</p>
          <p className="mt-1 text-2xl font-semibold leading-tight">{day.origen} → {day.destino}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-2xl bg-white/10 p-3"><p className="text-xs text-stone-300">Km</p><p className="text-xl font-bold">{day.distanciaKm}</p></div>
            <div className="rounded-2xl bg-white/10 p-3"><p className="text-xs text-stone-300">Tiempo</p><p className="text-xl font-bold">{day.drivingTime ?? `${day.duracionHoras} h`}</p></div>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {mainMap && <a href={mainMap.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-red-600 px-5 py-4 text-center text-base font-black text-white">Abrir Google Maps</a>}
          {mainMap?.gpxUrl && <a href={mainMap.gpxUrl} download className="rounded-2xl bg-white px-5 py-4 text-center text-base font-black text-stone-950">Descargar GPX</a>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" disabled={!previousDay} onClick={() => previousDay && setSelectedDay(previousDay.numero)} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white ring-1 ring-white/10 disabled:opacity-40">Día anterior</button>
          <button type="button" disabled={!nextDay} onClick={() => nextDay && setSelectedDay(nextDay.numero)} className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-stone-950 disabled:opacity-40">Día siguiente</button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Dormir</p>
          <p className="mt-2 font-semibold text-stone-950">{getBaseWithCountry(day.numero, day.base)}</p>
          {accommodation && <p className="mt-1 text-sm leading-5 text-stone-600">{accommodation.nombre}</p>}
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Avisos críticos</p>
          <ul className="mt-2 space-y-2 text-sm leading-5 text-amber-950">
            {warnings.slice(0, 3).map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </article>

        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Comida</p>
          <p className="mt-2 text-sm leading-5 text-emerald-950">{day.comidaAhorro}</p>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Repostaje</p>
          <p className="mt-2 text-sm leading-5 text-stone-700"><strong className="text-stone-950">Principal:</strong> {day.repostaje.principal}</p>
          <p className="mt-1 text-sm leading-5 text-stone-700"><strong className="text-stone-950">Alternativa:</strong> {day.repostaje.alternativa}</p>
        </article>
      </div>

      <aside className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
        Para usar Google Maps sin conexión, descarga previamente las zonas en la app oficial de Google Maps. Esta web puede guardar GPX/datos propios, pero no puede cachear legalmente los mapas de Google.
      </aside>
    </section>
  );
}
