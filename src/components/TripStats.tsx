import { Trip } from '@/lib/types';

interface TripStatsProps {
  trip: Trip;
}

const budgetLabels: Record<string, { label: string; tone: string }> = {
  Combustible: { label: 'Gasolina', tone: 'bg-rose-500' },
  Peajes: { label: 'Peajes', tone: 'bg-orange-500' },
  Alojamiento: { label: 'Alojamientos', tone: 'bg-sky-500' },
  Comida: { label: 'Comidas', tone: 'bg-emerald-500' },
  Actividades: { label: 'Actividades/remontes/parkings', tone: 'bg-violet-500' },
  Varios: { label: 'Extras', tone: 'bg-stone-500' },
};

function shortDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`));
}

export function TripStats({ trip }: TripStatsProps) {
  const totalKm = trip.dias.reduce((sum, day) => sum + day.distanciaKm, 0);
  const totalBudget = trip.presupuesto.totalEstimado;
  const perPerson = Math.round(totalBudget / trip.viajeros);
  const totalNights = trip.dias.filter((day) => (day.overnight ?? day.base).toLowerCase() !== 'casa').length;
  const origin = trip.dias[0]?.origen ?? 'Loranca, Fuenlabrada';

  const metrics = [
    { label: 'Fechas', value: `${shortDate(trip.fechaInicio)} - ${shortDate(trip.fechaFin)}` },
    { label: 'Origen', value: origin },
    { label: 'Noches totales', value: totalNights.toString() },
    { label: 'Noches en Suiza', value: `${trip.resumenEjecutivo?.nochesSuiza ?? 0}` },
    { label: 'Días Dolomitas', value: `${trip.resumenEjecutivo?.diasDolomitas ?? trip.dias.filter((day) => day.block?.includes('dolomitas')).length}` },
    { label: 'Días trekking', value: `${trip.resumenEjecutivo?.diasTrekking ?? trip.dias.filter((day) => day.actividades.length > 0).length}` },
    { label: 'Días enlace', value: `${trip.resumenEjecutivo?.diasEnlace ?? trip.dias.filter((day) => day.block === 'enlace' || day.block === 'regreso').length}` },
    { label: 'Km aprox.', value: totalKm.toLocaleString('es-ES') },
  ];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-xl shadow-stone-300/40 ring-1 ring-stone-950/5">
      <div className="grid gap-0 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-stone-950 p-6 text-white md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Métricas generales</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Presupuesto y radiografía del viaje</h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-stone-300">Estimación para pareja usando los datos actuales del itinerario, con foco en coste realista, noches fuera y peso de cada categoría.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-wide text-stone-400">Total pareja</p>
              <p className="mt-1 text-3xl font-semibold">{totalBudget.toLocaleString('es-ES')}€</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-wide text-stone-400">Por persona</p>
              <p className="mt-1 text-3xl font-semibold">{perPerson.toLocaleString('es-ES')}€</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 md:p-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article key={metric.label} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{metric.label}</p>
                <p className="mt-2 text-lg font-semibold leading-6 text-stone-950">{metric.value}</p>
              </article>
            ))}
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Presupuesto estimado pareja</p>
                <h3 className="mt-2 text-xl font-semibold text-stone-950">Desglose por categoría</h3>
              </div>
              <span className="rounded-full bg-stone-950 px-3 py-2 text-xs font-semibold text-white">{trip.presupuesto.moneda}</span>
            </div>

            <div className="mt-5 space-y-4">
              {trip.presupuesto.categorias.map((category) => {
                const label = budgetLabels[category.nombre] ?? { label: category.nombre, tone: 'bg-stone-500' };
                const percentage = totalBudget > 0 ? Math.round((category.estimado / totalBudget) * 100) : 0;

                return (
                  <div key={category.nombre}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold text-stone-800">{label.label}</span>
                      <span className="font-semibold text-stone-950">{category.estimado.toLocaleString('es-ES')}€</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                      <div className={`h-full rounded-full ${label.tone}`} style={{ width: `${percentage}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-stone-500">{percentage}% del presupuesto</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
