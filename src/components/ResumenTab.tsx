'use client';

import { Trip } from '@/lib/types';
import { getTotalDistance, getTotalDuration } from '@/lib/data';
import { displayDayLabel } from '@/lib/displayDay';

interface ResumenTabProps {
  trip: Trip;
}

export function ResumenTab({ trip }: ResumenTabProps) {
  const totalKm = getTotalDistance(trip);
  const totalHoras = getTotalDuration(trip);
  const totalPresupuesto = trip.presupuesto.totalEstimado;
  const costePorPersona = totalPresupuesto / trip.viajeros;
  
  const alojamientosCount = trip.dias.reduce((count, day) => count + day.alojamientos.length, 0);
  
  const diasAltaIntensidad = trip.dias.filter(day => day.distanciaKm > 400 || day.duracionHoras > 6).length;

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{trip.duracionDias}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Días</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{totalKm.toLocaleString('es-ES')}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">KM Totales</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{formatDuration(totalHoras)}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Conducción</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{totalPresupuesto.toLocaleString('es-ES')}€</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Presupuesto</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">{costePorPersona.toLocaleString('es-ES')}€</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Por Persona</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{alojamientosCount}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Alojamientos</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Días de Alta Intensidad</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-red-600">{diasAltaIntensidad}</div>
          <div className="text-slate-500 dark:text-slate-400">
            de {trip.duracionDias} días tienen más de 400km o más de 6h de conducción
          </div>
        </div>
        
        {diasAltaIntensidad > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {trip.dias
              .filter(day => day.distanciaKm > 400 || day.duracionHoras > 6)
              .map(day => (
                <span 
                  key={day.numero}
                  className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm"
                >
                  {displayDayLabel(day.numero)}: {day.distanciaKm}km / {day.duracionHoras}h
                </span>
              ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Vehículo</h3>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <svg className="w-8 h-8 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{trip.vehiculo.modelo}</p>
              {trip.vehiculo.nombre && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{trip.vehiculo.nombre}</p>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 capitalize">{trip.vehiculo.tipo}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Detalles del Viaje</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Viajeros</span>
              <span className="font-medium text-slate-900 dark:text-white">{trip.viajeros}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Estilo</span>
              <span className="font-medium text-slate-900 dark:text-white">{trip.estilo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Ferry</span>
              <span className="font-medium text-slate-900 dark:text-white">{trip.requiereFerry ? 'Sí' : 'No'}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Alojamientos preferidos: {trip.preferenciasAlojamiento.join(', ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
