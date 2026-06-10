import { Day } from '@/lib/types';

interface DayTimelineCompactProps {
  day: Day;
}

export function DayTimelineCompact({ day }: DayTimelineCompactProps) {
  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">📍</span>
          <span className="text-slate-600 dark:text-slate-300">{day.origen}</span>
        </div>
        <div className="text-slate-400">→</div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">🏁</span>
          <span className="text-slate-600 dark:text-slate-300">{day.destino}</span>
        </div>
        
        {day.etapas.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              {day.etapas.length} etapa{day.etapas.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
        {day.mapas.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">•</span>
            <span className="text-red-600 dark:text-red-400">
              {day.mapas.length} mapa{day.mapas.length > 1 ? 's' : ''} · {day.estadoGoogle}
            </span>
          </div>
        )}
        
        {day.alojamientos.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">•</span>
            <span className="text-amber-600 dark:text-amber-400">🏨 {day.alojamientos[0].nombre}</span>
          </div>
        )}
        
        {day.actividades.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">•</span>
            <span className="text-purple-600 dark:text-purple-400">
              🎯 {day.actividades.length} actividad{day.actividades.length > 1 ? 'es' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
