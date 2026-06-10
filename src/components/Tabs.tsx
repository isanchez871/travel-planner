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
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-8 border-b border-stone-200/80 bg-stone-50/85 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6">
      <nav className="flex gap-2 overflow-x-auto" aria-label="Secciones del viaje">
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
    </div>
  );
}

export function useTabs(initialTab: string) {
  const [activeTab, setActiveTab] = useState(initialTab);
  return { activeTab, setActiveTab };
}
