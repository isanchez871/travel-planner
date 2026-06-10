'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import { AccommodationCandidate, Day } from '@/lib/types';
import { displayDayLabel } from '@/lib/displayDay';
import accommodationData from '@/data/viajes/dolomitas-alpes-2026-alojamientos.json';
import 'leaflet/dist/leaflet.css';

interface AlojamientosTabProps {
  days: Day[];
}

type SlotCandidate = AccommodationCandidate & {
  checkin: string;
  checkout: string;
  arrivalPoint: string;
  searchBookingUrl: string;
  searchAirbnbUrl: string;
  mapsUrl: string;
};

const STORAGE_KEY = 'dolomitas-alpes-2026-accommodation-shortlist-v2';
const MAX_PRICE = 150;
const FLEX_MAX_PRICE = 200;

function buildBookingUrl(destination: string, checkin: string, checkout: string) {
  const params = new URLSearchParams({
    ss: destination,
    checkin,
    checkout,
    group_adults: '2',
    no_rooms: '1',
    group_children: '0',
    selected_currency: 'EUR',
    order: 'price',
    nflt: 'review_score=70;room_facilities=38;hotelfacility=2',
  });

  return `https://www.booking.com/searchresults.es.html?${params.toString()}`;
}

function buildAirbnbUrl(destination: string, checkin: string, checkout: string) {
  const params = new URLSearchParams({
    query: destination,
    checkin,
    checkout,
    adults: '2',
    price_max: String(MAX_PRICE),
  });

  return `https://www.airbnb.es/s/homes?${params.toString()}`;
}

