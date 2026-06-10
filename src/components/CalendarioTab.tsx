'use client';

import { Day } from '@/lib/types';
import { displayDayLabel } from '@/lib/displayDay';

interface CalendarioTabProps {
  days: Day[];
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`));
}

export function CalendarioTab({ days }: CalendarioTabProps) {
  const hardDays = days.filter((day) => day.distanciaKm > 400 || day.duracionHoras >= 7);
  const splitDays = days.filter((day) => day.mapas.length > 1);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-950 text-white shadow-2xl shadow-stone-300/40">
        <div className="relative p-6 md:p-8">
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,#f59e0b,transparent_28%),radial-gradient(circle_at_82%_18%,#38bdf8,transparent_24%),linear-gradient(135deg,#0c0a09,#1c1917)]" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_420px] md:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Calendario</p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">{days.length} días de ruta</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300 md:text-base">Vista rápida para entender intensidad, bases, días partidos en mapas y etapas largas.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><p className="text-2xl font-semibold">{days.length}</p><p className="mt-1 text-xs text-stone-300">días</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><p className="text-2xl font-semibold">{hardDays.length}</p><p className="mt-1 text-xs text-stone-300">intensos</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><p className="text-2xl font-semibold">{splitDays.length}</p><p className="mt-1 text-xs text-stone-300">divididos</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {days.map((day) => {
          const isHard = day.distanciaKm > 400 || day.duracionHoras >= 7;

          return (
            <article key={day.numero} className={`rounded-[2rem] border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl ${isHard ? 'border-amber-300' : 'border-stone-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{displayDayLabel(day.numero)}</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-stone-950">{day.base}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isHard ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}`}>{day.intensidad}</span>
              </div>
              <p className="mt-3 text-sm capitalize text-stone-500">{formatDate(day.fecha)}</p>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone-700">{day.ruta}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-stone-50 p-3"><p className="font-semibold text-stone-950">{day.distanciaKm}</p><p className="text-[11px] text-stone-500">km</p></div>
                <div className="rounded-2xl bg-stone-50 p-3"><p className="font-semibold text-stone-950">{day.duracionHoras}h</p><p className="text-[11px] text-stone-500">ruta</p></div>
                <div className="rounded-2xl bg-stone-50 p-3"><p className="font-semibold text-stone-950">{day.mapas.length}</p><p className="text-[11px] text-stone-500">mapas</p></div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
