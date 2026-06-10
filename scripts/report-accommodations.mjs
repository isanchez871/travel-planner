import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const trip = JSON.parse(readFileSync(join(root, 'src/data/viajes/dolomitas-alpes-2026.json'), 'utf8'));
const accommodations = JSON.parse(readFileSync(join(root, 'src/data/viajes/dolomitas-alpes-2026-alojamientos.json'), 'utf8'));

const candidates = accommodations.candidates ?? [];
const rows = [];

for (let index = 0; index < trip.dias.length - 1; index += 1) {
  const day = trip.dias[index];
  if ((day.overnight ?? day.base).toLowerCase().includes('casa')) continue;

  const dayCandidates = candidates.filter((candidate) => candidate.dayNumber === day.numero);
  const ready = dayCandidates.filter((candidate) => candidate.status === 'ready');
  const booking = ready.filter((candidate) => candidate.provider === 'Booking').length;
  const airbnb = ready.filter((candidate) => candidate.provider === 'Airbnb').length;
  const direct = ready.filter((candidate) => candidate.provider === 'Directo').length;
  const prices = ready.map((candidate) => candidate.price).sort((a, b) => a - b);

  rows.push({
    day: day.numero,
    night: day.overnight ?? day.base,
    ready: ready.length,
    missing: Math.max(0, 5 - ready.length),
    booking,
    airbnb,
    direct,
    minPrice: prices[0] ?? '-',
    maxPrice: prices.at(-1) ?? '-',
  });
}

console.log('Cobertura de alojamientos concretos:');
rows.forEach((row) => {
  const status = row.ready >= 5 ? 'OK' : row.ready > 0 ? 'PARCIAL' : 'FALTA';
  console.log(`Día ${row.day}: ${status} · ${row.ready}/5 listos · faltan ${row.missing} · ${row.night} · ${row.minPrice}-${row.maxPrice}€ · Booking ${row.booking}, Airbnb ${row.airbnb}, Directo ${row.direct}`);
});

const complete = rows.filter((row) => row.ready >= 5).length;
const partial = rows.filter((row) => row.ready > 0 && row.ready < 5).length;
const missing = rows.filter((row) => row.ready === 0).length;

console.log(`\nResumen: ${complete} noches completas, ${partial} parciales, ${missing} sin candidatos concretos.`);
