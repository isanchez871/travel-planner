import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const tripPath = join(root, 'src/data/viajes/dolomitas-alpes-2026.json');
const outputPath = join(root, 'src/data/viajes/dolomitas-alpes-2026-alojamientos.json');
const apiKey = process.env.SERPAPI_API_KEY;
const maxPrice = Number(process.env.ACCOMMODATION_MAX_PRICE ?? 150);
const flexibleMaxPrice = Number(process.env.ACCOMMODATION_FLEX_MAX_PRICE ?? 200);
const minRating = Number(process.env.ACCOMMODATION_MIN_RATING ?? 7);
const maxPerNight = Number(process.env.ACCOMMODATION_RESULTS_PER_NIGHT ?? 5);
const maxDistanceFromArrival = Number(process.env.ACCOMMODATION_MAX_DISTANCE_KM ?? 180);
const flexibleMaxDistanceFromArrival = Number(process.env.ACCOMMODATION_FLEX_MAX_DISTANCE_KM ?? 260);

const trip = JSON.parse(readFileSync(tripPath, 'utf8'));
const existingOutput = JSON.parse(readFileSync(outputPath, 'utf8'));

function destinationForDay(day) {
  return (day.overnight ?? day.alojamientos?.[0]?.ubicacion ?? day.destino).replace('Casa', '').trim() || day.destino;
}

function destinationOptions(day) {
  return destinationForDay(day)
    .split('/')
    .map((item) => item.trim())
    .filter(Boolean);
}

function countryForDestination(destination, day) {
  const lower = destination.toLowerCase();

  if (/(lleida|fraga|zaragoza|girona)/.test(lower)) return 'Spain';
  if (/(nîmes|nimes|avignon|narbona|narbonne|perpiñán|perpignan|briançon|briancon|bourg-saint-maurice|albertville)/.test(lower)) return 'France';
  if (/(lienz|zell am see|kaprun)/.test(lower)) return 'Austria';
  if (day.numero >= 4 && day.numero <= 15) return 'Italy';
  return '';
}

function searchQuery(destination, day) {
  const country = countryForDestination(destination, day);
  return country ? `${destination}, ${country}` : destination;
}

function arrivalCoordinates(day) {
  const last = day.points?.at(-1);
  return { lat: last?.lat ?? 0, lng: last?.lng ?? 0 };
}

function distanceKm(a, b) {
  const radius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Number((radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))).toFixed(1));
}

function searchUrl(destination, day, checkin, checkout, priceLimit) {
  const params = new URLSearchParams({
    engine: 'google_hotels',
    q: searchQuery(destination, day),
    check_in_date: checkin,
    check_out_date: checkout,
    adults: '2',
    currency: 'EUR',
    gl: 'es',
    hl: 'es',
    max_price: String(priceLimit),
    api_key: apiKey,
  });

  return `https://serpapi.com/search.json?${params.toString()}`;
}

function getPrice(property) {
  const raw = property.rate_per_night?.extracted_lowest || property.total_rate?.extracted_lowest || property.extracted_price || property.price;
  return typeof raw === 'number' ? Math.round(raw) : Number(String(raw ?? '').replace(/[^0-9]/g, '')) || maxPrice;
}

function getRating(property) {
  const raw = property.overall_rating || property.rating || property.extracted_rating;
  return typeof raw === 'number' ? raw : Number(raw) || minRating;
}

function getCoordinates(property, fallback) {
  const gps = property.gps_coordinates ?? property.coordinates ?? {};
  const lat = Number(gps.latitude ?? gps.lat ?? property.latitude ?? fallback.lat);
  const lng = Number(gps.longitude ?? gps.lng ?? property.longitude ?? fallback.lng);
  return { lat, lng };
}

