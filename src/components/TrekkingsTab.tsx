'use client';

import { useSearchParams } from 'next/navigation';
import { Day } from '@/lib/types';
import { difficultyClass, trekkingDetails } from '@/lib/trekkings';
import { displayDayLabel } from '@/lib/displayDay';

interface TrekkingsTabProps {
  days: Day[];
}

export function TrekkingsTab({ days }: TrekkingsTabProps) {
  const searchParams = useSearchParams();
  const highlightedDay = Number(searchParams.get('day'));
  const trekkingDays = trekkingDetails.map((trekking) => ({
    ...trekking,
    dayData: days.find((day) => day.numero === trekking.day),
  }));

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-200/70 md:rounded-[2.5rem]">
        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_18%_25%,rgba(52,211,153,0.34),transparent_28rem),linear-gradient(135deg,#064e3b,#0f172a_58%,#1c1917)] p-5 text-white md:min-h-[430px] md:p-8">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(120deg,transparent_0,transparent_44%,rgba(255,255,255,.2)_45%,transparent_46%)]" />
          <div className="relative flex flex-col gap-10 md:min-h-[370px] md:justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-stone-950">{trekkingDays.length} trekkings / paseos clave</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">Ordenados por día</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">Wikiloc + Maps</span>
            </div>
            <div className="max-w-4xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-200">Plan de montaña</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-6xl">Trekkings con criterio, no por acumulación</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-200 md:text-base md:leading-7">Cada card incluye dificultad por color, acceso a Wikiloc, fotos de referencia, indicaciones, consejos, plan B y checklist.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {trekkingDays.map((trekking) => (
          <article key={trekking.title} id={`trekking-dia-${trekking.day}`} className={`scroll-mt-28 overflow-hidden rounded-2xl border bg-white shadow-sm md:rounded-[2rem] ${trekking.day === highlightedDay ? 'border-emerald-400 ring-4 ring-emerald-100' : 'border-stone-200'}`}>
            <div className="bg-gradient-to-br from-emerald-900 to-stone-950 p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">{displayDayLabel(trekking.day)}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{trekking.title}</h3>
                </div>
                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${difficultyClass(trekking.difficulty)}`}>{trekking.difficultyLabel}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-emerald-100">{trekking.subtitle}</p>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Distancia</p><p className="font-semibold text-stone-950">{trekking.distance}</p></div>
                <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Duración</p><p className="font-semibold text-stone-950">{trekking.duration}</p></div>
                <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Desnivel</p><p className="font-semibold text-stone-950">{trekking.elevation}</p></div>
                <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Coste</p><p className="font-semibold text-stone-950">{trekking.cost}</p></div>
              </div>

              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
                <p className="font-bold">Mejor momento</p>
                <p className="mt-1">{trekking.bestTime}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Indicaciones de ruta</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
                  {trekking.routeNotes.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>

              <details className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <summary className="cursor-pointer text-sm font-bold text-stone-950">Consejos y cosas a evitar</summary>
                <div className="mt-4 grid gap-4 text-sm leading-6 md:grid-cols-2">
                  <div>
                    <p className="font-bold text-emerald-800">Consejos</p>
                    {trekking.advice.map((item) => <p key={item} className="text-stone-700">{item}</p>)}
                  </div>
                  <div>
                    <p className="font-bold text-red-800">Evitar</p>
                    {trekking.avoid.map((item) => <p key={item} className="text-stone-700">{item}</p>)}
                  </div>
                </div>
              </details>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Plan operativo</p>
                <ol className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
                  {trekking.plan.map((item, index) => <li key={item}><span className="font-bold text-stone-950">{index + 1}.</span> {item}</li>)}
                </ol>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <span className="font-semibold">Plan B: </span>{trekking.dayData?.planBClima ?? 'Mover a una ventana de buen tiempo o sustituir por paseo corto.'}
              </div>

              <div className="flex flex-wrap gap-2">
                {trekking.checklist.map((item) => <span key={item} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700">{item}</span>)}
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <a href={trekking.map} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700">Google Maps</a>
                <a href={trekking.wikiloc} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-stone-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-stone-800">Wikiloc</a>
                <a href={trekking.photos} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-amber-400 px-4 py-3 text-center text-sm font-semibold text-stone-950 transition hover:bg-amber-300">Fotos</a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
