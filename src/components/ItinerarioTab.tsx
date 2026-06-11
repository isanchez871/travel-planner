'use client';

import { useState } from 'react';
import { Day } from '@/lib/types';
import { displayDayLabel, displayDayReferences } from '@/lib/displayDay';
import { getBaseWithCountry, getCountriesLabel, getDayCountries } from '@/lib/routeMeta';

interface ItinerarioTabProps {
  days: Day[];
}

type VisualDay = {
  mood: string;
  highlights: string[];
  photoSpots: { title: string; link: string }[];
  schedule: { time: string; title: string; detail: string; link?: string }[];
};

type DayFilter = 'todos' | 'transicion' | 'dolomitas' | 'trekking' | 'regreso' | 'alta';

const dayFilters: { id: DayFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'transicion', label: 'Transición' },
  { id: 'dolomitas', label: 'Dolomitas' },
  { id: 'trekking', label: 'Trekking' },
  { id: 'regreso', label: 'Regreso' },
  { id: 'alta', label: 'Alta intensidad' },
];

function matchesDayFilter(day: Day, filter: DayFilter) {
  if (filter === 'todos') return true;
  if (filter === 'transicion') return day.block === 'enlace';
  if (filter === 'dolomitas') return day.block?.includes('dolomitas') || /dolomitas|gardena|cortina|misurina/i.test(`${day.ruta} ${day.base}`);
  if (filter === 'trekking') return day.actividades.some((activity) => activity.tipo === 'experiencia') || /trekking|trail|seceda|sorapis|tre cime/i.test(`${day.ruta} ${day.notas}`);
  if (filter === 'regreso') return day.block === 'regreso';
  if (filter === 'alta') return /alta/i.test(day.intensidad);
  return true;
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`));
}

function buildPointUrl(point: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point)}`;
}

function buildVisual(day: Day): VisualDay {
  const points = day.mapas.flatMap((map) => map.puntos).filter((point, index, list) => index === 0 || point !== list[index - 1]);
  const highlights = day.highlights?.length ? day.highlights : points.slice(1, 6);

  return {
    mood: displayDayReferences(day.summary ?? day.notas),
    highlights,
    photoSpots: highlights.slice(0, 3).map((title) => ({
      title,
      link: buildPointUrl(title),
    })),
    schedule: [
      { time: 'Antes', title: 'Preparación', detail: `Cargar mapa/GPX, revisar meteorología y confirmar restricciones. ${day.warnings?.join(' ') ?? ''}` },
      { time: 'Mañana', title: `Salida desde ${day.origen}`, detail: `${day.ruta}. Conducción estimada ${day.drivingTime ?? `${day.duracionHoras} h`} / ${day.distanciaKm} km.`, link: day.rutaGoogleMaps },
      { time: 'Mediodía', title: 'Comida y control', detail: day.comidaAhorro },
      { time: 'Tarde', title: 'Puntos principales', detail: highlights.join(' · ') },
      { time: 'Llegada', title: getBaseWithCountry(day.numero, day.base), detail: day.alojamientos[0]?.notas ?? day.planBClima },
    ],
  };
}

