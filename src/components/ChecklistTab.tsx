'use client';

import { useEffect, useState } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface ChecklistCategory {
  name: string;
  icon: string;
  items: ChecklistItem[];
}

const initialChecklist: ChecklistCategory[] = [
  {
    name: 'Documentación',
    icon: '📄',
    items: [
      { id: 'doc-1', label: 'DNI / Pasaporte vigente', checked: false },
      { id: 'doc-2', label: 'Carnet de conducir moto', checked: false },
      { id: 'doc-3', label: 'Seguro de viaje', checked: false },
      { id: 'doc-4', label: 'Tarjeta sanitaria / Seguro médico', checked: false },
      { id: 'doc-5', label: 'Reservas de alojamiento impresas', checked: false },
      { id: 'doc-6', label: 'Mapas offline descargados', checked: false },
    ],
  },
  {
    name: 'Moto',
    icon: '🏍️',
    items: [
      { id: 'moto-1', label: 'Revisión reciente (aceite, filtros)', checked: false },
      { id: 'moto-2', label: 'Neumáticos en buen estado', checked: false },
      { id: 'moto-3', label: 'Frenos revisados', checked: false },
      { id: 'moto-4', label: 'Luces funcionando', checked: false },
      { id: 'moto-5', label: 'Batería cargada', checked: false },
      { id: 'moto-6', label: 'Catenay/goma lista', checked: false },
      { id: 'moto-7', label: 'Anticongelante / Líquido frenos', checked: false },
    ],
  },
  {
    name: 'Equipamiento',
    icon: '🎒',
    items: [
      { id: 'eq-1', label: 'Casco', checked: false },
      { id: 'eq-2', label: 'Guantes', checked: false },
      { id: 'eq-3', label: 'Chaqueta protectora', checked: false },
      { id: 'eq-4', label: 'Pantalones vaqueros/cordura', checked: false },
      { id: 'eq-5', label: 'Botas moto', checked: false },
      { id: 'eq-6', label: 'Cubrecascos / Pinlock', checked: false },
      { id: 'eq-7', label: 'Auriculares / Intercom', checked: false },
      { id: 'eq-8', label: 'Cámara de repuesto', checked: false },
    ],
  },
  {
    name: 'Electrónica',
    icon: '📱',
    items: [
      { id: 'elec-1', label: 'Cargador móvil', checked: false },
      { id: 'elec-2', label: 'Soporte móvil moto', checked: false },
      { id: 'elec-3', label: 'Powerbank', checked: false },
      { id: 'elec-4', label: 'Adaptador enchufe europeo', checked: false },
      { id: 'elec-5', label: 'Auriculares', checked: false },
      { id: 'elec-6', label: 'GPS / Mapa offline', checked: false },
    ],
  },
  {
    name: 'Higiene',
    icon: '🧴',
    items: [
      { id: 'hig-1', label: 'Champú / Gel', checked: false },
      { id: 'hig-2', label: 'Cepillo dientes / Pasta', checked: false },
      { id: 'hig-3', label: 'Desodorante', checked: false },
      { id: 'hig-4', label: 'Protector solar', checked: false },
      { id: 'hig-5', label: 'Botiquín básico', checked: false },
      { id: 'hig-6', label: 'Medicamentos personales', checked: false },
    ],
  },
  {
    name: 'Ropa',
    icon: '👕',
    items: [
      { id: 'ropa-1', label: 'Ropa interior suficiente', checked: false },
      { id: 'ropa-2', label: 'Calcetines', checked: false },
      { id: 'ropa-3', label: 'Camisas / T-shirts', checked: false },
      { id: 'ropa-4', label: 'Pantalones', checked: false },
      { id: 'ropa-5', label: 'Ropa de lluvia', checked: false },
      { id: 'ropa-6', label: 'Calzado comodidad', checked: false },
      { id: 'ropa-7', label: 'Ropa térmica /-forro', checked: false },
    ],
  },
  {
    name: 'Último check',
    icon: '✅',
    items: [
      { id: 'check-1', label: 'Reservas confirmadas', checked: false },
      { id: 'check-2', label: 'Combustible lleno', checked: false },
      { id: 'check-3', label: 'Equipaje cerrado', checked: false },
      { id: 'check-4', label: 'Temperatura neumáticos correcta', checked: false },
      { id: 'check-5', label: 'Hora de salida comunicada', checked: false },
    ],
  },
];