function buildMapsUrl(origin: string, lat: number, lng: number) {
  const params = new URLSearchParams({
    api: '1',
    origin,
    destination: `${lat},${lng}`,
    travelmode: 'driving',
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}

function destinationForDay(day: Day) {
  return (day.overnight ?? day.alojamientos[0]?.ubicacion ?? day.destino).replace('Casa', '').trim() || day.destino;
}

function arrivalCoordinates(day: Day) {
  const last = day.points?.at(-1);
  return { lat: last?.lat ?? 0, lng: last?.lng ?? 0 };
}

function buildCandidates(days: Day[]) {
  const realCandidates = (accommodationData.candidates as AccommodationCandidate[]);

  return days.flatMap((day, dayIndex) => {
    const checkout = days[dayIndex + 1]?.fecha;

    if (!checkout || (day.overnight ?? day.base).toLowerCase().includes('casa')) {
      return [];
    }

    const dayReal = realCandidates
      .filter((candidate) => candidate.dayNumber === day.numero)
      .map((candidate): SlotCandidate => ({
        ...candidate,
        checkin: day.fecha,
        checkout,
        arrivalPoint: day.destino,
        searchBookingUrl: buildBookingUrl(candidate.location, day.fecha, checkout),
        searchAirbnbUrl: buildAirbnbUrl(candidate.location, day.fecha, checkout),
        mapsUrl: buildMapsUrl(day.destino, candidate.lat, candidate.lng),
      }));

    return dayReal
      .filter((candidate) => candidate.status === 'ready' && candidate.url && candidate.photoUrls.length > 0)
      .filter((candidate) => candidate.price <= FLEX_MAX_PRICE && candidate.rating >= 7 && candidate.privateBathroom && candidate.privateDoubleRoom)
      .sort((a, b) => a.price - b.price)
      .slice(0, 5);
  });
}

function searchModeLabel(mode: AccommodationCandidate['searchMode']) {
  if (mode === 'ampliada') return 'Búsqueda ampliada';
  if (mode === 'manual') return 'Manual';
  return 'Búsqueda estricta';
}

function searchModeClass(mode: AccommodationCandidate['searchMode']) {
  if (mode === 'ampliada') return 'bg-sky-100 text-sky-800';
  if (mode === 'manual') return 'bg-violet-100 text-violet-800';
  return 'bg-emerald-100 text-emerald-800';
}

function accommodationNightNumbers(days: Day[]) {
  return days
    .slice(0, -1)
    .filter((day) => !(day.overnight ?? day.base).toLowerCase().includes('casa'))
    .map((day) => day.numero);
}

function recommendationScore(candidate: SlotCandidate) {
  const providerBonus = candidate.provider === 'Booking' ? -10 : candidate.provider === 'Directo' ? -4 : 0;
  const parkingBonus = candidate.parking === 'gratis' ? -18 : candidate.parking === 'pago' ? 8 : 4;
  const distancePenalty = Math.min(candidate.distanceFromArrivalKm, 80) * 1.4;
  const ratingBonus = (candidate.rating - 7) * -8;

  return candidate.price + distancePenalty + parkingBonus + providerBonus + ratingBonus;
}

function recommendedCandidate(candidates: SlotCandidate[]) {
  return [...candidates].sort((a, b) => recommendationScore(a) - recommendationScore(b))[0];
}

function recommendationReason(candidate: SlotCandidate) {
  const parkingText = candidate.parking === 'gratis' ? 'parking gratis o indicado como incluido' : 'parking pendiente de confirmar';
  return `Lo marco como favorito porque combina precio de ${candidate.price}€, rating ${candidate.rating}+, ${parkingText} y una distancia aproximada de ${candidate.distanceFromArrivalKm} km desde la llegada. Es la mejor relación precio/encaje de ruta entre las opciones válidas de esta noche.`;
}

function MiniAccommodationMap({ day, candidates, selectedId }: { day: Day; candidates: SlotCandidate[]; selectedId?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layersRef = useRef<Leaflet.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    import('leaflet').then((leaflet) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      mapRef.current = leaflet.map(containerRef.current, { zoomControl: false, scrollWheelZoom: false });
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mapRef.current);
      layersRef.current = leaflet.layerGroup().addTo(mapRef.current);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, []);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      if (!mapRef.current || !layersRef.current) return;

      layersRef.current.clearLayers();
      const arrival = arrivalCoordinates(day);
      const points = [leaflet.latLng(arrival.lat, arrival.lng), ...candidates.map((candidate) => leaflet.latLng(candidate.lat, candidate.lng))];

      leaflet.marker([arrival.lat, arrival.lng], {
        icon: leaflet.divIcon({ className: 'trip-map-marker', html: '<span style="display:flex;height:28px;width:28px;align-items:center;justify-content:center;border-radius:999px;background:#111827;color:white;border:3px solid white;font-size:11px;font-weight:800;">LL</span>', iconSize: [28, 28], iconAnchor: [14, 14] }),
      }).bindPopup('Punto final de llegada').addTo(layersRef.current);

      candidates.forEach((candidate, index) => {
        const isSelected = candidate.id === selectedId;
        const color = candidate.status === 'ready' ? '#16a34a' : '#f59e0b';
        leaflet.marker([candidate.lat, candidate.lng], {
          icon: leaflet.divIcon({ className: 'trip-map-marker', html: `<span style="display:flex;height:${isSelected ? 32 : 28}px;width:${isSelected ? 32 : 28}px;align-items:center;justify-content:center;border-radius:999px;background:${color};color:white;border:3px solid white;font-size:11px;font-weight:800;">${index + 1}</span>`, iconSize: [isSelected ? 32 : 28, isSelected ? 32 : 28], iconAnchor: [isSelected ? 16 : 14, isSelected ? 16 : 14] }),
        }).bindPopup(candidate.name).addTo(layersRef.current!);
      });

      mapRef.current.invalidateSize();
      mapRef.current.fitBounds(leaflet.latLngBounds(points), { padding: [28, 28], maxZoom: 13 });
    });
  }, [candidates, day, selectedId]);

  return <div ref={containerRef} className="h-[320px] overflow-hidden rounded-[1.5rem] bg-stone-200" />;
}

