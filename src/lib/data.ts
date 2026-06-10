import { Trip } from './types';
import dolomitasData from '@/data/viajes/dolomitas-alpes-2026.json';

const tripsData: Trip[] = [dolomitasData as Trip];

export function getAllTrips(): Trip[] {
  return tripsData;
}

export function getTripBySlug(slug: string): Trip | undefined {
  return tripsData.find(trip => trip.slug === slug);
}

export function getTripDays(trip: Trip) {
  return trip.dias;
}

export function getTotalDistance(trip: Trip): number {
  return trip.dias.reduce((total, day) => total + day.distanciaKm, 0);
}

export function getTotalDuration(trip: Trip): number {
  return trip.dias.reduce((total, day) => total + day.duracionHoras, 0);
}

export function calculateTotalEstimated(trip: Trip): number {
  return trip.dias.reduce((total, day) => total + day.presupuestoDia.total, 0);
}

export function calculateTotalReal(trip: Trip): number {
  return trip.dias.reduce((total, day) => {
    const diaReal = day.presupuestoDia.alojamiento +
      (day.presupuestoDia.combustible) +
      day.presupuestoDia.peajes +
      day.presupuestoDia.comida +
      day.presupuestoDia.actividades +
      day.presupuestoDia.varios;
    return total + diaReal;
  }, 0);
}