const CHECKLIST_STORAGE_KEY = 'dolomitas-alpes-2026-checklist-v1';

function checklistWithStoredState() {
  if (typeof window === 'undefined') return initialChecklist;

  try {
    const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    const checkedIds = stored ? new Set(JSON.parse(stored) as string[]) : new Set<string>();

    return initialChecklist.map((category) => ({
      ...category,
      items: category.items.map((item) => ({ ...item, checked: checkedIds.has(item.id) })),
    }));
  } catch {
    return initialChecklist;
  }
}

export function ChecklistTab() {
  const [categories, setCategories] = useState<ChecklistCategory[]>(checklistWithStoredState);

  const toggleItem = (categoryIndex: number, itemId: string) => {
    setCategories(prev => prev.map((cat, idx) => {
      if (idx === categoryIndex) {
        return {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      }
      return cat;
    }));
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = categories.reduce((sum, cat) => sum + cat.items.filter(i => i.checked).length, 0);
  const percentage = Math.round((checkedItems / totalItems) * 100);

  useEffect(() => {
    const checkedIds = categories.flatMap((category) => category.items.filter((item) => item.checked).map((item) => item.id));
    window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedIds));
  }, [categories]);

  return (
    <div className="space-y-4 md:space-y-8">
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-950 text-white shadow-2xl shadow-stone-300/40 md:rounded-[2rem]">
        <div className="relative p-4 md:p-8">
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,#f59e0b,transparent_28%),radial-gradient(circle_at_82%_18%,#38bdf8,transparent_24%),linear-gradient(135deg,#0c0a09,#1c1917)]" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_360px] md:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Checklist</p>
              <h2 className="max-w-3xl text-2xl font-semibold tracking-tight md:text-5xl">Preparación antes de salir</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300 md:mt-4 md:text-base">Documentación, moto, equipamiento, electrónica y último check.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-300">Progreso</p>
                  <p className="mt-1 text-4xl font-semibold">{percentage}%</p>
                </div>
                <p className="text-sm text-stone-300">{checkedItems}/{totalItems}</p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${percentage}%` }} />
              </div>
              <button type="button" onClick={() => setCategories(initialChecklist)} className="mt-4 w-full rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/10">
                Reiniciar checklist
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category, categoryIndex) => {
          const categoryChecked = category.items.filter(i => i.checked).length;
          const categoryTotal = category.items.length;
          return (
            <div key={category.name}>
              <details className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm md:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-4">
                  <span className="flex items-center gap-2 font-semibold text-stone-950"><span className="text-xl">{category.icon}</span>{category.name}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-500 shadow-sm">{categoryChecked}/{categoryTotal}</span>
                </summary>
                <div className="space-y-3 p-4">
                  {category.items.map(item => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={item.checked} onChange={() => toggleItem(categoryIndex, item.id)} className="h-5 w-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
                      <span className={`text-sm ${item.checked ? 'text-stone-400 line-through' : 'text-stone-700'}`}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </details>

              <div className="hidden overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm md:block">
                <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    <h4 className="font-semibold text-stone-950">{category.name}</h4>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-500 shadow-sm">{categoryChecked}/{categoryTotal}</span>
                </div>
                <div className="p-4 space-y-3">
                  {category.items.map(item => (
                    <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={item.checked} onChange={() => toggleItem(categoryIndex, item.id)} className="h-5 w-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
                      <span className={`text-sm ${item.checked ? 'text-stone-400 line-through' : 'text-stone-700'}`}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