function MobileItinerary({
  days,
  day,
  visual,
  selectedDay,
  activeFilter,
  onFilterChange,
  onSelectDay,
}: {
  days: Day[];
  day: Day;
  visual: VisualDay;
  selectedDay: number;
  activeFilter: DayFilter;
  onFilterChange: (filter: DayFilter) => void;
  onSelectDay: (dayNumber: number) => void;
}) {
  const firstMap = day.mapas[0];

  return (
    <section className="space-y-4 md:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar días">
        {dayFilters.map((filter) => (
          <button key={filter.id} type="button" onClick={() => onFilterChange(filter.id)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${filter.id === activeFilter ? 'bg-stone-950 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200'}`}>
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((item) => (
          <button
            key={item.numero}
            type="button"
            onClick={() => onSelectDay(item.numero)}
            className={`min-w-[5rem] rounded-2xl border px-3 py-2 text-left text-xs font-bold ${item.numero === selectedDay ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-200 bg-white text-stone-700'}`}
          >
            <span className="block">{displayDayLabel(item.numero)}</span>
            <span className="mt-0.5 block font-semibold opacity-70">{item.distanciaKm} km</span>
          </button>
        ))}
      </div>

      <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-stone-950 to-stone-800 p-4 text-white">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{displayDayLabel(day.numero)}</span>
            <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-stone-950">{day.intensidad}</span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">{formatDate(day.fecha)}</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">{day.origen} → {day.destino}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-300">{visual.mood}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 p-4 text-center">
          <div className="rounded-2xl bg-stone-100 p-3"><p className="text-[11px] uppercase tracking-wide text-stone-500">Km</p><p className="mt-1 font-bold text-stone-950">{day.distanciaKm}</p></div>
          <div className="rounded-2xl bg-stone-100 p-3"><p className="text-[11px] uppercase tracking-wide text-stone-500">Tiempo</p><p className="mt-1 font-bold text-stone-950">{day.drivingTime ?? `${day.duracionHoras} h`}</p></div>
          <div className="rounded-2xl bg-stone-100 p-3"><p className="text-[11px] uppercase tracking-wide text-stone-500">Mapas</p><p className="mt-1 font-bold text-stone-950">{day.mapas.length}</p></div>
        </div>

        <div className="px-4 pb-4">
          <p className="rounded-2xl bg-stone-50 p-3 text-sm leading-5 text-stone-700"><strong className="text-stone-950">Dormir:</strong> {getBaseWithCountry(day.numero, day.base)}</p>
          <div className="mt-3 grid gap-2">
            {firstMap && <a href={firstMap.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-red-600 px-4 py-3 text-center text-sm font-bold text-white">Abrir ruta principal</a>}
            {firstMap?.gpxUrl && <a href={firstMap.gpxUrl} download className="rounded-2xl bg-stone-950 px-4 py-3 text-center text-sm font-bold text-white">Descargar GPX</a>}
          </div>
        </div>
      </article>

      <details className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm" open>
        <summary className="cursor-pointer text-sm font-bold text-stone-950">Agenda del día</summary>
        <div className="mt-4 space-y-4">
          {visual.schedule.map((item) => (
            <div key={`${item.time}-${item.title}`} className="border-l border-amber-200 pl-4">
              <p className="text-sm font-bold text-amber-700">{item.time} · {item.title}</p>
              <p className="mt-1 text-sm leading-6 text-stone-600">{item.detail}</p>
              {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-700">Abrir punto</a>}
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <summary className="cursor-pointer text-sm font-bold text-stone-950">Puntos fuertes</summary>
        <div className="mt-4 flex flex-wrap gap-2">
          {visual.highlights.map((highlight) => (
            <a key={highlight} href={buildPointUrl(highlight)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700">{highlight}</a>
          ))}
        </div>
      </details>

      <details className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <summary className="cursor-pointer text-sm font-bold text-amber-950">Comida, repostaje y clima</summary>
        <div className="mt-4 space-y-3 text-sm leading-6">
          <p className="text-emerald-950"><strong>Comida:</strong> {day.comidaAhorro}</p>
          <p className="text-amber-950"><strong>Repostaje:</strong> {day.repostaje.principal}</p>
          <p className="text-sky-950"><strong>Plan B:</strong> {day.planBClima}</p>
        </div>
      </details>
    </section>
  );
}

export function ItinerarioTab({ days }: ItinerarioTabProps) {
  const [selectedDay, setSelectedDay] = useState(days[0]?.numero ?? 0);
  const [activeFilter, setActiveFilter] = useState<DayFilter>('todos');
  const filteredDays = days.filter((item) => matchesDayFilter(item, activeFilter));
  const visibleDays = filteredDays.length > 0 ? filteredDays : days;
  const day = visibleDays.find((item) => item.numero === selectedDay) ?? visibleDays[0] ?? days[0];
  const visual = buildVisual(day);
  const firstMap = day.mapas[0];

  return (
    <>
      <MobileItinerary days={visibleDays} day={day} visual={visual} selectedDay={day.numero} activeFilter={activeFilter} onFilterChange={setActiveFilter} onSelectDay={setSelectedDay} />
      <div className="hidden gap-8 md:grid lg:grid-cols-[280px_1fr]">
        <aside className="self-start rounded-[2rem] border border-stone-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
          <div className="px-3 pb-3 pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Roadbook</p>
            <p className="mt-1 text-sm text-stone-600">Todos los días visibles, sin scroll interno.</p>
          </div>
          <div className="mb-3 flex flex-wrap gap-2 px-3">
            {dayFilters.map((filter) => (
              <button key={filter.id} type="button" onClick={() => setActiveFilter(filter.id)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter.id === activeFilter ? 'bg-stone-950 text-white' : 'bg-stone-100 text-stone-600'}`}>
                {filter.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {visibleDays.map((item) => (
            <button
              key={item.numero}
              onClick={() => setSelectedDay(item.numero)}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                item.numero === selectedDay ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-100 bg-stone-50 text-stone-900 hover:border-stone-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{displayDayLabel(item.numero)}</span>
                <span className={`text-xs ${item.numero === selectedDay ? 'text-stone-300' : 'text-stone-500'}`}>{item.distanciaKm} km</span>
              </div>
              <p className={`mt-1 line-clamp-1 text-xs ${item.numero === selectedDay ? 'text-stone-300' : 'text-stone-500'}`}>{getBaseWithCountry(item.numero, item.base)}</p>
              <p className={`mt-1 line-clamp-1 text-[11px] ${item.numero === selectedDay ? 'text-stone-400' : 'text-amber-700'}`}>{getCountriesLabel(item.numero)}</p>
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white shadow-xl shadow-stone-200/70">
          <div className="relative min-h-[430px] overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.32),transparent_28rem),linear-gradient(135deg,#0c0a09,#292524_48%,#57534e)] p-6 text-white md:p-8">
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,transparent_0,transparent_46%,rgba(255,255,255,.18)_47%,transparent_48%)]" />
            <div className="relative flex min-h-[370px] flex-col justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{displayDayLabel(day.numero)}</span>
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-stone-950">{day.intensidad}</span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{day.mapas.length} mapa{day.mapas.length > 1 ? 's' : ''}</span>
                {getDayCountries(day.numero).map((country) => (
                  <span key={country} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{country}</span>
                ))}
              </div>
              <div className="max-w-4xl">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-200">{formatDate(day.fecha)}</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">{day.ruta}</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-stone-200">{visual.mood}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-5 md:p-6">
            <div className="rounded-2xl bg-stone-100 p-4"><p className="text-xs uppercase tracking-wide text-stone-500">Base</p><p className="mt-1 font-semibold text-stone-950">{getBaseWithCountry(day.numero, day.base)}</p></div>
            <div className="rounded-2xl bg-stone-100 p-4"><p className="text-xs uppercase tracking-wide text-stone-500">Distancia</p><p className="mt-1 font-semibold text-stone-950">{day.distanciaKm} km</p></div>
            <div className="rounded-2xl bg-stone-100 p-4"><p className="text-xs uppercase tracking-wide text-stone-500">Conducción</p><p className="mt-1 font-semibold text-stone-950">{day.drivingTime ?? `${day.duracionHoras} h`}</p></div>
            <a href={firstMap?.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-red-600 p-4 text-white transition hover:bg-red-700"><p className="text-xs uppercase tracking-wide text-red-100">Google Maps</p><p className="mt-1 font-semibold">Abrir ruta principal</p></a>
            {firstMap?.gpxUrl && <a href={firstMap.gpxUrl} download className="rounded-2xl bg-stone-950 p-4 text-white transition hover:bg-stone-800"><p className="text-xs uppercase tracking-wide text-stone-300">Garmin</p><p className="mt-1 font-semibold">Descargar GPX</p></a>}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Agenda del día</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Plan por horas</h3>
            <div className="mt-6 space-y-5">
              {visual.schedule.map((item, index) => (
                <div key={`${item.time}-${item.title}`} className="grid gap-4 border-l border-stone-200 pl-5 md:grid-cols-[90px_1fr]">
                  <div className="relative text-sm font-semibold text-amber-700">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                    {item.time}
                  </div>
                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-stone-950">{item.title}</h4>
                      {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-red-600 hover:text-red-800">Abrir punto</a>}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-stone-600">{item.detail}</p>
                    {index === visual.schedule.length - 1 && <p className="mt-2 text-xs text-stone-400">Fin operativo del día.</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Comida ahorro</p>
              <p className="mt-3 text-sm leading-6 text-emerald-950">{day.comidaAhorro}</p>
            </div>
            <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Repostaje</p>
              <p className="mt-3 text-sm leading-6 text-amber-950"><strong>Principal:</strong> {day.repostaje.principal}</p>
              <p className="mt-2 text-sm leading-6 text-amber-950"><strong>Alternativa:</strong> {day.repostaje.alternativa}</p>
            </div>
            <div className="rounded-[2rem] border border-sky-200 bg-sky-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Plan B clima</p>
              <p className="mt-3 text-sm leading-6 text-sky-950">{day.planBClima}</p>
            </div>
          </aside>
        </section>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Lo que veremos</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Puntos fuertes y fotos</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {visual.highlights.map((highlight) => (
              <a key={highlight} href={buildPointUrl(highlight)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-stone-100 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-950 hover:text-white">
                {highlight}
              </a>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visual.photoSpots.map((spot, index) => (
              <a key={spot.title} href={spot.link} target="_blank" rel="noopener noreferrer" className="group rounded-3xl border border-stone-200 bg-gradient-to-br from-stone-950 to-stone-800 p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Punto {index + 1}</p>
                <p className="mt-4 text-xl font-semibold">{spot.title}</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">Sin foto genérica: abrir ubicación real en Google Maps.</p>
              </a>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {day.mapas.map((map) => (
            <article key={map.bloque} className="rounded-[2rem] border border-red-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-xl hover:shadow-red-100">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-500">Mapa Google</p>
              <h4 className="mt-2 text-xl font-semibold text-stone-950">{map.bloque}</h4>
              <p className="mt-2 text-sm text-stone-600">{map.puntos.length} puntos · {map.estado}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {map.puntos.slice(0, 6).map((point, pointIndex) => <span key={`${point}-${pointIndex}`} className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-600">{point}</span>)}
                {map.puntos.length > 6 && <span className="rounded-full bg-stone-900 px-2 py-1 text-xs text-white">+{map.puntos.length - 6}</span>}
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <a href={map.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-700">Abrir Google Maps</a>
                {map.gpxUrl && <a href={map.gpxUrl} download className="rounded-2xl bg-stone-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-stone-800">Descargar GPX</a>}
              </div>
            </article>
          ))}
        </section>
      </div>
      </div>
    </>
  );
}
