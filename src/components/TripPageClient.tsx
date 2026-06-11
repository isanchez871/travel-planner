'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import { MobileDayDashboard } from '@/components/MobileDayDashboard';
import { RideModeTab } from '@/components/RideModeTab';

const tabs = [
  { id: 'mapa', label: 'Resumen', icon: 'R' },
  { id: 'modo-ruta', label: 'Modo ruta', icon: 'M' },
  { id: 'plan-detallado', label: 'Plan detallado', icon: 'P' },
  { id: 'itinerario', label: 'Itinerario', icon: 'I' },
  { id: 'trekkings', label: 'Trekkings', icon: 'T' },
  { id: 'calendario', label: 'Calendario', icon: '📅' },
  { id: 'gastos', label: 'Gastos', icon: '💰' },
  { id: 'alojamientos', label: 'Alojamientos', icon: '🏨' },
  { id: 'checklist', label: 'Checklist', icon: '✅' },
];

const defaultTab = 'mapa';
const LAST_TAB_KEY = 'dolomitas-alpes-2026-last-tab';

function isTabId(value: string | null): value is string {
  return Boolean(value && tabs.some((tab) => tab.id === value));
}

export function TripPageClient({ trip }: { trip: Trip }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = isTabId(searchParams.get('tab')) ? searchParams.get('tab')! : defaultTab;

  useEffect(() => {
    if (searchParams.has('tab')) return;

    const storedTab = window.localStorage.getItem(LAST_TAB_KEY);
    if (!isTabId(storedTab) || storedTab === defaultTab) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', storedTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  function setActiveTab(tabId: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (tabId === defaultTab) {
      params.delete('tab');
    } else {
      params.set('tab', tabId);
    }

    window.localStorage.setItem(LAST_TAB_KEY, tabId);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      <MobileDayDashboard trip={trip} />
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'modo-ruta' && <RideModeTab trip={trip} />}
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
