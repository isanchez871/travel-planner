'use client';

import { Day } from '@/lib/types';
import { displayDayLabel } from '@/lib/displayDay';

interface MapLinksProps {
  days: Day[];
  selectedDay: number;
  onDaySelect: (day: number) => void;
}

export function MapLinks({ days, selectedDay, onDaySelect }: MapLinksProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        Rutas por Día
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {days.map((day) => (
          <button
            key={day.numero}
            onClick={() => onDaySelect(day.numero)}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
              selectedDay === day.numero
                ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                : 'bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span className={`text-xs font-medium ${
              selectedDay === day.numero
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {displayDayLabel(day.numero)}
            </span>
            <span className={`text-xs mt-1 truncate w-full text-center ${
              selectedDay === day.numero
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-slate-600 dark:text-slate-300'
            }`}>
              {day.destino.split('(')[0].trim().substring(0, 12)}
            </span>
          </button>
        ))}
      </div>

      {selectedDay > 0 && days[selectedDay - 1]?.rutaGoogleMaps && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2">
            <a
              href={days[selectedDay - 1].rutaGoogleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Abrir en Google Maps
            </a>
            {days[selectedDay - 1].mapas[0]?.gpxUrl && (
              <a href={days[selectedDay - 1].mapas[0].gpxUrl} download className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-700">
                Descargar GPX Garmin
              </a>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {days[selectedDay - 1].origen} → {days[selectedDay - 1].destino}
          </p>
        </div>
      )}
    </div>
  );
}
