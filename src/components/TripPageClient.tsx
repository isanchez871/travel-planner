'use client';

import { useState } from 'react';
import { Trip } from '@/lib/types';
import { Tabs } from '@/components/Tabs';
import { CalendarioTab } from '@/components/CalendarioTab';
import { MapaTab } from '@/components/MapaTab';
import { GastosTab } from '@/components/GastosTab';
import { AlojamientosTab } from '@/components/AlojamientosTab';
import { ChecklistTab } from '@/components/ChecklistTab';
import { ItinerarioTab } from '@/components/ItinerarioTab';
import { TrekkingsTab } from '@/components/TrekkingsTab';
import { PlanDetalladoTab } from '@/components/PlanDetalladoTab';

const tabs = [
  { id: 'mapa', label: 'Resumen', icon: 'R' },
  { id: 'plan-detallado', label: 'Plan detallado', icon: 'P' },
  { id: 'itinerario', label: 'Itinerario', icon: 'I' },
  { id: 'trekkings', label: 'Trekkings', icon: 'T' },
  { id: 'calendario', label: 'Calendario', icon: '📅' },
  { id: 'gastos', label: 'Gastos', icon: '💰' },
  { id: 'alojamientos', label: 'Alojamientos', icon: '🏨' },
  { id: 'checklist', label: 'Checklist', icon: '✅' },
];

export function TripPageClient({ trip }: { trip: Trip }) {
  const [activeTab, setActiveTab] = useState('mapa');

  return (
    <>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'plan-detallado' && <PlanDetalladoTab days={trip.dias} />}
      {activeTab === 'itinerario' && <ItinerarioTab days={trip.dias} />}
      {activeTab === 'trekkings' && <TrekkingsTab days={trip.dias} />}
      {activeTab === 'calendario' && <CalendarioTab days={trip.dias} />}
      {activeTab === 'mapa' && <MapaTab days={trip.dias} trip={trip} />}
      {activeTab === 'gastos' && <GastosTab presupuesto={trip.presupuesto} />}
      {activeTab === 'alojamientos' && <AlojamientosTab days={trip.dias} />}
      {activeTab === 'checklist' && <ChecklistTab />}
    </>
  );
}
