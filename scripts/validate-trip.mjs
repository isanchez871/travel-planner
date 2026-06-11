import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const tripPath = join(root, 'src/data/viajes/dolomitas-alpes-2026.json');
const accommodationsPath = join(root, 'src/data/viajes/dolomitas-alpes-2026-alojamientos.json');
const trip = JSON.parse(readFileSync(tripPath, 'utf8'));
const accommodations = JSON.parse(readFileSync(accommodationsPath, 'utf8'));
const errors = [];
const forbidden = ['Andermatt', 'Hospental', 'Interlaken', 'Lucerna'];
const requiredTopLevel = ['slug', 'titulo', 'fechaInicio', 'fechaFin', 'duracionDias', 'dias', 'presupuesto'];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function dateOnly(value) {
  return new Date(`${value}T00:00:00Z`);
}

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value);
}

function routeSegmentFor(day, pointName) {
  const point = day.points?.find((item) => item.name === pointName);
  return encodeURIComponent(point ? `${point.lat},${point.lng}` : pointName);
}

requiredTopLevel.forEach((field) => {
  assert(trip[field] !== undefined, `Falta campo principal: ${field}`);
});

assert(trip.duracionDias === trip.dias.length, `duracionDias (${trip.duracionDias}) no coincide con dias.length (${trip.dias.length})`);
assert(trip.resumenEjecutivo?.nochesSuiza === 0, 'resumenEjecutivo.nochesSuiza debe ser 0');
assert(dateOnly(trip.fechaFin).toISOString().slice(0, 10) === trip.fechaFin, 'fechaFin no tiene formato YYYY-MM-DD válido');

const dayNumbers = new Set();
const dayIds = new Set();

