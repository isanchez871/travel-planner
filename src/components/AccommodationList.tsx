import { Accommodation } from '@/lib/types';

interface AccommodationListProps {
  alojamientos: Accommodation[];
}

const typeLabels: Record<string, string> = {
  apartamento: 'Apartamento',
  hotel: 'Hotel',
  hostal: 'Hostal',
  camping: 'Camping',
};

const typeColors: Record<string, string> = {
  apartamento: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  hotel: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  hostal: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  camping: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

export function AccommodationList({ alojamientos }: AccommodationListProps) {
  if (alojamientos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alojamientos.map((alojamiento, index) => (
        <div 
          key={index} 
          className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h4 className="font-medium text-slate-900 dark:text-white truncate">
                {alojamiento.nombre}
              </h4>
              <span className={`text-xs px-2 py-1 rounded-full ${typeColors[alojamiento.tipo]}`}>
                {typeLabels[alojamiento.tipo]}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{alojamiento.ubicacion}</p>
            {alojamiento.notas && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{alojamiento.notas}</p>
            )}
          </div>
          <div className="text-right ml-4">
            {alojamiento.precioReal !== undefined ? (
              <div>
                <span className={`text-sm font-medium ${alojamiento.precioReal > alojamiento.precioEstimado ? 'text-red-600' : 'text-green-600'}`}>
                  {alojamiento.precioReal}€
                </span>
                <span className="text-xs text-slate-400 line-through ml-2">
                  {alojamiento.precioEstimado}€
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {alojamiento.precioEstimado}€
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}