export function AlojamientosTab({ days }: AlojamientosTabProps) {
  const candidates = useMemo(() => buildCandidates(days), [days]);
  const dayNumbers = accommodationNightNumbers(days);
  const firstDayWithCandidates = candidates[0]?.dayNumber ?? dayNumbers[0] ?? 0;
  const [selectedDay, setSelectedDay] = useState(firstDayWithCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<string | undefined>();
  const [favorites, setFavorites] = useState<SlotCandidate[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as SlotCandidate[]) : [];
    } catch {
      return [];
    }
  });

  const selectedDayData = days.find((day) => day.numero === selectedDay) ?? days[0];
  const visibleCandidates = candidates.filter((candidate) => candidate.dayNumber === selectedDay).sort((a, b) => a.price - b.price);
  const recommendation = recommendedCandidate(visibleCandidates);
  const favoriteIds = new Set(favorites.map((favorite) => favorite.id));
  const totalFavorites = favorites.reduce((sum, favorite) => sum + favorite.price, 0);
  const readyCount = candidates.length;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  function toggleFavorite(candidate: SlotCandidate) {
    setFavorites((current) => {
      if (current.some((item) => item.id === candidate.id)) return current.filter((item) => item.id !== candidate.id);
      return [...current, candidate].sort((a, b) => a.dayNumber - b.dayNumber || a.price - b.price);
    });
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-950 text-white shadow-2xl shadow-stone-300/40">
        <div className="relative p-6 md:p-8">
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,#f59e0b,transparent_28%),radial-gradient(circle_at_82%_18%,#38bdf8,transparent_24%),linear-gradient(135deg,#0c0a09,#1c1917)]" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_440px] md:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Reservas críticas</p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">Alojamientos reales y mi recomendado</h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-300 md:text-base">Solo se muestran candidatos con fotos, precio, coordenadas y enlace usable. Están ordenados por precio y cada noche marca mi favorito según precio, distancia, rating, parking y encaje de ruta. Si no basta el filtro estricto, la tarjeta se marca como búsqueda ampliada.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><p className="text-2xl font-semibold">{dayNumbers.length}</p><p className="mt-1 text-xs text-stone-300">noches</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><p className="text-2xl font-semibold">{readyCount}</p><p className="mt-1 text-xs text-stone-300">concretos</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><p className="text-2xl font-semibold">≤150€</p><p className="mt-1 text-xs text-stone-300">estricto</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 shadow-sm">
        Revisa siempre el precio final, tasas, baño privado y parking en la página del alojamiento antes de reservar. El filtro estricto es 150€/noche; cuando no hay suficientes opciones válidas, amplio hasta 200€ y lo indico en cada tarjeta.
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="self-start rounded-[2rem] border border-stone-200 bg-white p-3 shadow-sm xl:sticky xl:top-24">
          <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Noches</p>
          <div className="space-y-2">
            {dayNumbers.map((dayNumber) => {
              const day = days.find((item) => item.numero === dayNumber);
              const selected = dayNumber === selectedDay;
              const count = favorites.filter((favorite) => favorite.dayNumber === dayNumber).length;

              return (
                <button key={dayNumber} type="button" onClick={() => { setSelectedDay(dayNumber); setSelectedCandidate(undefined); }} className={`w-full rounded-2xl p-3 text-left transition ${selected ? 'bg-stone-950 text-white' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'}`}>
                  <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">{displayDayLabel(dayNumber)}</span>{count > 0 && <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs font-bold text-stone-950">{count}</span>}</div>
                  <p className="mt-1 line-clamp-1 text-xs opacity-75">{day?.overnight ?? day?.base}</p>
                  <p className="mt-1 text-[11px] opacity-70">{day && formatDate(day.fecha)} → {day && formatDate(days[days.findIndex((item) => item.numero === dayNumber) + 1]?.fecha ?? day.fecha)}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="grid gap-5 2xl:grid-cols-[1fr_420px]">
            <div className="grid gap-5 lg:grid-cols-2">
              {visibleCandidates.length === 0 && (
                <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-950 lg:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Sin candidatos válidos importados</p>
                  <h3 className="mt-2 text-2xl font-semibold">Falta preselección real para esta noche</h3>
                  <p className="mt-3 text-sm leading-6">No muestro tarjetas falsas. Hay que buscar alojamientos reales para {selectedDayData.overnight ?? selectedDayData.base}, primero con precio máximo 150€ y, si no basta, búsqueda ampliada hasta 200€, rating +7, baño privado, doble privada y parking preferente.</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href={buildBookingUrl(destinationForDay(selectedDayData), selectedDayData.fecha, days[days.findIndex((day) => day.numero === selectedDay) + 1]?.fecha ?? selectedDayData.fecha)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white">Buscar en Booking</a>
                    <a href={buildAirbnbUrl(destinationForDay(selectedDayData), selectedDayData.fecha, days[days.findIndex((day) => day.numero === selectedDay) + 1]?.fecha ?? selectedDayData.fecha)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Buscar en Airbnb</a>
                  </div>
                </div>
              )}
              {visibleCandidates.map((candidate, index) => {
                const isFavorite = favoriteIds.has(candidate.id);
                const isRecommended = recommendation?.id === candidate.id;

                return (
                  <article key={candidate.id} onMouseEnter={() => setSelectedCandidate(candidate.id)} className={`overflow-hidden rounded-[2rem] border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl ${isRecommended ? 'border-emerald-300 bg-emerald-50/40 ring-2 ring-emerald-200' : isFavorite ? 'border-amber-300 ring-2 ring-amber-200' : 'border-stone-200'}`}>
                    <div className="bg-gradient-to-br from-stone-950 to-stone-800 p-5 text-white">
                      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">#{index + 1} · {candidate.provider}</p><h3 className="mt-2 text-xl font-semibold leading-6">{candidate.name}</h3><div className="mt-3 flex flex-wrap gap-2"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${searchModeClass(candidate.searchMode)}`}>{searchModeLabel(candidate.searchMode)}</span>{isRecommended && <span className="inline-flex rounded-full bg-emerald-300 px-3 py-1 text-xs font-black uppercase tracking-wide text-stone-950">Mi favorito</span>}</div></div><span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-stone-950">{candidate.price}€</span></div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {(candidate.photoUrls.length > 0 ? candidate.photoUrls.slice(0, 3) : ['Pendiente foto 1', 'Pendiente foto 2', 'Pendiente foto 3']).map((photo, photoIndex) => (
                          candidate.photoUrls.length > 0 ? <img key={photo} src={photo} alt={`${candidate.name} foto ${photoIndex + 1}`} className="h-20 rounded-xl object-cover" /> : <div key={photo} className="flex h-20 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-2 text-center text-[10px] text-stone-300">{photo}</div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      {isRecommended && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">{recommendationReason(candidate)}</p>}
                      {candidate.searchNote && <p className={`rounded-2xl p-3 text-sm leading-6 ${candidate.searchMode === 'ampliada' ? 'border border-sky-200 bg-sky-50 text-sky-950' : 'border border-stone-200 bg-stone-50 text-stone-700'}`}>{candidate.searchNote}</p>}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Rating</p><p className="font-semibold text-stone-950">{candidate.rating}+</p></div>
                        <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Régimen</p><p className="font-semibold text-stone-950">{candidate.board}</p></div>
                        <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Baño</p><p className="font-semibold text-stone-950">{candidate.privateBathroom ? 'Privado' : 'No válido'}</p></div>
                        <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Parking</p><p className="font-semibold text-stone-950">{candidate.parking}{candidate.parkingCost ? ` · ${candidate.parkingCost}€` : ''}</p></div>
                      </div>
                      <p className="text-sm leading-6 text-stone-600">{candidate.notes}</p>
                      <div className="flex flex-wrap gap-2">{candidate.features.map((feature) => <span key={feature} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700">{feature}</span>)}</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <a href={candidate.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-stone-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-amber-600">Reservar directo</a>
                        <a href={candidate.mapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-sky-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-sky-700">Mapa desde llegada</a>
                      </div>
                      <button type="button" onClick={() => toggleFavorite(candidate)} className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${isFavorite ? 'bg-amber-300 text-stone-950 hover:bg-amber-400' : 'bg-stone-100 text-stone-800 hover:bg-stone-200'}`}>{isFavorite ? 'Quitar de preselección' : 'Añadir a preselección'}</button>
                    </div>
                  </article>
                );
              })}
            </div>
            <aside className="self-start rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm 2xl:sticky 2xl:top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Mapa del día</p>
              <h3 className="mt-2 text-xl font-semibold text-stone-950">Llegada vs alojamientos</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">Marcador LL = llegada del día. Marcadores numerados = candidatos ordenados por precio.</p>
              <div className="mt-4"><MiniAccommodationMap day={selectedDayData} candidates={visibleCandidates} selectedId={selectedCandidate} /></div>
            </aside>
          </section>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Preselección compartible</p><h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Favoritos para decidir en grupo</h3></div><span className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white">Total: {totalFavorites.toLocaleString('es-ES')}€</span></div>
        {favorites.length === 0 ? <p className="mt-5 rounded-2xl bg-stone-50 p-5 text-sm text-stone-600">Todavía no hay alojamientos concretos preseleccionados.</p> : <div className="mt-5 overflow-x-auto"><table className="min-w-full divide-y divide-stone-200 text-left text-sm"><thead className="text-xs uppercase tracking-wide text-stone-500"><tr><th className="px-3 py-3">Día</th><th className="px-3 py-3">Alojamiento</th><th className="px-3 py-3">Fechas</th><th className="px-3 py-3">Precio</th><th className="px-3 py-3">Características</th><th className="px-3 py-3">Acciones</th></tr></thead><tbody className="divide-y divide-stone-100">{favorites.map((favorite) => <tr key={favorite.id}><td className="px-3 py-4 font-semibold text-stone-950">{displayDayLabel(favorite.dayNumber)}</td><td className="px-3 py-4"><p className="font-semibold text-stone-950">{favorite.name}</p><p className="text-xs text-stone-500">{favorite.provider} · {favorite.location}</p></td><td className="px-3 py-4 text-stone-600">{favorite.checkin} → {favorite.checkout}</td><td className="px-3 py-4 font-semibold text-stone-950">{favorite.price}€</td><td className="px-3 py-4 text-stone-600">{favorite.board}; parking {favorite.parking}; rating {favorite.rating}</td><td className="px-3 py-4"><div className="flex flex-wrap gap-2"><a href={favorite.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-stone-950 px-3 py-1.5 text-xs font-semibold text-white">Reservar</a><button type="button" onClick={() => toggleFavorite(favorite)} className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700">Quitar</button></div></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