trip.dias.forEach((day, index) => {
  assert(!dayNumbers.has(day.numero), `Día duplicado: ${day.numero}`);
  dayNumbers.add(day.numero);

  if (day.id !== undefined) {
    assert(!dayIds.has(day.id), `ID de día duplicado: ${day.id}`);
    dayIds.add(day.id);
  }

  const expectedDate = dateOnly(trip.fechaInicio);
  expectedDate.setUTCDate(expectedDate.getUTCDate() + index);
  assert(day.fecha === expectedDate.toISOString().slice(0, 10), `Fecha no consecutiva en día ${day.numero}: ${day.fecha}`);
  assert(day.numero === index, `Día en posición ${index} debería tener numero ${index}, tiene ${day.numero}`);
  assert(typeof day.distanciaKm === 'number' && day.distanciaKm > 0, `Día ${day.numero} tiene distanciaKm inválida`);
  assert(typeof day.duracionHoras === 'number' && day.duracionHoras > 0, `Día ${day.numero} tiene duracionHoras inválida`);
  assert(day.origen && day.destino && day.ruta, `Día ${day.numero} debe tener origen, destino y ruta`);
  assert(day.intensidad, `Día ${day.numero} debe tener intensidad`);
  assert(day.comidaAhorro, `Día ${day.numero} debe tener comidaAhorro`);
  assert(day.planBClima, `Día ${day.numero} debe tener planBClima`);
  assert(day.repostaje?.principal && day.repostaje?.alternativa && day.repostaje?.regla, `Día ${day.numero} debe tener repostaje principal, alternativa y regla`);
  assert(Array.isArray(day.mapas) && day.mapas.length > 0, `Día ${day.numero} debe tener al menos un mapa`);
  assert(Array.isArray(day.alojamientos), `Día ${day.numero} debe tener alojamientos[]`);

  if (!String(day.base).toLowerCase().includes('casa') && !String(day.base).toLowerCase().includes('ferry')) {
    assert(day.alojamientos.length > 0, `Día ${day.numero} debe tener alojamiento previsto`);
  }

  const budgetTotal = day.presupuestoDia.alojamiento + day.presupuestoDia.combustible + day.presupuestoDia.peajes + day.presupuestoDia.comida + day.presupuestoDia.actividades + day.presupuestoDia.varios;
  assert(budgetTotal === day.presupuestoDia.total, `Presupuesto del día ${day.numero} no suma: ${budgetTotal} != ${day.presupuestoDia.total}`);

  const serialized = JSON.stringify(day);
  forbidden.forEach((place) => {
    assert(!serialized.includes(place), `Día ${day.numero} contiene base/lugar prohibido: ${place}`);
  });

  assert(day.points?.length > 0, `Día ${day.numero} no tiene points con coordenadas`);
  day.points?.forEach((point) => {
    assert(typeof point.lat === 'number' && typeof point.lng === 'number', `Punto sin coordenadas numéricas en día ${day.numero}: ${point.name}`);
    assert(point.lat >= -90 && point.lat <= 90 && point.lng >= -180 && point.lng <= 180, `Coordenadas fuera de rango en día ${day.numero}: ${point.name}`);
    assert(isHttpUrl(point.googleMapsUrl), `Punto sin googleMapsUrl válida en día ${day.numero}: ${point.name}`);
  });

  day.mapas.forEach((map) => {
    assert(map.bloque, `Mapa sin bloque en día ${day.numero}`);
    assert(map.url?.startsWith('https://www.google.com/maps/dir/'), `Mapa con URL no Google Maps Dir en día ${day.numero}: ${map.bloque}`);
    assert(map.puntos.length > 1, `Mapa con menos de dos puntos en día ${day.numero}: ${map.bloque}`);
    map.puntos.forEach((pointName) => {
      assert(map.url.includes(routeSegmentFor(day, pointName)), `Mapa del día ${day.numero} no contiene punto en URL: ${map.bloque} -> ${pointName}`);
    });
    if (map.gpxUrl) {
      assert(existsSync(join(root, 'public', map.gpxUrl.replace(/^\//, ''))), `GPX no existe en día ${day.numero}: ${map.gpxUrl}`);
    }
  });
});

const categoryTotal = trip.presupuesto.categorias.reduce((sum, category) => sum + category.estimado, 0);
assert(categoryTotal === trip.presupuesto.totalEstimado, `Presupuesto total no suma: ${categoryTotal} != ${trip.presupuesto.totalEstimado}`);

assert(dayNumbers.has(0), 'Debe existir el día 0');
assert(dayNumbers.size === trip.dias.length, 'Hay números de día repetidos');
assert(dateOnly(trip.fechaInicio).getTime() + (trip.dias.length - 1) * 86_400_000 === dateOnly(trip.fechaFin).getTime(), 'fechaFin no coincide con fechaInicio + días');

assert(accommodations.tripSlug === trip.slug, 'El JSON de alojamientos no corresponde al slug del viaje');
assert(Array.isArray(accommodations.candidates), 'El JSON de alojamientos debe tener candidates[]');
assert(accommodations.candidates.length > 0, 'Debe existir al menos un candidato de alojamiento');

const accommodationIds = new Set();
accommodations.candidates.forEach((candidate) => {
  assert(!accommodationIds.has(candidate.id), `Alojamiento duplicado: ${candidate.id}`);
  accommodationIds.add(candidate.id);
  assert(dayNumbers.has(candidate.dayNumber), `Alojamiento con día inexistente: ${candidate.id}`);
  assert(candidate.name, `Alojamiento sin nombre: ${candidate.id}`);
  assert(candidate.provider, `Alojamiento sin provider: ${candidate.id}`);
  assert(candidate.location, `Alojamiento sin location: ${candidate.id}`);
  assert(['ready', 'pending'].includes(candidate.status), `Alojamiento con status inválido: ${candidate.id}`);
  assert(candidate.price <= 150, `Alojamiento supera 150€: ${candidate.id}`);
  assert(candidate.rating >= 7, `Alojamiento con rating menor de 7: ${candidate.id}`);
  assert(candidate.privateBathroom === true, `Alojamiento sin baño privado: ${candidate.id}`);
  assert(candidate.privateDoubleRoom === true, `Alojamiento sin doble privada: ${candidate.id}`);
  assert(typeof candidate.lat === 'number' && typeof candidate.lng === 'number', `Alojamiento sin coordenadas: ${candidate.id}`);

  if (candidate.status === 'ready') {
    assert(candidate.name && !candidate.name.toLowerCase().includes('pendiente'), `Alojamiento ready sin nombre real: ${candidate.id}`);
    assert(isHttpUrl(candidate.url), `Alojamiento ready sin URL exacta: ${candidate.id}`);
    assert(candidate.photoUrls.length > 0 && candidate.photoUrls.every(isHttpUrl), `Alojamiento ready sin fotos reales: ${candidate.id}`);
  }
});

if (errors.length > 0) {
  console.error('Validación de viaje fallida:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validación OK: ${trip.titulo} (${trip.dias.length} días).`);
