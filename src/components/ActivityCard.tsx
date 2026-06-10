import { Activity } from '@/lib/types';

interface ActivityCardProps {
  activity: Activity;
}

const typeIcons: Record<string, string> = {
  visita: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  ruta: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  experiencia: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  comida: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
};

const typeColors: Record<string, string> = {
  visita: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ruta: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  experiencia: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  comida: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className={`p-2 rounded-lg ${typeColors[activity.tipo]}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcons[activity.tipo]} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium text-slate-900 dark:text-white truncate">
            {activity.nombre}
          </h4>
          {activity.hora && (
            <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {activity.hora}
            </span>
          )}
        </div>
        {activity.notas && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activity.notas}</p>
        )}
      </div>
      <div className="text-right">
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {activity.costeReal !== undefined ? (
            <span className={activity.costeReal > activity.costeEstimado ? 'text-red-600' : 'text-green-600'}>
              {activity.costeReal}€
            </span>
          ) : (
            <span>{activity.costeEstimado}€</span>
          )}
        </span>
      </div>
    </div>
  );
}