function getPhotos(property) {
  const images = [property.thumbnail, ...(property.images ?? property.photos ?? [])].filter(Boolean);
  return images
    .map((image) => (typeof image === 'string' ? image : image.thumbnail || image.original_image || image.url || image.link))
    .filter((url, index, list) => typeof url === 'string' && /^https?:\/\//.test(url) && list.indexOf(url) === index)
    .slice(0, 5);
}

function isUsableReservationUrl(url) {
  return typeof url === 'string' && /^https?:\/\//.test(url) && !url.includes('serpapi.com');
}

function directUrl(property) {
  return [property.booking_link, property.link, property.website]
    .find((url) => isUsableReservationUrl(url)) ?? '';
}

function inferParking(property) {
  const text = JSON.stringify(property).toLowerCase();
  if (text.includes('parking gratuito') || text.includes('free parking')) return 'gratis';
  if (text.includes('parking')) return 'confirmar';
  return 'confirmar';
}

function inferBoard(property) {
  const text = JSON.stringify(property).toLowerCase();
  if (text.includes('desayuno') || text.includes('breakfast')) return 'alojamiento y desayuno';
  if (text.includes('media pensión') || text.includes('half board')) return 'media pensión';
  if (text.includes('pensión completa') || text.includes('full board')) return 'pensión completa';
  return 'solo alojamiento';
}

function toCandidate(property, day, checkout, index, mode) {
  const arrival = arrivalCoordinates(day);
  const coords = getCoordinates(property, arrival);
  const url = directUrl(property);
  const provider = url.includes('airbnb') ? 'Airbnb' : url.includes('booking') ? 'Booking' : 'Directo';

  return {
    id: `day-${day.numero}-${String(property.name ?? property.title ?? `hotel-${index}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
    dayNumber: day.numero,
    name: property.name ?? property.title ?? `Alojamiento candidato ${index + 1}`,
    provider,
    status: url ? 'ready' : 'pending',
    url,
    photoUrls: getPhotos(property),
    price: getPrice(property),
    rating: getRating(property),
    location: property.address ?? destinationForDay(day),
    lat: coords.lat,
    lng: coords.lng,
    distanceFromArrivalKm: distanceKm(arrival, coords),
    roomType: 'Doble privada / alojamiento entero',
    privateBathroom: true,
    privateDoubleRoom: true,
    parking: inferParking(property),
    parkingCost: inferParking(property) === 'gratis' ? 0 : undefined,
    board: inferBoard(property),
    features: ['rating +7', 'baño privado a confirmar', `máx. ${mode === 'ampliada' ? flexibleMaxPrice : maxPrice}€`, 'ver fotos reales', 'parking a confirmar'],
    notes: 'Importado vía API. Confirmar condiciones finales, tasas, baño privado, parking y política de cancelación antes de reservar.',
    searchMode: mode,
    searchNote: mode === 'ampliada'
      ? `No había suficientes opciones con el filtro estricto (${maxPrice}€, cerca de la llegada). Se amplió la búsqueda hasta ${flexibleMaxPrice}€ y ${flexibleMaxDistanceFromArrival} km para no dejar esta noche sin alternativas.`
      : `Cumple la búsqueda estricta inicial: máximo ${maxPrice}€, rating +${minRating}, fotos, enlace usable y distancia razonable desde la llegada.`,
  };
}

async function fetchDestination(day, checkout, destination, mode) {
  const priceLimit = mode === 'ampliada' ? flexibleMaxPrice : maxPrice;
  const distanceLimit = mode === 'ampliada' ? flexibleMaxDistanceFromArrival : maxDistanceFromArrival;
  const url = searchUrl(destination, day, day.fecha, checkout, priceLimit);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error día ${day.numero} (${destination}): ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const properties = data.properties ?? data.hotels_results ?? data.results ?? [];

  return properties
    .map((property, index) => toCandidate(property, day, checkout, index, mode))
    .filter((candidate) => candidate.status === 'ready' && candidate.url && candidate.photoUrls.length > 0)
    .filter((candidate) => candidate.price <= priceLimit && candidate.rating >= minRating)
    .filter((candidate) => candidate.distanceFromArrivalKm <= distanceLimit)
    .sort((a, b) => a.price - b.price || b.rating - a.rating)
    .slice(0, maxPerNight);
}

function dedupeKey(candidate) {
  return `${candidate.dayNumber}-${candidate.name.toLowerCase().replace(/\s+/g, ' ').trim()}-${candidate.lat.toFixed(4)}-${candidate.lng.toFixed(4)}`;
}

function validExisting(candidate) {
  return candidate.status === 'ready'
    && candidate.url
    && !candidate.url.includes('serpapi.com')
    && candidate.photoUrls?.length > 0
    && candidate.price <= flexibleMaxPrice
    && candidate.rating >= minRating
    && candidate.privateBathroom === true
    && candidate.privateDoubleRoom === true
    && candidate.distanceFromArrivalKm <= flexibleMaxDistanceFromArrival;
}

function existingForDay(dayNumber) {
  return (existingOutput.candidates ?? [])
    .filter((candidate) => candidate.dayNumber === dayNumber)
    .filter(validExisting)
    .map((candidate) => ({
      ...candidate,
      searchMode: candidate.searchMode ?? (candidate.price <= maxPrice && candidate.distanceFromArrivalKm <= maxDistanceFromArrival ? 'estricta' : 'manual'),
      searchNote: candidate.searchNote ?? (candidate.price <= maxPrice && candidate.distanceFromArrivalKm <= maxDistanceFromArrival
        ? `Candidato conservado que sigue encajando en el filtro estricto: máximo ${maxPrice}€, rating +${minRating}, fotos, enlace usable y distancia razonable desde la llegada.`
        : 'Candidato conservado de una importación anterior o edición manual.'),
    }));
}

async function fetchNight(day, checkout, preserved) {
  const seen = new Set();
  const candidates = [];

  preserved.forEach((candidate) => {
    seen.add(dedupeKey(candidate));
    candidates.push(candidate);
  });

  for (const mode of ['estricta', 'ampliada']) {
    if (candidates.length >= maxPerNight) break;

    for (const destination of destinationOptions(day)) {
      const destinationCandidates = await fetchDestination(day, checkout, destination, mode);
      destinationCandidates.forEach((candidate) => {
        const key = dedupeKey(candidate);
        if (!seen.has(key)) {
          seen.add(key);
          candidates.push(candidate);
        }
      });

      if (candidates.length >= maxPerNight) break;
    }

    if (mode === 'estricta' && candidates.length < maxPerNight) {
      console.log(`  Filtro estricto insuficiente (${candidates.length}/${maxPerNight}). Amplío búsqueda para día ${day.numero}.`);
    }
  }

  return candidates.sort((a, b) => a.price - b.price || b.rating - a.rating).slice(0, maxPerNight);
}

async function main() {
  if (!apiKey) {
    console.log('SERPAPI_API_KEY no está configurada. No se importan alojamientos.');
    console.log('Uso: SERPAPI_API_KEY=tu_clave npm run fetch-accommodations');
    return;
  }

  const candidates = [];

  for (let index = 0; index < trip.dias.length; index += 1) {
    const day = trip.dias[index];
    const checkout = trip.dias[index + 1]?.fecha;
    if (!checkout || (day.overnight ?? day.base).toLowerCase().includes('casa')) continue;

    console.log(`Buscando día ${day.numero}: ${destinationOptions(day).join(' | ')} (${day.fecha} -> ${checkout})`);
    const nightCandidates = await fetchNight(day, checkout, existingForDay(day.numero));
    candidates.push(...nightCandidates);
  }

  const output = {
    tripSlug: trip.slug,
    criteria: {
      maxPrice,
      flexibleMaxPrice,
      minRating,
      maxDistanceFromArrivalKm: maxDistanceFromArrival,
      flexibleMaxDistanceFromArrivalKm: flexibleMaxDistanceFromArrival,
      privateBathroom: true,
      privateDoubleRoom: true,
      preferredParking: 'gratis',
      travellers: 2,
    },
    candidates,
  };

  writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Importados ${candidates.length} candidatos en ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
