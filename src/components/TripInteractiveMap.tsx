'use client';

import { useMemo, useState } from 'react';
import { useEffect, useRef } from 'react';
import type * as Leaflet from 'leaflet';
import { Day, Trip } from '@/lib/types';
import { displayDayLabel, displayDayReferences } from '@/lib/displayDay';
import { getDayCountries } from '@/lib/routeMeta';
import 'leaflet/dist/leaflet.css';

interface TripInteractiveMapProps {
  days: Day[];
  trip?: Trip;
}

type Coordinates = [number, number];
type PointCategory = 'salida' | 'noche' | 'trekking' | 'mirador' | 'ciudad' | 'carretera';

const dayColors = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c',
];

const blockStyles: Record<string, { label: string; color: string }> = {
  enlace: { label: 'Enlace', color: '#ef476f' },
  'alpes-franceses': { label: 'Alpes franceses', color: '#ff9f1c' },
  'norte-italia': { label: 'Norte Italia', color: '#2bb673' },
  'dolomitas-oeste': { label: 'Dolomitas Oeste', color: '#00b4d8' },
  'dolomitas-este': { label: 'Dolomitas Este', color: '#7b61ff' },
  austria: { label: 'Austria', color: '#1982c4' },
  regreso: { label: 'Regreso', color: '#f15bb5' },
};

