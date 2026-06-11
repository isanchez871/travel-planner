'use client';

import { Budget } from '@/lib/types';

interface GastosTabProps {
  presupuesto: Budget;
}

const categoryStyles: Record<string, { label: string; tone: string }> = {
  Alojamiento: { label: 'Alojamientos', tone: 'bg-sky-500' },
  Combustible: { label: 'Gasolina', tone: 'bg-rose-500' },
  Peajes: { label: 'Peajes, vignettes y túneles', tone: 'bg-orange-500' },
  Comida: { label: 'Supermercado y cenas', tone: 'bg-emerald-500' },
  Actividades: { label: 'Actividades, remontes y parking', tone: 'bg-violet-500' },
  Varios: { label: 'Margen de seguridad', tone: 'bg-stone-500' },
};

export function GastosTab({ presupuesto }: GastosTabProps) {
  const totalEstimado = presupuesto.categorias.reduce((sum, cat) => sum + cat.estimado, 0);
  const totalReal = presupuesto.categorias.reduce((sum, cat) => sum + (cat.real || 0), 0);
  const restante = totalEstimado - totalReal;

  return (
    <div className="space-y-4 md:space-y-8">
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-950 text-white shadow-2xl shadow-stone-300/40 md:rounded-[2rem]">
        <div className="relative p-4 md:p-8">
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,#f59e0b,transparent_28%),radial-gradient(circle_at_82%_18%,#22c55e,transparent_24%),linear-gradient(135deg,#0c0a09,#1c1917)]" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_420px] md:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Presupuesto</p>
              <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-5xl">Control de gasto</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300 md:mt-4 md:text-base">Estimación para dos personas, con margen y foco en ahorro.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur md:p-4"><p className="text-lg font-semibold md:text-2xl">{totalEstimado.toLocaleString('es-ES')}€</p><p className="mt-1 text-xs text-stone-300">total</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur md:p-4"><p className="text-lg font-semibold md:text-2xl">{Math.round(totalEstimado / 2).toLocaleString('es-ES')}€</p><p className="mt-1 text-xs text-stone-300">persona</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur md:p-4"><p className="text-lg font-semibold md:text-2xl">{restante.toLocaleString('es-ES')}€</p><p className="mt-1 text-xs text-stone-300">restante</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Desglose por categoría</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-950 md:text-2xl">Peso real del presupuesto</h3>
          </div>
          <span className="rounded-full bg-stone-950 px-3 py-2 text-xs font-semibold text-white">{presupuesto.moneda}</span>
        </div>

        <div className="mt-6 space-y-4">
          {presupuesto.categorias.map((categoria) => {
            const style = categoryStyles[categoria.nombre] ?? { label: categoria.nombre, tone: 'bg-stone-500' };
            const percentage = Math.min(100, Math.round((categoria.estimado / totalEstimado) * 100));

            return (
              <div key={`breakdown-${categoria.nombre}`}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-semibold text-stone-800">{style.label}</span>
                  <span className="font-semibold text-stone-950">{categoria.estimado.toLocaleString('es-ES')}€</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div className={`h-full rounded-full ${style.tone}`} style={{ width: `${percentage}%` }} />
                </div>
                <p className="mt-1 text-xs text-stone-500">{percentage}% del presupuesto</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {presupuesto.categorias.map((categoria) => {
          const style = categoryStyles[categoria.nombre] ?? { label: categoria.nombre, tone: 'bg-amber-500' };
          const real = categoria.real ?? 0;
          const percentage = Math.min(100, Math.round((categoria.estimado / totalEstimado) * 100));

          return (
            <article key={categoria.nombre} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:rounded-[2rem] md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{style.label}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-950">{categoria.nombre}</h3>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">{percentage}%</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100">
                <div className={`h-full rounded-full ${style.tone}`} style={{ width: `${percentage}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-stone-50 p-4"><p className="text-xs uppercase tracking-wide text-stone-400">Estimado</p><p className="mt-1 text-xl font-semibold text-stone-950">{categoria.estimado.toLocaleString('es-ES')}€</p></div>
                <div className="rounded-2xl bg-stone-50 p-4"><p className="text-xs uppercase tracking-wide text-stone-400">Real</p><p className="mt-1 text-xl font-semibold text-stone-950">{real > 0 ? `${real.toLocaleString('es-ES')}€` : '-'}</p></div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
