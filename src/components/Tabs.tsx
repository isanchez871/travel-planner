'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const [copied, setCopied] = useState(false);
  const mobilePrimaryTabs = tabs.filter((tab) => ['modo-ruta', 'mapa', 'itinerario', 'gastos'].includes(tab.id));
  const mobileMoreTabs = tabs.filter((tab) => !mobilePrimaryTabs.some((primaryTab) => primaryTab.id === tab.id));
  const activeMoreTab = mobileMoreTabs.find((tab) => tab.id === activeTab);
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? 'Resumen';

  async function copyCurrentLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-5 border-b border-stone-200/80 bg-stone-50/95 px-4 py-3 backdrop-blur-xl md:-mx-6 md:mb-8 md:px-6">
      <div className="hidden items-center gap-3 md:flex">
        <nav className="flex min-w-0 flex-1 gap-2 overflow-x-auto" aria-label="Secciones del viaje">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                  active
                    ? 'border-stone-950 bg-stone-950 text-white shadow-lg shadow-stone-300'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-950'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${active ? 'bg-white text-stone-950' : 'bg-stone-100 text-stone-500'}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </nav>
        <button type="button" onClick={copyCurrentLink} className="shrink-0 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm transition hover:border-stone-400">
          {copied ? 'Enlace copiado' : 'Copiar enlace'}
        </button>
      </div>

      <div className="md:hidden">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Secciones</p>
          <button type="button" onClick={copyCurrentLink} className="rounded-full bg-stone-200 px-3 py-1 text-[11px] font-bold text-stone-700">
            {copied ? 'Copiado' : 'Copiar enlace'}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {mobilePrimaryTabs.map((tab) => {
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`rounded-2xl border px-2 py-2 text-center text-xs font-bold transition ${
                  active
                    ? 'border-stone-950 bg-stone-950 text-white shadow-md shadow-stone-300'
                    : 'border-stone-200 bg-white text-stone-600'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {tab.label === 'Plan detallado' ? 'Plan' : tab.label}
              </button>
            );
          })}
        </div>

        <label className="mt-2 block">
          <span className="sr-only">Más secciones</span>
          <select
            value={activeMoreTab?.id ?? ''}
            onChange={(event) => {
              if (event.target.value) {
                onTabChange(event.target.value);
              }
            }}
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 shadow-sm"
          >
            <option value="">Más: alojamiento, checklist, calendario...</option>
            {mobileMoreTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-xs font-medium text-stone-500">Viendo: <span className="text-stone-950">{activeLabel}</span></p>
      </div>
    </div>
  );
}

export function useTabs(initialTab: string) {
  const [activeTab, setActiveTab] = useState(initialTab);
  return { activeTab, setActiveTab };
}
