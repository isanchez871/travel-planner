'use client';

import { useState } from 'react';
import { Trip } from '@/lib/types';
import { TripHeader } from '@/components/TripHeader';
import { TripSummaryCards } from '@/components/TripSummaryCards';
import { DayTimeline } from '@/components/DayTimeline';
import { MapLinks } from '@/components/MapLinks';
import { BudgetSummary } from '@/components/BudgetSummary';

interface TripDetailProps {
  trip: Trip;
}

export function TripDetail({ trip }: TripDetailProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showOnlySelectedDay, setShowOnlySelectedDay] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TripHeader trip={trip} />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <TripSummaryCards trip={trip} />
        
        <div className="mb-8">
          <MapLinks 
            days={trip.dias} 
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
          />
          
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showOnlySelectedDay}
                onChange={(e) => setShowOnlySelectedDay(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Mostrar solo el día seleccionado
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-8">
          {(showOnlySelectedDay 
            ? trip.dias.filter(d => d.numero === selectedDay)
            : trip.dias
          ).map((day) => (
            <div key={day.numero} id={`day-${day.numero}`}>
              <DayTimeline day={day} />
            </div>
          ))}
        </div>

        <div className="mt-12">
          <BudgetSummary presupuesto={trip.presupuesto} />
        </div>
      </main>
    </div>
  );
}