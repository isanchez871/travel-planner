import { Day } from '@/lib/types';
import { displayDayLabel, displayDayReferences } from '@/lib/displayDay';
import { ActivityCard } from './ActivityCard';
import { AccommodationList } from './AccommodationList';

interface DayTimelineProps {
  day: Day;
}

export function DayTimeline({ day }: DayTimelineProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00Z`);
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">{displayDayLabel(day.numero)} · {day.base}</h3>
            <p className="text-blue-200">{formatDate(day.fecha)}</p>
            <p className="mt-2 text-sm text-blue-100">{day.ruta}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="text-blue-200">Origen:</span>
              <span className="ml-2 font-medium">{day.origen}</span>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="text-blue-200">Destino:</span>
              <span className="ml-2 font-medium">{day.destino}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-blue-200">Distancia:</span>
            <span className="font-medium">{day.distanciaKm} km</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-200">Conducción:</span>
            <span className="font-medium">{day.duracionHoras}h</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-200">Intensidad:</span>
            <span className="font-medium">{day.intensidad}</span>
          </div>
        </div>
      </div>

      {day.mapas.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Mapas del día</h4>
          <div className="grid gap-3 md:grid-cols-2">
            {day.mapas.map((mapa) => (
              <a
                key={mapa.bloque}
                href={mapa.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-800 transition hover:border-red-300 hover:bg-red-100"
              >
                <p className="font-semibold">{mapa.bloque}</p>
                <p className="mt-1 text-sm">{mapa.puntos.length} puntos · {mapa.estado}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {day.etapas.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Etapas del día
          </h4>
          <div className="flex flex-wrap gap-2">
            {day.etapas.map((etapa, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
              >
                <span className="text-xs text-slate-400 dark:text-slate-500">{index + 1}</span>
                <span className="font-medium text-slate-900 dark:text-white">{etapa.nombre}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">({etapa.tipo})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {day.alojamientos.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Alojamiento
          </h4>
          <AccommodationList alojamientos={day.alojamientos} />
        </div>
      )}

      {day.actividades.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Actividades
          </h4>
          <div className="space-y-3">
            {day.actividades.map((actividad, index) => (
              <ActivityCard key={index} activity={actividad} />
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Notas
          </h4>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{displayDayReferences(day.notas)}</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
          <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Plan B (Clima)
          </h4>
          <p className="text-orange-800 dark:text-orange-300 text-sm leading-relaxed">{day.planBClima}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
          <h4 className="text-lg font-semibold text-emerald-950 mb-3">Comida ahorro</h4>
          <p className="text-emerald-900 text-sm leading-relaxed">{day.comidaAhorro}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h4 className="text-lg font-semibold text-amber-950 mb-3">Repostaje estratégico</h4>
          <p className="text-amber-900 text-sm leading-relaxed"><strong>Principal:</strong> {day.repostaje.principal}</p>
          <p className="mt-2 text-amber-900 text-sm leading-relaxed"><strong>Alternativa:</strong> {day.repostaje.alternativa}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Presupuesto del día
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Alojamiento</p>
            <p className="font-semibold text-slate-900 dark:text-white">{day.presupuestoDia.alojamiento}€</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Combustible</p>
            <p className="font-semibold text-slate-900 dark:text-white">{day.presupuestoDia.combustible}€</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Peajes</p>
            <p className="font-semibold text-slate-900 dark:text-white">{day.presupuestoDia.peajes}€</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Comida</p>
            <p className="font-semibold text-slate-900 dark:text-white">{day.presupuestoDia.comida}€</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Actividades</p>
            <p className="font-semibold text-slate-900 dark:text-white">{day.presupuestoDia.actividades}€</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Varios</p>
            <p className="font-semibold text-slate-900 dark:text-white">{day.presupuestoDia.varios}€</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Total día</span>
          <span className="text-xl font-bold text-green-600">{day.presupuestoDia.total}€</span>
        </div>
      </div>
    </div>
  );
}
