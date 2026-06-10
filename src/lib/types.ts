export interface Trip {
  slug: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  duracionDias: number;
  viajeros: number;
  vehiculo: Vehicle;
  estilo: string;
  filosofiaViaje?: string[];
  reglasContinuidad?: string[];
  preferenciasAlojamiento: string[];
  requiereFerry: boolean;
  dias: Day[];
  presupuesto: Budget;
  resumenEjecutivo?: TripSummary;
  comparativaRuta?: RouteComparison;
  myMapsExport?: MyMapsLayer[];
  fuentes?: Source[];
}

export interface TripSummary {
  nochesSuiza: number;
  diasDolomitas: number;
  diasEnlace: number;
  diasTrekking: number;
  presupuestoEstimado: number;
  resumen: string;
}

export interface RouteComparison {
  anterior: { titulo: string; ruta: string; problemas: string[] };
  nueva: { titulo: string; ruta: string; ventajas: string[] };
}

export interface MyMapsLayer {
  nombre: string;
  puntos: string[];
}

export interface Vehicle {
  tipo: string;
  modelo: string;
  nombre?: string;
}

export interface Day {
  numero: number;
  fecha: string;
  base: string;
  ruta: string;
  origen: string;
  destino: string;
  distanciaKm: number;
  duracionHoras: number;
  intensidad: string;
  puntosGoogle: number;
  estadoGoogle: string;
  rutaGoogleMaps: string;
  mapas: RouteMap[];
  etapas: Stage[];
  alojamientos: Accommodation[];
  actividades: Activity[];
  presupuestoDia: BudgetDay;
  comidaAhorro: string;
  repostaje: FuelPlan;
  notas: string;
  planBClima: string;
  id?: number;
  date?: string;
  title?: string;
  start?: string;
  end?: string;
  overnight?: string;
  country?: string;
  block?: string;
  color?: string;
  km?: number;
  drivingTime?: string;
  type?: string;
  summary?: string;
  highlights?: string[];
  warnings?: string[];
  accommodationAdvice?: string;
  estimatedCost?: number;
  googleMapsUrl?: string;
  points?: RoutePoint[];
}

export interface RoutePoint {
  name: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  googleMapsUrl: string;
}

export interface RouteMap {
  bloque: string;
  puntos: string[];
  url: string;
  gpxUrl?: string;
  estado: string;
}

export interface Stage {
  nombre: string;
  tipo: 'ciudad' | 'punto_interes' | 'parada' | 'comida' | 'experiencia';
  notas?: string;
}

export interface Accommodation {
  nombre: string;
  tipo: 'apartamento' | 'hotel' | 'hostal' | 'camping';
  ubicacion: string;
  precioEstimado: number;
  precioReal?: number;
  enlaces: string[];
  notas: string;
}

export interface AccommodationCandidate {
  id: string;
  dayNumber: number;
  name: string;
  provider: 'Booking' | 'Airbnb' | 'Directo';
  status: 'ready' | 'pending';
  url: string;
  photoUrls: string[];
  price: number;
  rating: number;
  location: string;
  lat: number;
  lng: number;
  distanceFromArrivalKm: number;
  roomType: string;
  privateBathroom: boolean;
  privateDoubleRoom: boolean;
  parking: 'gratis' | 'pago' | 'no' | 'confirmar';
  parkingCost?: number;
  board: 'solo alojamiento' | 'alojamiento y desayuno' | 'media pensión' | 'pensión completa';
  features: string[];
  notes: string;
  searchMode?: 'estricta' | 'ampliada' | 'manual';
  searchNote?: string;
}

export interface Activity {
  nombre: string;
  tipo: 'visita' | 'ruta' | 'experiencia' | 'comida';
  hora?: string;
  costeEstimado: number;
  costeReal?: number;
  notas?: string;
  completada?: boolean;
}

export interface Budget {
  categorias: BudgetCategory[];
  totalEstimado: number;
  totalReal?: number;
  moneda: string;
}

export interface BudgetCategory {
  nombre: string;
  estimado: number;
  real?: number;
}

export interface BudgetDay {
  alojamiento: number;
  combustible: number;
  peajes: number;
  comida: number;
  actividades: number;
  varios: number;
  total: number;
}

export interface FuelPlan {
  principal: string;
  alternativa: string;
  regla: string;
}

export interface Source {
  nombre: string;
  url: string;
}