function blockStyle(block?: string, color?: string) {
  return blockStyles[block ?? ''] ?? { label: block ?? 'Ruta', color: color ?? '#57534e' };
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`));
}

function dayKind(day: Day) {
  const value = `${day.type ?? ''} ${day.intensidad ?? ''}`.toLowerCase();
  if (day.actividades.some((activity) => activity.tipo === 'experiencia') || value.includes('trekking')) return 'trekking';
  if (day.block === 'regreso') return 'regreso';
  if (day.block === 'enlace' || value.includes('enlace')) return 'enlace';
  return 'alpino';
}

const pointCategoryStyles: Record<PointCategory, { label: string; icon: string; color: string }> = {
  salida: { label: 'Salida', icon: 'S', color: '#111827' },
  noche: { label: 'Noche', icon: 'N', color: '#0f766e' },
  trekking: { label: 'Trekking', icon: 'T', color: '#16a34a' },
  mirador: { label: 'Mirador', icon: 'M', color: '#7b61ff' },
  ciudad: { label: 'Ciudad/parada', icon: 'C', color: '#f97316' },
  carretera: { label: 'Carretera/puerto', icon: 'P', color: '#1982c4' },
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function pointCategory(day: Day, pointName: string, position: number, total: number): PointCategory {
  const lower = pointName.toLowerCase();
  const isHighlight = day.highlights?.includes(pointName) || day.points?.find((point) => point.name === pointName)?.type === 'highlight';

  if (position === 0) return 'salida';
  if (position === total - 1 || day.destino === pointName || day.end === pointName) return 'noche';
  if (day.actividades.length > 0 && /(trail|trek|rifugio|lago di sorapis|tre cime|seceda|geisler|cadini|adolf)/i.test(pointName)) return 'trekking';
  if (isHighlight || /(viewpoint|mirador|rifugio|lago|cime|cadini|seceda|edelweiß)/i.test(pointName)) return 'mirador';
  if (/(passo|pass|col |grossglockner|brennero|stelvio|galibier|lautaret|falzarego|giau)/i.test(lower)) return 'carretera';
  return 'ciudad';
}

function pointDescription(day: Day, pointName: string) {
  return displayDayReferences(day.points?.find((point) => point.name === pointName)?.description ?? day.summary ?? day.notas);
}

function pointOccurrence(points: string[], position: number) {
  return points.slice(0, position + 1).filter((point) => point === points[position]).length;
}

function detailWorthText(day: Day) {
  const summary = day.summary ?? '';
  const notes = day.notas ?? '';
  return displayDayReferences(notes.startsWith(summary) ? notes.slice(summary.length).trim() : notes);
}

function dayPointNames(day: Day) {
  return day.mapas.flatMap((map) => map.puntos).filter((point, position, points) => position === 0 || point !== points[position - 1]);
}

const coordinates: Record<string, Coordinates> = {
  'Madrid': [40.4168, -3.7038],
  'Zaragoza': [41.6488, -0.8891],
  'Lleida': [41.6176, 0.62],
  'La Jonquera': [42.4172, 2.8731],
  'Narbonne': [43.1843, 3.0031],
  'Montpellier': [43.6119, 3.8772],
  'Avignon': [43.9493, 4.8055],
  'Sisteron': [44.1986, 5.9438],
  'Lac de Serre-Ponçon': [44.4728, 6.2834],
  'Embrun': [44.565, 6.495],
  'Valence': [44.9334, 4.8924],
  'Grenoble': [45.1885, 5.7245],
  'Col du Lautaret': [45.035, 6.405],
  'Briançon': [44.8994, 6.6432],
  'Col du Galibier': [45.064, 6.407],
  'Valloire': [45.1655, 6.4292],
  'Cervières': [44.8695, 6.7212],
  "Col d'Izoard": [44.8203, 6.735],
  'Brunissard': [44.7789, 6.737],
  'Arvieux': [44.7678, 6.7374],
  'Guillestre': [44.6593, 6.6495],
  'Col de Montgenèvre': [44.931, 6.726],
  'Susa': [45.1378, 7.048],
  'Lago del Moncenisio': [45.2377, 6.957],
  'Lanslebourg-Mont-Cenis': [45.2856, 6.8752],
  'Albertville': [45.6755, 6.3927],
  'Chamonix-Mont-Blanc': [45.9237, 6.8694],
  'Sion': [46.2331, 7.3606],
  'Brig': [46.3159, 7.9878],
  'Realp': [46.5997, 8.5037],
  'Rhone Glacier / Hotel Belvédère': [46.579, 8.386],
  'Gletsch': [46.563, 8.363],
  'Innertkirchen': [46.705, 8.228],
  'Wassen': [46.706, 8.598],
  'Disentis/Mustér': [46.705, 8.857],
  'Chur': [46.8508, 9.532],
  'Davos': [46.8027, 9.8359],
  'Flüela Pass': [46.75, 9.947],
  'Zernez': [46.697, 10.092],
  'Ofenpass / Pass dal Fuorn': [46.64, 10.291],
  'Umbrail Pass': [46.541, 10.433],
  'Stelvio Pass': [46.5287, 10.4534],
  'Bormio': [46.4669, 10.375],
  'Bolzano': [46.4983, 11.3548],
  'Ortisei': [46.5765, 11.6726],
  'Selva di Val Gardena': [46.5547, 11.7609],
  'Santa Cristina Valgardena': [46.5589, 11.7205],
  'Seceda Cable Car': [46.5757, 11.6745],
  'Seceda': [46.6004, 11.7242],
  'Passo Gardena': [46.549, 11.808],
  'Corvara': [46.5505, 11.8734],
  'Passo Campolongo': [46.515, 11.875],
  'Arabba': [46.4989, 11.875],
  'Passo Pordoi': [46.487, 11.812],
  'Canazei': [46.4763, 11.769],
  'Passo Sella': [46.508, 11.757],
  'Passo Falzarego': [46.519, 12.009],
  "Cortina d'Ampezzo": [46.5405, 12.1357],
  'Passo Giau': [46.483, 12.052],
  'Lago di Braies': [46.694, 12.085],
  'Dobbiaco': [46.736, 12.222],
  'Brunico': [46.799, 11.935],
  'Lago di Carezza': [46.409, 11.575],
  'Passo Fedaia': [46.453, 11.889],
  'Lago di Fedaia': [46.456, 11.872],
  'Malga Ciapela': [46.43, 11.912],
  'Alleghe': [46.4075, 12.021],
  'Passo San Pellegrino': [46.378, 11.794],
  'Moena': [46.377, 11.659],
  'Santa Maddalena Val di Funes': [46.6408, 11.714],
  'Parcheggio Zannes': [46.636, 11.765],
  'Adolf Munkel Trail': [46.633, 11.76],
  'Geisleralm': [46.6332, 11.7559],
  'Chiusa / Klausen': [46.641, 11.565],
  'Bressanone / Brixen': [46.715, 11.655],
  'Brenner Pass': [47.006, 11.506],
  'Innsbruck': [47.2692, 11.4041],
  'Zell am Ziller': [47.233, 11.883],
  'Gerlos Alpine Road': [47.218, 12.106],
  'Krimml Waterfalls': [47.216, 12.171],
  'Zell am See': [47.3235, 12.7968],
  'Fusch an der Großglocknerstraße': [47.226, 12.824],
  'Kaiser-Franz-Josefs-Höhe': [47.075, 12.751],
  'Hochtor': [47.083, 12.842],
  'Heiligenblut': [47.039, 12.843],
  'Lienz': [46.8297, 12.769],
  'Sillian': [46.747, 12.421],
  'Lago di Misurina': [46.5833, 12.2548],
  'Rifugio Auronzo': [46.6123, 12.2959],
  'Tre Cime di Lavaredo': [46.6187, 12.3028],
  'Rifugio Locatelli': [46.6368, 12.3105],
  'Passo Tre Croci': [46.5591, 12.2044],
  'Lago di Sorapis': [46.5144, 12.2264],
  'Rifugio Vandelli': [46.5154, 12.2236],
  'Trento': [46.0748, 11.1217],
  'Riva del Garda': [45.8892, 10.8441],
  'Brescia': [45.5416, 10.2118],
  'Milano': [45.4642, 9.19],
  'Torino': [45.0703, 7.6869],
  'Fréjus Tunnel / Modane': [45.193, 6.672],
  'Chambéry': [45.5646, 5.9178],
  'Lyon': [45.764, 4.8357],
  'Perpignan': [42.6887, 2.8948],
  'Calatayud': [41.3535, -1.6432],
  'Medinaceli': [41.1728, -2.4342],
  'Guadalajara': [40.6333, -3.1667],
};

function normalizePoint(point: string) {
  return point.trim();
}

function getPointCoordinates(day: Day, pointName: string): Coordinates | undefined {
  const fromJson = day.points?.find((point) => point.name === pointName);

  if (fromJson) {
    return [fromJson.lat, fromJson.lng];
  }

  return coordinates[pointName];
}

export function TripInteractiveMap({ days, trip }: TripInteractiveMapProps) {
  const [activeDay, setActiveDay] = useState<number | 'all'>('all');
  const [activeBlock, setActiveBlock] = useState<string | 'all'>('all');
  const [detailDay, setDetailDay] = useState<Day | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layersRef = useRef<Leaflet.LayerGroup | null>(null);
  const blocks = Array.from(new Set(days.map((day) => day.block).filter((block): block is string => Boolean(block))));
  const daysByBlock = activeBlock === 'all' ? days : days.filter((day) => day.block === activeBlock);
  const visibleDays = activeDay === 'all' ? daysByBlock : daysByBlock.filter((day) => day.numero === activeDay);
  const totalKm = days.reduce((sum, day) => sum + day.distanciaKm, 0);
  const dolomitesDays = days.filter((day) => day.block?.includes('dolomitas')).length;
  const linkDays = days.filter((day) => day.block === 'enlace' || day.block === 'regreso').length;
  const trekkingDays = days.filter((day) => day.actividades.some((activity) => activity.tipo === 'experiencia')).length;
  const detailIndex = detailDay ? days.findIndex((day) => day.numero === detailDay.numero) : -1;
  const previousDay = detailIndex > 0 ? days[detailIndex - 1] : null;
  const nextDay = detailIndex >= 0 && detailIndex < days.length - 1 ? days[detailIndex + 1] : null;

  function selectDay(day: Day) {
    setActiveDay(day.numero);
    setDetailDay(day);
  }

  const routeSegments = useMemo(() => {
    return visibleDays.map((day) => {
      const points = day.mapas.flatMap((map) => map.puntos).map(normalizePoint);
      const deduped = points.filter((point, index) => index === 0 || point !== points[index - 1]);
      const positions = deduped
        .map((point, index) => ({
          name: point,
          coordinates: getPointCoordinates(day, point),
          category: pointCategory(day, point, index, deduped.length),
        }))
        .filter((point): point is { name: string; coordinates: Coordinates; category: PointCategory } => Boolean(point.coordinates));

      return {
        day,
        color: day.color ?? dayColors[(day.numero - 1) % dayColors.length] ?? '#ef476f',
        positions,
      };
    });
  }, [visibleDays]);

  const bounds = useMemo(() => {
    const allPositions = routeSegments.flatMap((segment) => segment.positions.map((point) => point.coordinates));
    return allPositions.length > 0 ? allPositions : ([[40.4168, -3.7038], [47.2692, 11.4041]] as Coordinates[]);
  }, [routeSegments]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    let cancelled = false;

    import('leaflet').then((leaflet) => {
      if (cancelled || !containerRef.current || mapRef.current) {
        return;
      }

      leafletRef.current = leaflet;
      mapRef.current = leaflet.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      });

      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);

      layersRef.current = leaflet.layerGroup().addTo(mapRef.current);
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const leaflet = leafletRef.current;

    if (!mapReady || !mapRef.current || !layersRef.current || !leaflet) {
      return;
    }

    layersRef.current.clearLayers();

    routeSegments.forEach((segment) => {
      const latLngs = segment.positions.map((point) => leaflet.latLng(point.coordinates[0], point.coordinates[1]));

      if (latLngs.length > 1) {
        const dayPopup = `
          <div style="min-width:240px;font-family:Arial,sans-serif;color:#1c1917;">
            <div style="display:inline-block;border-radius:999px;background:${segment.color};color:white;padding:5px 9px;font-size:11px;font-weight:700;">${displayDayLabel(segment.day.numero)}</div>
            <h3 style="margin:10px 0 6px;font-size:16px;line-height:1.25;">${escapeHtml(segment.day.ruta)}</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0;">
              <span style="border-radius:12px;background:#f5f5f4;padding:7px 8px;font-size:12px;"><strong>${segment.day.distanciaKm}</strong> km</span>
              <span style="border-radius:12px;background:#f5f5f4;padding:7px 8px;font-size:12px;"><strong>${escapeHtml(segment.day.drivingTime ?? `${segment.day.duracionHoras} h`)}</strong></span>
            </div>
            <p style="margin:0 0 8px;font-size:12px;color:#57534e;"><strong>Noche:</strong> ${escapeHtml(segment.day.overnight ?? segment.day.base)}</p>
            <p style="margin:0;font-size:12px;color:#57534e;"><strong>Highlights:</strong> ${escapeHtml((segment.day.highlights ?? []).slice(0, 4).join(' · '))}</p>
          </div>
        `;
        leaflet.polyline(latLngs, {
          color: '#1c1917',
          weight: activeDay === segment.day.numero ? 10 : 8,
          opacity: activeDay === 'all' ? 0.18 : 0.24,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layersRef.current!);

        leaflet.polyline(latLngs, {
          color: segment.color,
          weight: activeDay === segment.day.numero ? 6 : 4.5,
          opacity: activeDay === 'all' ? 0.82 : 0.98,
          lineCap: 'round',
          lineJoin: 'round',
        }).bindPopup(dayPopup, { className: 'route-popup' }).addTo(layersRef.current!);
      }

      segment.positions.forEach((point) => {
        const category = pointCategoryStyles[point.category];
        const popup = `
          <div style="min-width:230px;font-family:Arial,sans-serif;color:#1c1917;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
              <span style="display:inline-flex;height:26px;width:26px;align-items:center;justify-content:center;border-radius:999px;background:${category.color};color:white;font-size:12px;font-weight:800;">${category.icon}</span>
              <span style="border-radius:999px;background:#f5f5f4;padding:5px 9px;font-size:11px;font-weight:700;color:#57534e;">${escapeHtml(category.label)}</span>
            </div>
            <h3 style="margin:0 0 6px;font-size:17px;line-height:1.2;">${escapeHtml(point.name)}</h3>
            <p style="margin:0 0 8px;font-size:12px;color:#78716c;">${displayDayLabel(segment.day.numero)} · ${escapeHtml(segment.day.ruta)}</p>
            <p style="margin:0 0 10px;font-size:12px;line-height:1.45;color:#44403c;">${escapeHtml(pointDescription(segment.day, point.name)).slice(0, 180)}</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.name)}" target="_blank" rel="noreferrer" style="display:inline-block;border-radius:999px;background:#1c1917;color:white;padding:8px 11px;font-size:12px;font-weight:700;text-decoration:none;">Abrir en Google Maps</a>
          </div>
        `;

        leaflet.marker(point.coordinates, {
          icon: leaflet.divIcon({
            className: 'trip-map-marker',
            html: `<span style="display:flex;height:${activeDay === segment.day.numero ? 30 : 26}px;width:${activeDay === segment.day.numero ? 30 : 26}px;align-items:center;justify-content:center;border-radius:999px;background:${category.color};color:white;border:3px solid white;box-shadow:0 10px 22px rgba(28,25,23,.28);font-size:11px;font-weight:800;">${category.icon}</span>`,
            iconSize: [activeDay === segment.day.numero ? 30 : 26, activeDay === segment.day.numero ? 30 : 26],
            iconAnchor: [activeDay === segment.day.numero ? 15 : 13, activeDay === segment.day.numero ? 15 : 13],
            popupAnchor: [0, -14],
          }),
        })
          .bindPopup(popup, { className: 'route-popup' })
          .addTo(layersRef.current!);
      });
    });

    const leafletBounds = leaflet.latLngBounds(bounds.map((point) => leaflet.latLng(point[0], point[1])));
    window.requestAnimationFrame(() => {
      mapRef.current?.invalidateSize();
      mapRef.current?.fitBounds(leafletBounds, { padding: [28, 28], maxZoom: activeDay === 'all' ? 7 : 10 });
    });
  }, [activeDay, bounds, mapReady, routeSegments]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const container = containerRef.current;

    const resize = window.setTimeout(() => {
      map.invalidateSize();
    }, 160);

    const observer = container ? new ResizeObserver(() => {
      window.requestAnimationFrame(() => map.invalidateSize());
    }) : null;

    if (container && observer) {
      observer.observe(container);
    }

    return () => {
      window.clearTimeout(resize);
      observer?.disconnect();
    };
  }, [detailDay, mapReady]);

  const detailPanel = detailDay ? (() => {
    const style = blockStyle(detailDay.block, detailDay.color);
    const kind = dayKind(detailDay);
    const hasTrekking = detailDay.actividades.some((activity) => activity.tipo === 'experiencia') || kind === 'trekking';
    const points = dayPointNames(detailDay);
    const worthText = detailWorthText(detailDay);

    return (
      <aside className="flex max-h-[720px] flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-[#fbf7ef] shadow-xl shadow-stone-300/40 xl:max-h-[820px]">
        <div className="border-b border-stone-200 bg-white p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{displayDayLabel(detailDay.numero)} · {formatDate(detailDay.fecha)}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{detailDay.origen} → {detailDay.destino}</h3>
            </div>
            <button type="button" onClick={() => setDetailDay(null)} className="rounded-full bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-200">Cerrar</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white" style={{ backgroundColor: style.color }}>{style.label}</span>
            <span className="rounded-full bg-stone-950 px-3 py-1.5 text-xs font-semibold capitalize text-white">{kind}</span>
            {hasTrekking && <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">trekking</span>}
            {getDayCountries(detailDay.numero).map((country) => <span key={`detail-country-${country}`} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700">{country}</span>)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-b border-stone-200 bg-white px-5 py-3 md:px-6">
          <button
            type="button"
            disabled={!previousDay}
            onClick={() => previousDay && selectDay(previousDay)}
            className="rounded-2xl bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700 transition enabled:hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Día anterior
          </button>
          <button
            type="button"
            disabled={!nextDay}
            onClick={() => nextDay && selectDay(nextDay)}
            className="rounded-2xl bg-stone-950 px-3 py-2 text-sm font-semibold text-white transition enabled:hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Día siguiente
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5 md:p-6">
          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Ruta completa</p>
            <p className="mt-2 text-base font-semibold leading-6 text-stone-950">{detailDay.ruta}</p>
            <p className="mt-3 text-sm leading-6 text-stone-600">{displayDayReferences(detailDay.summary ?? detailDay.notas)}</p>
          </section>

          {worthText && <section className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Por qué merece la pena</p>
            <p className="mt-2 text-sm leading-6 text-amber-950">{worthText}</p>
          </section>}

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-[11px] uppercase tracking-wide text-stone-500">Km</p><p className="mt-1 text-2xl font-semibold text-stone-950">{detailDay.distanciaKm}</p></div>
            <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-[11px] uppercase tracking-wide text-stone-500">Conducción</p><p className="mt-1 text-2xl font-semibold text-stone-950">{detailDay.drivingTime ?? `${detailDay.duracionHoras} h`}</p></div>
            <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-[11px] uppercase tracking-wide text-stone-500">Coste estimado</p><p className="mt-1 text-2xl font-semibold text-stone-950">{detailDay.estimatedCost ?? detailDay.presupuestoDia.total}€</p></div>
            <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-[11px] uppercase tracking-wide text-stone-500">Noche</p><p className="mt-1 text-sm font-semibold leading-5 text-stone-950">{detailDay.overnight ?? detailDay.base}</p></div>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Highlights</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(detailDay.highlights ?? []).map((highlight, position, highlights) => <span key={`detail-${detailDay.numero}-highlight-${highlight}-${pointOccurrence(highlights, position)}`} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700">{highlight}</span>)}
            </div>
          </section>

          {detailDay.warnings && detailDay.warnings.length > 0 && <section className="rounded-3xl border border-amber-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Warnings</p>
            <div className="mt-3 space-y-2">
              {detailDay.warnings.map((warning, position, warnings) => <p key={`detail-${detailDay.numero}-warning-${warning}-${pointOccurrence(warnings, position)}`} className="rounded-2xl bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-900">{warning}</p>)}
            </div>
          </section>}

          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Alojamiento</p>
            <p className="mt-2 text-sm leading-6 text-stone-700">{detailDay.accommodationAdvice ?? detailDay.alojamientos[0]?.notas}</p>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Puntos del día</p>
            <div className="mt-3 divide-y divide-stone-100">
              {points.map((point, position) => {
                const category = pointCategoryStyles[pointCategory(detailDay, point, position, points.length)];
                return (
                  <a key={`detail-${detailDay.numero}-point-${point}-${pointOccurrence(points, position)}`} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 py-3 text-sm transition hover:text-stone-950">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ backgroundColor: category.color }}>{category.icon}</span>
                      <span className="min-w-0 truncate font-medium text-stone-800">{point}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">Google Maps</span>
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    );
  })() : null;

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-white shadow-xl shadow-stone-300/40 ring-1 ring-stone-950/5">
      <div className="grid gap-0 xl:grid-cols-[410px_1fr]">
        <aside className="border-b border-stone-200 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-800 p-5 text-white xl:max-h-[820px] xl:overflow-y-auto xl:border-b-0 xl:border-r xl:border-stone-800 xl:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Roadbook interactivo</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Dolomitas + Alpes en moto</h3>
          <p className="mt-3 text-sm leading-6 text-stone-300">Ruta optimizada · 4-22 septiembre 2026 · Sin dormir en Suiza</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15">{days.length} días</span>
            <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15">0 noches en Suiza</span>
            <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15">Dolomitas prioridad</span>
            <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15">Salida desde Loranca</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10"><p className="text-[11px] uppercase tracking-wide text-stone-400">Km aprox.</p><p className="mt-1 text-2xl font-semibold">{totalKm.toLocaleString('es-ES')}</p></div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10"><p className="text-[11px] uppercase tracking-wide text-stone-400">Dolomitas</p><p className="mt-1 text-2xl font-semibold">{trip?.resumenEjecutivo?.diasDolomitas ?? dolomitesDays}</p></div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10"><p className="text-[11px] uppercase tracking-wide text-stone-400">Enlace</p><p className="mt-1 text-2xl font-semibold">{trip?.resumenEjecutivo?.diasEnlace ?? linkDays}</p></div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10"><p className="text-[11px] uppercase tracking-wide text-stone-400">Trekking</p><p className="mt-1 text-2xl font-semibold">{trip?.resumenEjecutivo?.diasTrekking ?? trekkingDays}</p></div>
          </div>

          <p className="mt-5 text-sm leading-6 text-stone-300">Amplía, arrastra y pulsa cualquier punto para ver qué día pertenece y abrirlo en Google Maps.</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" aria-pressed={activeBlock === 'all'} onClick={() => { setActiveBlock('all'); setActiveDay('all'); setDetailDay(null); }} className={`rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-white/10 transition ${activeBlock === 'all' ? 'bg-white text-stone-950' : 'bg-white/10 text-stone-200 hover:bg-white/15'}`}>Todos</button>
            {blocks.map((block) => {
              const style = blockStyle(block);
              return <button key={block} type="button" aria-pressed={activeBlock === block} onClick={() => { setActiveBlock(block); setActiveDay('all'); setDetailDay(null); }} className={`rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-white/10 transition ${activeBlock === block ? 'bg-white text-stone-950' : 'bg-white/10 text-stone-200 hover:bg-white/15'}`}><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: style.color }} />{style.label}</button>;
            })}
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => {
                setActiveDay('all');
                setDetailDay(null);
              }}
              className={`w-full rounded-3xl border bg-white p-5 text-left text-stone-950 shadow-sm shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 ${activeDay === 'all' ? 'border-amber-300 ring-2 ring-amber-300/40' : 'border-white/80'}`}
            >
              <span className="text-sm font-semibold">Ver viaje completo</span>
              <span className="mt-2 block text-xs leading-5 text-stone-500">España, Francia, Italia y Austria con 0 noches en Suiza.</span>
              <span className="mt-4 inline-flex rounded-full bg-stone-950 px-3 py-2 text-xs font-semibold text-white">Mostrar ruta completa</span>
            </button>
            {daysByBlock.map((day) => {
              const style = blockStyle(day.block, day.color);
              const selected = activeDay === day.numero;
              const kind = dayKind(day);
              const hasTrekking = day.actividades.some((activity) => activity.tipo === 'experiencia') || kind === 'trekking';
              return (
                <button
                  type="button"
                  key={day.numero}
                  onClick={() => selectDay(day)}
                  className={`w-full rounded-3xl border bg-white p-5 text-left text-stone-950 shadow-sm shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 ${selected ? 'border-amber-300 ring-2 ring-amber-300/40' : 'border-white/80'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{displayDayLabel(day.numero)} · {formatDate(day.fecha)}</p>
                      <p className="mt-2 text-base font-semibold leading-6 text-stone-950">{day.origen} → {day.destino}</p>
                    </div>
                    <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: style.color }}>{style.label}</span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-stone-600">{day.ruta}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {getDayCountries(day.numero).map((country) => <span key={`map-day-${day.numero}-${country}`} className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700">{country}</span>)}
                  </div>
                  <p className="mt-3 rounded-2xl bg-stone-50 px-3 py-2 text-xs font-medium text-stone-600">Noche recomendada: <span className="text-stone-950">{day.overnight ?? day.base}</span></p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <span className="rounded-2xl bg-stone-100 px-3 py-2 font-semibold text-stone-700">{day.distanciaKm} km</span>
                    <span className="rounded-2xl bg-stone-100 px-3 py-2 font-semibold text-stone-700">{day.drivingTime ?? `${day.duracionHoras} h`}</span>
                    {hasTrekking && <span className="rounded-2xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">trekking</span>}
                    <span className="rounded-2xl bg-stone-100 px-3 py-2 font-semibold capitalize text-stone-700">{kind}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(day.highlights ?? []).slice(0, 3).map((highlight) => <span key={`${day.numero}-${highlight}`} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700 ring-1 ring-stone-200">{highlight}</span>)}
                  </div>

                  {day.warnings?.[0] && <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Aviso: {day.warnings[0]}</p>}

                  <span className="mt-4 inline-flex rounded-full bg-stone-950 px-3 py-2 text-xs font-semibold text-white">Ver detalle</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className={`grid gap-4 bg-stone-100 p-3 md:p-4 ${detailDay ? 'xl:grid-cols-[minmax(0,1fr)_420px]' : ''}`}>
          <div className="relative h-[560px] min-h-[560px] overflow-hidden rounded-[2rem] bg-stone-200 md:h-[720px] xl:h-[820px]">
            <div className="pointer-events-none absolute bottom-4 left-4 z-[400] rounded-2xl bg-white/90 px-4 py-3 shadow-lg shadow-stone-400/30 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Mapa protagonista</p>
              <p className="mt-1 text-sm font-semibold text-stone-950">{activeDay === 'all' ? 'Ruta completa' : `Día ${activeDay}`}</p>
            </div>
            <div className="absolute right-4 top-4 z-[410] grid max-w-[min(330px,calc(100%-2rem))] gap-2">
              <button
                type="button"
                aria-expanded={showLegend}
                onClick={() => setShowLegend((value) => !value)}
                className="justify-self-end rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-stone-800 shadow-lg shadow-stone-400/30 ring-1 ring-stone-200 backdrop-blur transition hover:bg-white"
              >
                {showLegend ? 'Ocultar leyenda' : 'Ver leyenda'}
              </button>
              {showLegend && (
                <div className="pointer-events-none grid gap-2 rounded-2xl bg-white/92 p-3 shadow-lg shadow-stone-400/30 backdrop-blur">
                  <div className="flex flex-wrap justify-end gap-2">
                    {Object.entries(blockStyles).map(([key, style]) => (
                      <span key={key} className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.color }} />{style.label}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 border-t border-stone-200 pt-2">
                    {Object.entries(pointCategoryStyles).map(([key, style]) => (
                      <span key={key} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 ring-1 ring-stone-200">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ backgroundColor: style.color }}>{style.icon}</span>{style.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div ref={containerRef} className="h-full w-full" />
          </div>
          {detailPanel}
        </div>
      </div>
    </section>
  );
}
