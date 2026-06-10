'use client';

import { useState } from 'react';
import { Day } from '@/lib/types';
import { displayDayLabel, displayDayReferences } from '@/lib/displayDay';
import { getBaseWithCountry, getCountriesLabel, getDayCountries } from '@/lib/routeMeta';

interface PlanDetalladoTabProps {
  days: Day[];
}

type DayGuide = {
  title: string;
  focus: string;
  foodStop: string;
  dinner: string;
  practical: string[];
};

type FuelStop = {
  time: string;
  name: string;
  query: string;
  use: string;
  notes: string;
};

type FoodPlan = {
  time: string;
  name: string;
  query: string;
  type: 'bocata' | 'comida' | 'cena' | 'cafe' | 'supermercado';
  price: string;
  notes: string;
};

type DetailedLogistics = {
  fuel: FuelStop[];
  food: FoodPlan[];
  reservations: { title: string; url: string; notes: string }[];
  avoid: string[];
  costs: string[];
  checklist: string[];
};

type Sight = {
  title: string;
  why: string;
  history: string;
  tip: string;
  link: string;
};

function mapsSearch(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const detailedLogistics: Record<number, DetailedLogistics> = {
  1: {
    fuel: [
      { time: '10:30', name: 'Repsol Miralbueno Zaragoza', query: 'Repsol Miralbueno Zaragoza Spain', use: 'Repostaje principal', notes: 'Parada cómoda antes de seguir a Lleida; revisar precio frente a estaciones cercanas.' },
      { time: '16:00', name: 'bonÀrea Lleida', query: 'bonArea Lleida gasolinera', use: 'Alternativa / llenar para mañana', notes: 'Suele ser buena opción para dejar depósito preparado antes de cruzar a Francia.' },
    ],
    food: [
      { time: '13:30', name: 'Bocata comprado en Zaragoza', query: 'panaderia bocadillos Zaragoza cerca A2', type: 'bocata', price: '6-10 €/persona', notes: 'Opción base para no perder 1 h en mesa. Buscar sitio con valoración Google >= 4,0.' },
      { time: '20:30', name: 'La Huerta Lleida', query: 'La Huerta Lleida restaurant', type: 'cena', price: '18-28 €/persona', notes: 'Cena fuera si se llega bien. Confirmar rating >= 4,0 y horario antes de ir.' },
    ],
    reservations: [{ title: 'Alojamiento Lleida', url: mapsSearch('hoteles apartamentos parking Lleida'), notes: 'Reservar parking privado; primera noche conviene cero complicaciones.' }],
    avoid: ['Salir tarde de Madrid', 'Comida larga en Zaragoza', 'Llegar a Lleida con depósito bajo'],
    costs: ['Peajes: 20-30 €', 'Gasolina: 45-55 €', 'Cena fuera opcional: 35-55 € dos personas'],
    checklist: ['Agua fría', 'Tapones', 'Cargadores', 'Documentación moto', 'Bocatas desde casa si se quiere ahorrar'],
  },
  2: {
    fuel: [
      { time: '09:30', name: 'bonÀrea La Jonquera', query: 'bonArea La Jonquera gasolinera', use: 'Llenar antes de Francia', notes: 'Mejor punto para minimizar repostaje caro francés.' },
      { time: '14:30', name: 'TotalEnergies Narbonne Croix Sud', query: 'TotalEnergies Narbonne Croix Sud', use: 'Solo si hace falta', notes: 'Evitar áreas de autopista si el precio está alto.' },
    ],
    food: [
      { time: '12:30', name: 'Bocata en Perpignan/Narbonne', query: 'boulangerie Perpignan Narbonne', type: 'bocata', price: '7-12 €/persona', notes: 'Parada corta de panadería. Elegir ubicación cómoda y reseñas recientes favorables.' },
      { time: '20:00', name: 'Fou de Fafa Avignon', query: 'Fou de Fafa Avignon', type: 'cena', price: '25-40 €/persona', notes: 'Cena recomendable si apetece salir. Reservar o comprobar disponibilidad y rating >= 4,0.' },
    ],
    reservations: [{ title: 'Cena Avignon', url: mapsSearch('Fou de Fafa Avignon'), notes: 'Reservar si se quiere cenar fuera; si no, supermercado y apartamento.' }],
    avoid: ['Atravesar Montpellier en hora punta', 'Repostar dentro de autopista francesa por comodidad', 'Llegar a Avignon sin compra de cena'],
    costs: ['Peajes Francia: 35-45 €', 'Gasolina: 50-60 €', 'Cena fuera: 50-80 € dos personas'],
    checklist: ['Revisar presión neumáticos', 'Comprar agua', 'Tener offline los mapas del día 3'],
  },
  3: {
    fuel: [
      { time: '10:30', name: 'E.Leclerc Sisteron Station Service', query: 'E.Leclerc Sisteron station service', use: 'Repostaje principal', notes: 'Buen punto antes de subir hacia Serre-Ponçon y Briançon.' },
      { time: '15:30', name: 'Intermarché Embrun carburant', query: 'Intermarche Embrun station service', use: 'Alternativa', notes: 'Útil si el consumo sube por viento o montaña.' },
    ],
    food: [
      { time: '12:30', name: 'Picnic Lac de Serre-Ponçon', query: 'Lac de Serre-Poncon picnic viewpoint', type: 'bocata', price: '6-10 €/persona', notes: 'Compra antes en Sisteron/Embrun. Mejor que restaurante para disfrutar del lago.' },
      { time: '20:00', name: 'Le Gavroche Briançon', query: 'Le Gavroche Briancon restaurant', type: 'cena', price: '25-40 €/persona', notes: 'Opción de cena si rating >= 4,0 y hay mesa. Si no, pasta en apartamento.' },
    ],
    reservations: [{ title: 'Alojamiento Briançon', url: mapsSearch('Briancon apartment parking'), notes: 'Parking importante. Revisar acceso con maletas y check-in tardío.' }],
    avoid: ['Meter Galibier/Izoard extra este día', 'Subir sin abrigo accesible', 'Parar demasiado tarde a comer'],
    costs: ['Gasolina: 30-40 €', 'Peajes bajos: 5-10 €', 'Cena fuera opcional: 50-80 € dos personas'],
    checklist: ['Capa térmica a mano', 'Compra de desayuno', 'Revisar previsión alpina día 4'],
  },
  4: {
    fuel: [
      { time: '10:45', name: 'Eni Station Susa', query: 'Eni Station Susa Italy', use: 'Llenar antes de zona cara', notes: 'Punto lógico antes de Mont Cenis y Suiza.' },
      { time: '17:30', name: 'Repostaje al llegar a Briançon', query: 'Briancon petrol station', use: 'Preparar etapa alpina', notes: 'Llegar con depósito cómodo para el día siguiente.' },
    ],
    food: [
      { time: '13:00', name: 'Bocata en Lago del Moncenisio', query: 'Lago del Moncenisio viewpoint', type: 'bocata', price: '6-10 €/persona', notes: 'Llevarlo comprado desde Susa; comer con vistas sin depender de horarios.' },
      { time: '20:00', name: 'Cena sencilla en Briançon', query: 'Briancon restaurant', type: 'cena', price: '20-35 €/persona', notes: 'Confirmar valoración >= 4,0 y horario antes de ir.' },
    ],
    reservations: [{ title: 'Alojamiento Briançon', url: mapsSearch('Briancon apartment parking'), notes: 'Reservar con parking y acceso cómodo con equipaje.' }],
    avoid: ['Forzar puertos si hay tormenta', 'Llegar tarde sin compra hecha', 'Salir sin revisar previsión alpina'],
    costs: ['Gasolina: 40-50 €', 'Comida picnic: 12-20 € dos personas', 'Cena Suiza: 50-90 € dos personas'],
    checklist: ['Chubasquero accesible', 'Tarjeta sin comisiones', 'Descargar GPX día 5'],
  },
  5: {
    fuel: [
      { time: '08:30', name: 'Repostaje salida Briançon', query: 'Briancon petrol station', use: 'Llenar antes de puertos', notes: 'Mejor salir hacia montaña con depósito alto.' },
      { time: '17:30', name: 'Repostaje Val Gardena', query: 'Ortisei petrol station', use: 'Preparar días Dolomitas', notes: 'Dejar depósito cómodo para jornadas locales.' },
    ],
    food: [
      { time: '12:45', name: 'Picnic en mirador alpino', query: 'Alps viewpoint picnic', type: 'bocata', price: '8-14 €/persona', notes: 'Comprar antes de subir para no depender de refugios.' },
      { time: '20:00', name: 'Cena en Val Gardena', query: 'Ortisei restaurant', type: 'cena', price: '25-45 €/persona', notes: 'Reservar si se quiere cenar fuera en zona turística.' },
    ],
    reservations: [{ title: 'Estado pasos alpinos', url: mapsSearch('Dolomites mountain pass road status'), notes: 'Comprobar la mañana del día; si hay cierre, usar ruta baja.' }],
    avoid: ['Apurar gasolina en pasos', 'Añadir extras si ya vais cansados', 'Parar en cada mirador más de 10 min'],
    costs: ['Gasolina Suiza: 25-35 €', 'Cena fuera: 50-90 € dos personas', 'Parking/extra glaciar: 0-10 €'],
    checklist: ['Guantes secos', 'Capa térmica', 'Agua', 'Batería móvil'],
  },
  6: {
    fuel: [
      { time: '10:30', name: 'AVIA Chur Kasernenstrasse', query: 'AVIA Chur Kasernenstrasse petrol station', use: 'Repostaje principal', notes: 'Antes de atravesar Engadina y Ofenpass.' },
      { time: '17:30', name: 'Eni Bolzano Via Innsbruck', query: 'Eni Bolzano Via Innsbruck', use: 'Llenar al entrar en Dolomitas', notes: 'Deja la base preparada para días cortos de montaña.' },
    ],
    food: [
      { time: '12:30', name: 'Bocata Coop / Migros Zernez', query: 'Coop Zernez Switzerland', type: 'bocata', price: '10-16 €/persona', notes: 'Compra rápida antes de Ofenpass/Stelvio.' },
      { time: '20:15', name: 'Mauriz Keller Ortisei', query: 'Mauriz Keller Ortisei', type: 'cena', price: '25-40 €/persona', notes: 'Primera cena en Dolomitas si se llega con ganas. Confirmar rating >= 4,0/reserva.' },
    ],
    reservations: [{ title: 'Estado Stelvio', url: mapsSearch('Stelvio Pass road status'), notes: 'Mirar cierre, obras y meteorología. Si está mal, ruta directa por Bolzano.' }],
    avoid: ['Obsesionarse con Stelvio si llueve', 'Llegar tarde a Val Gardena sin supermercado', 'No llevar capa térmica en Stelvio'],
    costs: ['Gasolina: 40-50 €', 'Cena Ortisei: 50-80 € dos personas', 'Parking/alojamiento Dolomitas: revisar incluido'],
    checklist: ['Comprar desayuno 4 días', 'Preparar mochila Seceda', 'Revisar horarios teleférico'],
  },
  7: {
    fuel: [
      { time: '18:00', name: 'Q8 Ortisei', query: 'Q8 Ortisei gas station', use: 'Solo si baja de medio depósito', notes: 'Día local; mejor repostar al final si mañana Val di Funes.' },
      { time: '18:15', name: 'Esso Santa Cristina Valgardena', query: 'Esso Santa Cristina Valgardena', use: 'Alternativa', notes: 'Opción cercana si Q8 está lleno o caro.' },
    ],
    food: [
      { time: '12:30', name: 'Baita Sofie Seceda', query: 'Baita Sofie Seceda', type: 'comida', price: '25-40 €/persona', notes: 'Comer arriba solo si rating >= 4,0 y el día está despejado; si no, picnic.' },
      { time: '20:00', name: 'Pizzeria Cascade Ortisei', query: 'Pizzeria Cascade Ortisei', type: 'cena', price: '18-30 €/persona', notes: 'Cena razonable en Ortisei. Confirmar valoración >= 4,0 y reservar si es fin de semana.' },
    ],
    reservations: [{ title: 'Teleférico Seceda', url: 'https://www.seceda.it/', notes: 'Comprobar horarios/precios 2026. Comprar online si hay ahorro o colas.' }],
    avoid: ['Subir a Seceda con nubes cerradas', 'Empezar tarde el trekking', 'No llevar abrigo por ser día corto'],
    costs: ['Teleférico: 40-50 €/persona aprox.', 'Comida refugio: 50-80 € dos personas', 'Picnic alternativo: 15-25 € dos personas'],
    checklist: ['Botas/zapatillas trekking', 'Cortavientos', 'Crema solar', 'Agua 1,5 L/persona', 'Batería/cámara'],
  },
  8: {
    fuel: [
      { time: '08:30', name: 'Q8 Ortisei', query: 'Q8 Ortisei gas station', use: 'Salir con margen', notes: 'Llenar si no se hizo el día anterior.' },
      { time: '16:30', name: 'IP Chiusa Klausen', query: 'IP Chiusa Klausen gas station', use: 'Alternativa al volver', notes: 'Útil si bajáis por Chiusa después de Val di Funes.' },
    ],
    food: [
      { time: '12:45', name: 'Geisleralm', query: 'Geisleralm Val di Funes', type: 'comida', price: '20-35 €/persona', notes: 'Refugio con vistas. Ir solo si rating >= 4,0 y hay tiempo; si no, picnic.' },
      { time: '20:00', name: 'Cena en apartamento', query: 'supermarket Ortisei', type: 'supermercado', price: '8-15 €/persona', notes: 'Día ideal para ahorrar, lavar ropa y dormir pronto.' },
    ],
    reservations: [{ title: 'Parking Zannes', url: mapsSearch('Parcheggio Zannes Val di Funes'), notes: 'Llegar temprano. Revisar si hay pago/reserva en temporada.' }],
    avoid: ['Llegar tarde a Zannes', 'Hacer el trail con lluvia fuerte', 'No llevar efectivo/tarjeta para parking'],
    costs: ['Parking: 8-12 € aprox.', 'Comida refugio: 40-70 € dos personas', 'Picnic: 15-25 € dos personas'],
    checklist: ['Mochila ligera', 'Chubasquero', 'Agua', 'Picnic', 'Calcetines secos'],
  },
  9: {
    fuel: [
      { time: '09:00', name: 'Q8 Ortisei', query: 'Q8 Ortisei gas station', use: 'Antes de puertos', notes: 'Día de curvas; salir sin depender de estaciones turísticas.' },
      { time: '13:30', name: 'IP Canazei', query: 'IP Canazei gas station', use: 'Alternativa', notes: 'Buen punto si se alarga Sellaronda.' },
    ],
    food: [
      { time: '12:30', name: 'Hennenstall Carezza', query: 'Hennenstall Carezza restaurant', type: 'comida', price: '18-30 €/persona', notes: 'Opción cerca de Carezza si rating >= 4,0; si está lleno, bocata.' },
      { time: '20:00', name: 'Tubladel Ortisei', query: 'Tubladel Ortisei restaurant', type: 'cena', price: '30-50 €/persona', notes: 'Cena más especial opcional. Reservar y confirmar valoración >= 4,0.' },
    ],
    reservations: [{ title: 'Cena Ortisei opcional', url: mapsSearch('Tubladel Ortisei restaurant'), notes: 'Reservar solo si queréis una cena buena; si no, pizzería/apartamento.' }],
    avoid: ['Intentar Sellaronda completa si hay niebla', 'Comer tarde después de Carezza', 'Parar en todos los puertos sin controlar hora'],
    costs: ['Gasolina: 15-25 €', 'Parking Carezza: 2-5 €', 'Cena especial: 60-100 € dos personas'],
    checklist: ['Gafas sol', 'Capa lluvia', 'Dinero parking', 'Cámara lista en Carezza'],
  },
  10: {
    fuel: [
      { time: '11:30', name: 'Eni Brunico', query: 'Eni Brunico gas station', use: 'Repostaje principal', notes: 'Punto cómodo antes de Braies/Dobbiaco.' },
      { time: '17:00', name: 'Q8 Dobbiaco', query: 'Q8 Dobbiaco gas station', use: 'Preparar Tre Cime/Sorapis', notes: 'Dejar depósito cómodo para los dos días de trekking.' },
    ],
    food: [
      { time: '13:00', name: 'Picnic Lago di Braies', query: 'Lago di Braies picnic area', type: 'bocata', price: '8-14 €/persona', notes: 'Mejor que depender de restaurantes saturados. Comprar en Brunico.' },
      { time: '20:00', name: 'Pizzeria Hans Dobbiaco', query: 'Pizzeria Hans Dobbiaco', type: 'cena', price: '18-30 €/persona', notes: 'Opción práctica si dormís en Dobbiaco. Confirmar rating >= 4,0.' },
    ],
    reservations: [{ title: 'Parking Lago di Braies', url: 'https://www.prags.bz/en', notes: 'Comprobar restricciones/reserva 2026. En temporada puede requerir reserva previa.' }],
    avoid: ['Llegar a Braies a media mañana sin reserva', 'Comer en primera opción turística sin mirar precio', 'Dormir lejos de Tre Cime/Sorapis'],
    costs: ['Parking Braies: 10-20 € aprox.', 'Gasolina: 20-25 €', 'Cena pizzería: 35-60 € dos personas'],
    checklist: ['Reserva/parking Braies', 'Mochila Tre Cime lista', 'Comprar picnic día 11'],
  },
  11: {
    fuel: [
      { time: '07:15', name: 'Q8 Dobbiaco', query: 'Q8 Dobbiaco gas station', use: 'Solo si no está lleno', notes: 'No perder tiempo si ya se repostó el día anterior.' },
      { time: '18:00', name: 'IP Cortina d Ampezzo', query: 'IP Cortina d Ampezzo gas station', use: 'Alternativa al volver', notes: 'Útil si base final es Cortina.' },
    ],
    food: [
      { time: '12:30', name: 'Rifugio Locatelli', query: 'Rifugio Locatelli Tre Cime', type: 'comida', price: '20-35 €/persona', notes: 'Solo si rating >= 4,0, hay mesa y no rompe el ritmo. Llevar picnic igualmente.' },
      { time: '20:00', name: 'Pizzeria Vienna Cortina', query: 'Pizzeria Vienna Cortina d Ampezzo', type: 'cena', price: '20-35 €/persona', notes: 'Cena sencilla post-trekking. Confirmar valoración >= 4,0.' },
    ],
    reservations: [{ title: 'Acceso Rifugio Auronzo', url: 'https://auronzomisurina.it/tre-cime-di-lavaredo/', notes: 'Comprobar peaje, cupos y parking. Salir temprano aunque haya reserva.' }],
    avoid: ['Llegar tarde al parking Auronzo', 'Hacer la circular con tormenta', 'No llevar agua porque hay refugios'],
    costs: ['Peaje/parking Auronzo: 30-35 € aprox.', 'Comida refugio: 40-70 € dos personas', 'Cena: 40-70 € dos personas'],
    checklist: ['Agua 2 L/persona', 'Impermeable', 'Capa abrigo', 'Picnic', 'Bastones opcionales'],
  },
  12: {
    fuel: [
      { time: '08:00', name: 'IP Cortina d Ampezzo', query: 'IP Cortina d Ampezzo gas station', use: 'Antes de Passo Tre Croci', notes: 'Aunque el día sea corto, evita volver justo después del trekking.' },
      { time: '18:30', name: 'Q8 Dobbiaco', query: 'Q8 Dobbiaco gas station', use: 'Alternativa si base Dobbiaco', notes: 'Solo si mañana salís hacia Garda por puertos.' },
    ],
    food: [
      { time: '12:30', name: 'Picnic Lago di Sorapis', query: 'Lago di Sorapis', type: 'bocata', price: '8-14 €/persona', notes: 'Obligatorio llevar comida/agua. No depender del refugio.' },
      { time: '20:00', name: 'Al Passetto Cortina', query: 'Al Passetto Cortina d Ampezzo', type: 'cena', price: '25-45 €/persona', notes: 'Cena fuera solo si quedan piernas. Confirmar rating >= 4,0 y reservar.' },
    ],
    reservations: [{ title: 'Condiciones Lago di Sorapis', url: mapsSearch('Passo Tre Croci Lago di Sorapis trail'), notes: 'No requiere reserva, pero comprobar terreno seco y tormentas. Evitar con vértigo fuerte.' }],
    avoid: ['Hacer Sorapis con lluvia', 'Empezar después de las 09:30', 'Ir sin calzado decente o con poca agua'],
    costs: ['Parking/transporte: 0-10 €', 'Picnic: 15-25 € dos personas', 'Cena Cortina: 50-90 € dos personas'],
    checklist: ['Botas', 'Agua 2 L/persona', 'Comida', 'Chubasquero', 'No hacerlo si el terreno está mojado'],
  },
  13: {
    fuel: [
      { time: '08:30', name: 'IP Cortina d Ampezzo', query: 'IP Cortina d Ampezzo gas station', use: 'Salida hacia Giau/Fedaia', notes: 'Salir con depósito lleno para no depender de estaciones entre puertos.' },
      { time: '16:30', name: 'IP Trento Via Brennero', query: 'IP Trento Via Brennero gas station', use: 'Antes de Riva', notes: 'Buen punto antes de entrar a Garda.' },
    ],
    food: [
      { time: '13:00', name: 'El Pael Canazei', query: 'El Pael Canazei', type: 'comida', price: '20-35 €/persona', notes: 'Comida si rating >= 4,0 y vais bien de hora; si no, bocata en Fedaia.' },
      { time: '20:30', name: 'Panem Riva del Garda', query: 'Panem Riva del Garda', type: 'cena', price: '18-30 €/persona', notes: 'Cena informal al llegar a Garda. Confirmar valoración >= 4,0.' },
    ],
    reservations: [{ title: 'Alojamiento Riva del Garda', url: mapsSearch('Riva del Garda apartment parking'), notes: 'Parking importante y check-in claro para llegar tras ruta de puertos.' }],
    avoid: ['Meter otro trekking este día', 'Bajar a Garda de noche si llueve', 'No revisar frenos/neumáticos tras días de montaña'],
    costs: ['Gasolina: 25-35 €', 'Comida: 40-70 € dos personas', 'Cena: 35-60 € dos personas'],
    checklist: ['Revisar equipaje', 'Capa lluvia', 'Fotos Giau/Fedaia', 'Comprar desayuno regreso'],
  },
  14: {
    fuel: [
      { time: '10:30', name: 'Eni Brescia', query: 'Eni Brescia gas station near A4', use: 'Repostaje autopista/control', notes: 'Buscar opción fuera de área cara si no desvía demasiado.' },
      { time: '18:30', name: 'TotalEnergies Grenoble Europole', query: 'TotalEnergies Grenoble Europole', use: 'Llegada / preparar día 15', notes: 'Dejar depósito listo para el regreso a España.' },
    ],
    food: [
      { time: '13:00', name: 'Eataly Torino Lingotto', query: 'Eataly Torino Lingotto', type: 'comida', price: '18-30 €/persona', notes: 'Parada cómoda si encaja por ruta y rating >= 4,0; si no, bocata rápido.' },
      { time: '20:30', name: 'Le Gratin Dauphinois Grenoble', query: 'Le Gratin Dauphinois Grenoble', type: 'cena', price: '25-40 €/persona', notes: 'Cena local opcional. Confirmar valoración >= 4,0/reserva.' },
    ],
    reservations: [{ title: 'Túnel Fréjus / alternativa', url: mapsSearch('Frejus Road Tunnel traffic'), notes: 'Revisar tráfico y precio. Si se complica, valorar parar antes.' }],
    avoid: ['Atravesar Milán en hora punta si hay alternativa', 'Comida larga si hay tráfico', 'Improvisar túnel sin mirar coste'],
    costs: ['Peajes/túnel: 50-65 €', 'Gasolina: 55-65 €', 'Cena Grenoble: 50-80 € dos personas'],
    checklist: ['Agua', 'Snacks', 'Música/intercom cargado', 'Ruta alternativa guardada'],
  },
  15: {
    fuel: [
      { time: '09:30', name: 'TotalEnergies Valence Sud', query: 'TotalEnergies Valence Sud', use: 'Primer repostaje', notes: 'Evitar apurar antes del tramo Montpellier/Narbonne.' },
      { time: '16:30', name: 'bonÀrea La Jonquera', query: 'bonArea La Jonquera gasolinera', use: 'Al entrar en España', notes: 'Buen punto para llenar más barato antes de Lleida.' },
    ],
    food: [
      { time: '12:30', name: 'Bocata Montpellier/Narbonne', query: 'boulangerie Narbonne Montpellier', type: 'bocata', price: '7-12 €/persona', notes: 'Día funcional: panadería o bocata rápido, sin restaurante largo.' },
      { time: '20:30', name: 'La Huerta Lleida', query: 'La Huerta Lleida restaurant', type: 'cena', price: '18-28 €/persona', notes: 'Cena de final de etapa si rating >= 4,0; alternativa supermercado.' },
    ],
    reservations: [{ title: 'Alojamiento Lleida final', url: mapsSearch('Lleida apartment parking'), notes: 'Parking y check-in flexible; la prioridad es descansar.' }],
    avoid: ['Paradas turísticas', 'Llegar a frontera con depósito bajo', 'Cenar tarde y dormir poco'],
    costs: ['Peajes: 40-50 €', 'Gasolina: 60-70 €', 'Cena: 35-55 € dos personas'],
    checklist: ['Documentos a mano', 'Revisar neumáticos', 'Agua', 'Café si hay fatiga'],
  },
  16: {
    fuel: [
      { time: '09:00', name: 'bonÀrea Lleida', query: 'bonArea Lleida gasolinera', use: 'Salida con depósito lleno', notes: 'Último repostaje grande antes de Madrid.' },
      { time: '12:30', name: 'Repsol Zaragoza Plaza', query: 'Repsol Zaragoza Plaza gas station', use: 'Alternativa café/combustible', notes: 'Parada si hay viento, calor o fatiga.' },
    ],
    food: [
      { time: '12:30', name: 'Bar El Champi Zaragoza', query: 'Bar El Champi Zaragoza', type: 'comida', price: '10-18 €/persona', notes: 'Opción rápida si se entra a Zaragoza y rating >= 4,0; si no, bocata de ruta.' },
      { time: '17:00', name: 'Llegada a casa', query: 'Madrid Spain', type: 'cena', price: '0-20 €/persona', notes: 'Final cómodo. No hace falta cenar fuera salvo celebración.' },
    ],
    reservations: [],
    avoid: ['Relajarse demasiado con la fatiga final', 'Entrar a Madrid en hora punta si se puede evitar', 'No revisar equipaje al salir de Lleida'],
    costs: ['Gasolina: 45-55 €', 'Peajes: 20-30 €', 'Comida: 20-35 € dos personas'],
    checklist: ['Última revisión maletas', 'Cargar móvil', 'Avisar hora llegada', 'No apurar depósito'],
  },
};

const guideOverrides: Record<number, Partial<DayGuide>> = {
  6: {
    title: 'Llegada a Dolomitas por Stelvio',
    focus: 'Día de enlace alpino largo pero controlado. Prioridad: llegar a Val Gardena con energía para los trekkings.',
    practical: ['Si Stelvio está mal, saltarlo sin drama', 'Comprar comida en Bolzano', 'Dejar equipaje ordenado para cuatro noches de base'],
  },
  7: {
    title: 'Seceda sin prisa',
    focus: 'Primer día real de montaña. Teleférico, cresta panorámica y tarde suave en Val Gardena.',
    foodStop: 'Picnic de súper o café/refugio arriba si el tiempo acompaña.',
    practical: ['Subir temprano para evitar nubes', 'No forzar kilómetros a pie el primer día', 'Mover a otro día si Seceda está tapado'],
  },
  8: {
    title: 'Val di Funes y Adolf Munkel Trail',
    focus: 'Trekking principal bajo las Odle con fotos en Santa Maddalena. Día de caminar, no de moto.',
    foodStop: 'Picnic desde Ortisei o parada en Geisleralm/Rifugio Odle.',
    practical: ['Aparcar temprano en Zannes', 'Llevar calzado cómodo', 'Guardar tarde para descanso y lavadora'],
  },
  9: {
    title: 'Carezza y Sellaronda suave',
    focus: 'Lago di Carezza obligatorio y puertos dolomíticos sin convertirlo en una paliza.',
    foodStop: 'Picnic en Carezza, Canazei o mirador de paso.',
    practical: ['Hacer solo Carezza si el tiempo empeora', 'No añadir desvíos largos', 'Volver pronto a Val Gardena'],
  },
  10: {
    title: 'Braies y cambio de base oriental',
    focus: 'Cambio lógico hacia Cortina/Dobbiaco con paseo completo alrededor del Lago di Braies.',
    foodStop: 'Picnic comprado en Val Gardena o Brunico. Evitar comer en Braies si está lleno.',
    practical: ['Revisar parking/reserva de Braies', 'Dormir cerca de Tre Cime/Sorapis', 'No alargar con puertos innecesarios'],
  },
  11: {
    title: 'Tre Cime di Lavaredo',
    focus: 'Circular clásica desde Rifugio Auronzo hasta Locatelli. Día completo para una sola experiencia fuerte.',
    foodStop: 'Picnic desde el apartamento. Refugio Locatelli solo como extra si hay sitio.',
    practical: ['Salir muy temprano', 'Revisar peaje/parking Auronzo', 'No añadir ruta larga en moto después'],
  },
  12: {
    title: 'Lago di Sorapis',
    focus: 'Trekking más exigente del viaje. Solo con terreno seco, buena previsión y sin tormentas.',
    foodStop: 'Picnic y agua suficiente. No depender de Rifugio Vandelli para comer.',
    practical: ['Evitar si llueve o hay vértigo fuerte', 'Salir temprano desde Passo Tre Croci', 'Plan B: Misurina y Cortina'],
  },
  13: {
    title: 'Despedida de Dolomitas hacia Garda',
    focus: 'Última ruta panorámica por Giau/Fedaia antes de bajar a Riva del Garda como colchón de descanso.',
    practical: ['Si hay mal tiempo, bajar por valle', 'No sumar Austria ni Grossglockner', 'Usar Garda para recuperar piernas'],
  },
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`));
}

function pointUrl(point: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point)}`;
}

function foodPriceLabel(food: FoodPlan) {
  if (food.type === 'bocata' || food.type === 'supermercado') {
    return food.price;
  }

  return 'Google €-€€ · objetivo ≤30 €/persona';
}

function foodNotes(food: FoodPlan) {
  return food.notes
    .replace(/Buscar sitio con valoración Google >= 4,0\./g, 'Elegir panadería o local cómodo para parada corta.')
    .replace(/Seleccionar solo valoración >= 4,0\./g, 'Elegir panadería bien situada para no alargar la etapa.')
    .replace(/Confirmar rating >= 4,0 y horario antes de ir\./g, 'Comprobar horario, carta y reseñas recientes antes de ir.')
    .replace(/Reservar o comprobar disponibilidad y rating >= 4,0\./g, 'Reservar o comprobar disponibilidad, carta y reseñas recientes.')
    .replace(/si rating >= 4,0 y hay mesa/g, 'si hay mesa y encaja con el horario')
    .replace(/si rating >= 4,0/g, 'si encaja por horario y carta')
    .replace(/rating >= 4,0/g, 'carta y reseñas recientes')
    .replace(/Confirmar valoración >= 4,0/g, 'Comprobar horario, carta y reseñas recientes')
    .replace(/Reservar y confirmar valoración >= 4,0/g, 'Reservar y comprobar carta y reseñas recientes')
    .replace(/Confirmar valoración >= 4,0\/reserva/g, 'Comprobar horario, carta y reserva')
    .replace(/Google Maps muestra valoración >= 4,0 y horario abierto/g, 'Google Maps muestra horario abierto, carta actualizada y reseñas recientes');
}

function costNote(note: string) {
  const lower = note.toLowerCase();

  if (lower.includes('cena') || lower.includes('comida refugio') || lower.startsWith('comida:')) {
    return note.replace(/: .*$/, ': Google €-€€; objetivo ≤30 €/persona');
  }

  return note;
}

function getGuide(day: Day): DayGuide {
  void guideOverrides;

  return {
    title: day.title ?? day.ruta,
    focus: displayDayReferences(day.summary ?? day.notas),
    foodStop: day.comidaAhorro,
    dinner: day.alojamientos[0]?.notas ?? 'Cerrar día, descargar equipaje y revisar la etapa siguiente.',
    practical: [...(day.warnings ?? []), day.planBClima, `Repostaje principal: ${day.repostaje.principal}`, `Alternativa: ${day.repostaje.alternativa}`],
  };
}

function getDetailedLogistics(day: Day): DetailedLogistics {
  void detailedLogistics;

  return {
    fuel: [
      { time: 'Antes de salir', name: day.repostaje.principal, query: day.repostaje.principal, use: 'Repostaje recomendado', notes: day.repostaje.regla },
      { time: 'Si hace falta', name: day.repostaje.alternativa, query: day.repostaje.alternativa, use: 'Alternativa', notes: 'Usar si el consumo o clima obliga a cambiar el plan.' },
    ],
    food: [
      { time: '12:30', name: 'Bocata de supermercado', query: `${day.origen} supermarket`, type: 'bocata', price: '8-14 €/persona', notes: day.comidaAhorro },
      { time: '20:00', name: `Cena en ${day.destino}`, query: `${day.destino} restaurant`, type: 'cena', price: '20-35 €/persona', notes: 'Elegir según horario abierto, carta actualizada y reseñas recientes.' },
    ],
    reservations: [],
    avoid: [day.planBClima, 'Apurar gasolina', 'Convertir una etapa funcional en día turístico largo'],
    costs: [`Presupuesto día: ${day.presupuestoDia.total} €`, `Gasolina estimada: ${day.presupuestoDia.combustible} €`, `Comida estimada: ${day.presupuestoDia.comida} €`],
    checklist: ['Agua', 'Snack', 'Mapa offline', 'Capa lluvia', 'Batería móvil'],
  };
}

function buildSchedule(day: Day, guide: DayGuide, logistics: DetailedLogistics) {
  const firstMap = day.mapas[0];
  const secondMap = day.mapas[1];
  const firstMidPoint = firstMap?.puntos[Math.floor(firstMap.puntos.length / 2)] ?? day.origen;
  const startTime = day.duracionHoras > 6.5 ? '07:30' : day.duracionHoras > 5 ? '08:00' : day.duracionHoras > 3 ? '09:00' : '09:30';
  const firstFuel = logistics.fuel[0];
  const secondFuel = logistics.fuel[1];
  const lunch = logistics.food.find((food) => food.type === 'comida' || food.type === 'bocata') ?? logistics.food[0];
  const dinner = logistics.food.find((food) => food.type === 'cena' || food.type === 'supermercado') ?? logistics.food[1];
  const activityDetails = day.actividades.length > 0
    ? day.actividades.map((activity) => `${activity.nombre}: ${activity.notas ?? 'actividad prevista del día'}. Coste estimado: ${activity.costeEstimado} €.`)
    : [`Puntos fuertes previstos: ${day.etapas.slice(0, 5).map((stage) => stage.nombre).join(', ')}.`];

  return [
    {
      time: 'Noche anterior',
      title: 'Preparación obligatoria',
      details: [
        'Descargar GPX del día y abrir el enlace de Google Maps para comprobar que recalcula bien.',
        'Dejar cargados móvil, intercom, cámara y batería externa.',
        'Preparar agua, capa de lluvia, guantes secos y snack accesible sin desmontar maletas.',
      ],
      link: firstMap?.gpxUrl,
    },
    {
      time: 'Antes de salir',
      title: 'Chequeo moto y equipaje',
      details: [
        'Revisar presión visual de neumáticos, cadena/estado general, luces y cierre de maletas.',
        `Combustible recomendado: ${firstFuel?.name ?? day.repostaje.principal}.`,
        'Salir con la ruta cargada y una alternativa mental si cambia el clima.',
      ],
      link: firstFuel ? mapsSearch(firstFuel.query) : pointUrl(day.origen),
    },
    {
      time: startTime,
      title: `Salida desde ${day.origen}`,
      details: [`Ruta prevista: ${day.ruta}.`, `Conducción estimada: ${day.duracionHoras} h / ${day.distanciaKm} km.`, guide.focus],
      link: pointUrl(day.origen),
    },
    {
      time: day.duracionHoras > 4 ? '10:30' : '11:00',
      title: secondMap ? `Bloque mañana: ${firstMap.bloque}` : `Primer tramo hacia ${firstMidPoint}`,
      details: [`Puntos clave: ${firstMap?.puntos.slice(0, 6).join(' > ') ?? day.etapas.slice(0, 3).map((stage) => stage.nombre).join(' > ')}.`, `Estado Google Maps: ${firstMap?.estado ?? day.estadoGoogle}.`],
      link: firstMap?.url,
    },
    {
      time: firstFuel?.time ?? '11:30',
      title: `Repostaje: ${firstFuel?.name ?? day.repostaje.principal}`,
      details: [
        firstFuel?.use ?? 'Repostaje recomendado del día.',
        firstFuel?.notes ?? day.repostaje.regla,
        'Aprovechar para beber agua, estirar piernas y revisar si la siguiente parada sigue teniendo sentido.',
      ],
      link: firstFuel ? mapsSearch(firstFuel.query) : undefined,
    },
    {
      time: lunch?.time ?? '12:30',
      title: `Comida: ${lunch?.name ?? 'parada corta'}`,
      details: [
        lunch ? foodNotes(lunch) : guide.foodStop,
        lunch ? `Precio: ${foodPriceLabel(lunch)}.` : 'Precio: según compra o carta del día.',
        'Si el sitio está lleno o rompe el horario, aplicar plan bocata y seguir.',
      ],
      link: lunch ? mapsSearch(lunch.query) : pointUrl(firstMidPoint),
    },
    {
      time: '14:00',
      title: secondMap ? `Bloque tarde: ${secondMap.bloque}` : day.actividades.length ? 'Actividad principal del día' : `Segundo tramo hacia ${day.destino}`,
      details: [secondMap ? `Puntos clave: ${secondMap.puntos.join(' > ')}.` : activityDetails.join(' '), `Repostaje recomendado: ${day.repostaje.principal}.`, 'No añadir desvíos si el día ya va 30 min tarde.'],
      link: secondMap?.url ?? day.rutaGoogleMaps,
    },
    {
      time: secondFuel?.time ?? '16:30',
      title: secondFuel ? `Repostaje/plan B: ${secondFuel.name}` : 'Control de tarde',
      details: [
        secondFuel?.use ?? 'Revisar cansancio, tiempo y hora real de llegada.',
        secondFuel?.notes ?? day.planBClima,
        'Si hay fatiga, cortar fotos/paradas y priorizar llegar con luz.',
      ],
      link: secondFuel ? mapsSearch(secondFuel.query) : pointUrl(day.destino),
    },
    {
      time: day.duracionHoras > 6 ? '18:30' : '17:30',
      title: `Llegada a ${day.destino}`,
      details: [`Base/noche: ${getBaseWithCountry(day.numero, day.base)}.`, 'Check-in, descargar equipaje, colgar ropa húmeda si aplica y poner a cargar electrónica.', day.alojamientos[0]?.notas ?? guide.dinner],
      link: pointUrl(day.destino),
    },
    {
      time: dinner?.time ?? '20:00',
      title: `Cena: ${dinner?.name ?? 'cena sencilla'}`,
      details: [
        dinner ? foodNotes(dinner) : guide.dinner,
        dinner ? `Precio: ${foodPriceLabel(dinner)}.` : 'Precio: según compra o carta del día.',
        'Antes de dormir: revisar meteorología, reservas del día siguiente y depósito.',
      ],
      link: dinner ? mapsSearch(dinner.query) : undefined,
    },
  ];
}

function describePoint(point: string, index: number, total: number) {
  if (index === 0) {
    return 'Salida: ruta cargada, depósito revisado y primera referencia del GPS confirmada.';
  }

  if (index === total - 1) {
    return 'Llegada: check-in, descargar equipaje, cargar dispositivos y preparar la jornada siguiente.';
  }

  const lower = point.toLowerCase();

  if (lower.includes('lago') || lower.includes('lake')) {
    return 'Parada escénica: 20-60 min según clima; fotos, agua y no convertirlo en comida larga salvo que esté previsto.';
  }

  if (lower.includes('pass') || lower.includes('passo') || lower.includes('col ')) {
    return 'Puerto/mirador: parada corta de 10-20 min, capa térmica a mano y comprobar viento antes de seguir.';
  }

  if (lower.includes('rifugio') || lower.includes('trail') || lower.includes('tre cime') || lower.includes('sorapis') || lower.includes('seceda')) {
    return 'Actividad principal: aparcar, preparar mochila, agua, comida, impermeable y respetar hora límite de vuelta.';
  }

  if (lower.includes('parking') || lower.includes('parcheggio')) {
    return 'Parking/logística: confirmar pago, ubicación de la moto, cascos/equipaje y punto de regreso.';
  }

  return 'Punto de paso: usarlo para orientar la ruta; parar solo si hace falta gasolina, baño, café o reajustar horario.';
}

function buildMicroPlan(day: Day) {
  const points = day.mapas.flatMap((map) => map.puntos).filter((point, index, list) => index === 0 || point !== list[index - 1]);

  return points.map((point, index) => ({
    point,
    label: index === 0 ? 'Inicio' : index === points.length - 1 ? 'Final' : `Paso ${index}`,
    detail: describePoint(point, index, points.length),
    important: isImportantPoint(point),
  }));
}

function isImportantPoint(point: string) {
  const lower = point.toLowerCase();

  return ['lago', 'pass', 'passo', 'col ', 'tre cime', 'sorapis', 'seceda', 'adolf munkel', 'geisleralm', 'zannes', 'stelvio', 'furka', 'grimsel', 'giau', 'fedaia', 'carezza', 'braies'].some((token) => lower.includes(token));
}

function insightForPoint(point: string) {
  const lower = point.toLowerCase();

  if (lower.includes('seceda')) {
    return {
      why: 'Una de las siluetas más reconocibles de Val Gardena: praderas inclinadas, aristas de las Odle y vistas muy abiertas si el día está limpio.',
      history: 'Val Gardena conserva una fuerte identidad ladina; muchas señales mezclan italiano, alemán y ladino. La zona ha vivido históricamente de pastos, madera, talla artesanal y turismo alpino.',
      tip: 'Subir pronto: las nubes suelen formarse a media jornada. Si arriba está tapado, no compensa pagar teleférico solo por cumplir.',
    };
  }

  if (lower.includes('tre cime')) {
    return {
      why: 'El icono absoluto de los Dolomitas orientales: tres torres de roca aisladas, muy fotogénicas desde Locatelli y desde la circular clásica.',
      history: 'La zona fue frente alpino durante la Primera Guerra Mundial; aún hay restos de posiciones, caminos militares y túneles en varias montañas cercanas.',
      tip: 'Llegar temprano a Rifugio Auronzo. Si hay niebla cerrada, esperar ventana o mover el día: la circular pierde mucho sin visibilidad.',
    };
  }

  if (lower.includes('sorapis')) {
    return {
      why: 'Lago de color turquesa lechoso por sedimentos minerales, encajado bajo paredes muy verticales. Es espectacular pero exige respeto.',
      history: 'El macizo Sorapiss forma parte de los Dolomitas ampezzanos, declarados Patrimonio Mundial UNESCO por su geología y paisaje.',
      tip: 'No hacerlo con lluvia o roca mojada. Hay tramos expuestos con cable; si aparece vértigo o tormenta, media vuelta sin discutir.',
    };
  }

  if (lower.includes('braies')) {
    return {
      why: 'Lago alpino de postal con aguas verdes y paredes al fondo. La vuelta completa permite escapar algo del punto más masificado.',
      history: 'Pragser Wildsee/Lago di Braies es uno de los accesos históricos al parque natural Fanes-Sennes-Braies y hoy tiene gestión estricta por saturación turística.',
      tip: 'Ir temprano y comprobar restricciones. No planificar comida larga aquí: mejor paseo, fotos y salida hacia la base oriental.',
    };
  }

  if (lower.includes('carezza')) {
    return {
      why: 'Lago pequeño pero muy fotogénico, famoso por reflejar el macizo del Latemar cuando el agua y la luz acompañan.',
      history: 'La leyenda local habla de una ninfa y un arcoíris roto en el lago, origen del nombre alemán Karersee asociado a colores intensos.',
      tip: 'Parada corta. Mejor primera hora o tarde; con luz dura y mucha gente pierde encanto.',
    };
  }

  if (lower.includes('val di funes') || lower.includes('adolf munkel') || lower.includes('geisleralm') || lower.includes('zannes')) {
    return {
      why: 'El valle ofrece una de las vistas más elegantes de Dolomitas: praderas, granjas, iglesias y las agujas Odle/Geisler al fondo.',
      history: 'El sendero Adolf Munkel recorre la base de las Odle y debe su nombre a uno de los impulsores históricos de rutas alpinas en la zona.',
      tip: 'Parking Zannes temprano. Llevar picnic aunque haya refugios: si hay cola o lluvia, no dependes de nadie.',
    };
  }

  if (lower.includes('stelvio')) {
    return {
      why: 'Uno de los puertos más famosos de Europa por sus tornanti y por la sensación de carretera colgada en alta montaña.',
      history: 'Construido en el siglo XIX bajo el Imperio Austríaco para conectar Lombardía con el Tirol. Hoy es mito ciclista y motero.',
      tip: 'No obsesionarse si hay niebla, frío o tráfico. La seguridad vale más que tachar el puerto.',
    };
  }

  if (lower.includes('furka') || lower.includes('grimsel')) {
    return {
      why: 'Carreteras suizas de ingeniería alpina, curvas limpias, glaciares, embalses y paisajes muy minerales.',
      history: 'Los grandes pasos alpinos combinan historia de ingeniería, turismo de montaña y conducción panorámica.',
      tip: 'Paradas cortas y depósito alto. En Suiza todo es caro: picnic y control de presupuesto.',
    };
  }

  if (lower.includes('giau') || lower.includes('fedaia')) {
    return {
      why: 'Puertos muy visuales: Giau por sus agujas y amplitud; Fedaia por la Marmolada y el lago de alta montaña.',
      history: 'La Marmolada es la cima más alta de Dolomitas y también tuvo presencia bélica en la Primera Guerra Mundial, con posiciones en hielo.',
      tip: 'Si viene tormenta, bajar por valle. Estos pasos son preciosos pero no merecen hacerse con visibilidad nula.',
    };
  }

  return {
    why: 'Punto útil dentro de la ruta para ordenar el día, descansar o conectar zonas sin convertir la jornada en una paliza.',
    history: 'Zona de paso con mezcla de culturas alpinas: italiana, francesa, suiza, austríaca o ladina según el tramo del viaje.',
    tip: 'Usarlo como punto logístico: baño, agua, gasolina o reajuste de horario. Si no aporta, no parar.',
  };
}

function buildSights(day: Day): Sight[] {
  const candidates = day.mapas.flatMap((map) => map.puntos).filter((point, index, list) => index === 0 || point !== list[index - 1]);
  const relevant = candidates.filter((point) => isImportantPoint(point) || day.etapas.some((stage) => stage.nombre === point && stage.tipo !== 'ciudad'));
  const selected = (relevant.length > 0 ? relevant : candidates.slice(1, 4)).slice(0, 4);

  return selected.map((point) => {
    const insight = insightForPoint(point);

    return {
      title: point,
      link: pointUrl(point),
      ...insight,
    };
  });
}

export function PlanDetalladoTab({ days }: PlanDetalladoTabProps) {
  const [selectedDay, setSelectedDay] = useState(days[0]?.numero ?? 1);
  const day = days.find((item) => item.numero === selectedDay) ?? days[0];
  const guide = getGuide(day);
  const logistics = getDetailedLogistics(day);
  const schedule = buildSchedule(day, guide, logistics);
  const microPlan = buildMicroPlan(day);
  const sights = buildSights(day);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
        <aside className="self-start rounded-[2rem] border border-stone-200 bg-white p-3 shadow-sm xl:sticky xl:top-24">
          <div className="px-3 pb-3 pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Días</p>
            <p className="mt-1 text-sm text-stone-600">Selecciona una hoja de ruta.</p>
          </div>
          <div className="space-y-2">
            {days.map((item) => (
              <button
                key={item.numero}
                onClick={() => setSelectedDay(item.numero)}
                className={`w-full rounded-2xl p-3 text-left transition ${item.numero === selectedDay ? 'bg-stone-950 text-white shadow-lg shadow-stone-300' : 'bg-stone-50 text-stone-800 hover:bg-stone-100'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{displayDayLabel(item.numero)}</span>
                  <span className="rounded-full bg-white/15 px-2 py-1 text-xs">{item.distanciaKm} km</span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs opacity-75">{getBaseWithCountry(item.numero, item.base)}</p>
                <p className="mt-1 line-clamp-1 text-[11px] opacity-80">{getCountriesLabel(item.numero)}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-6">
          <article className="overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white shadow-xl shadow-stone-200/70">
            <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold text-white">{displayDayLabel(day.numero)}</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 capitalize">{formatDate(day.fecha)}</span>
                  {getDayCountries(day.numero).map((country) => <span key={country} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">{country}</span>)}
                </div>
                <h3 className="mt-5 text-3xl font-semibold tracking-tight text-stone-950 md:text-5xl">{guide.title}</h3>
                <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">{guide.focus}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl bg-stone-100 p-4"><p className="text-xs uppercase tracking-wide text-stone-500">Ruta</p><p className="mt-1 text-sm font-semibold text-stone-950">{day.ruta}</p></div>
                  <div className="rounded-2xl bg-stone-100 p-4"><p className="text-xs uppercase tracking-wide text-stone-500">Base</p><p className="mt-1 text-sm font-semibold text-stone-950">{getBaseWithCountry(day.numero, day.base)}</p></div>
                  <div className="rounded-2xl bg-stone-100 p-4"><p className="text-xs uppercase tracking-wide text-stone-500">Conducción</p><p className="mt-1 text-sm font-semibold text-stone-950">{day.duracionHoras} h · {day.distanciaKm} km</p></div>
                  <div className="rounded-2xl bg-stone-100 p-4"><p className="text-xs uppercase tracking-wide text-stone-500">Intensidad</p><p className="mt-1 text-sm font-semibold text-stone-950">{day.intensidad}</p></div>
                </div>
              </div>
              <div className="border-t border-stone-100 bg-stone-950 p-6 text-white lg:border-l lg:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Panel operativo</p>
                <div className="mt-5 space-y-3 text-sm leading-6 text-stone-200">
                  <p><strong className="text-white">Restaurantes:</strong> elegir opciones Google ≥4,0 y precio medio ≤30 €/persona salvo zona sin alternativa razonable.</p>
                  <p><strong className="text-white">Mapa:</strong> abrir la ruta completa antes de salir y comprobar que respeta los puntos.</p>
                  <p><strong className="text-white">Garmin:</strong> importar GPX del día o del bloque si el navegador recalcula mal.</p>
                </div>
                <div className="mt-5 space-y-3">
                  {day.mapas.map((map) => (
                    <div key={map.bloque} className="rounded-2xl bg-white/10 p-3">
                      <p className="text-xs font-semibold text-stone-300">{map.bloque}</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <a href={map.url} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-red-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-red-700">Google Maps</a>
                        {map.gpxUrl && <a href={map.gpxUrl} download className="rounded-xl bg-emerald-500 px-3 py-2 text-center text-xs font-semibold text-stone-950 hover:bg-emerald-400">Track Garmin</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Horario orientativo</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Plan operativo por horas</h3>
            <div className="mt-6 space-y-5">
              {schedule.map((item) => (
                <div key={`${item.time}-${item.title}`} className="grid gap-4 border-l border-stone-200 pl-5 md:grid-cols-[90px_1fr]">
                  <div className="relative text-sm font-semibold text-emerald-700">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                    {item.time}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-stone-950">{item.title}</h4>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm leading-6 text-stone-600">
                      {item.details.filter(Boolean).map((detail) => <li key={detail}>• {detail}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Lo que veremos</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Fotos, historia y consejos del día</h3>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {sights.map((sight) => (
                <article key={sight.title} className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-50 shadow-sm">
                  <div className="bg-gradient-to-br from-stone-950 to-stone-800 p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Punto real de la ruta</p>
                    <h4 className="mt-2 text-2xl font-semibold">{sight.title}</h4>
                    <p className="mt-2 text-xs text-stone-300">Sin foto genérica: abrir ubicación para comprobar el lugar exacto.</p>
                  </div>
                  <div className="space-y-4 p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Por qué merece la pena</p>
                      <p className="mt-1 text-sm leading-6 text-stone-700">{sight.why}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Historia / curiosidad</p>
                      <p className="mt-1 text-sm leading-6 text-stone-700">{sight.history}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Consejo</p>
                      <p className="mt-1 text-sm leading-6 text-stone-700">{sight.tip}</p>
                    </div>
                    <a href={sight.link} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-stone-950 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800">Abrir ubicación</a>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Detalle mínimo por puntos</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Qué hacer en cada punto del día</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {microPlan.map((item, index) => (
                <a key={`${item.point}-${index}`} href={pointUrl(item.point)} target="_blank" rel="noopener noreferrer" className={`rounded-2xl border p-4 transition hover:border-stone-300 hover:bg-white ${item.important ? 'border-amber-200 bg-amber-50 shadow-sm shadow-amber-100' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${item.important ? 'bg-amber-400 text-stone-950' : 'bg-stone-950 text-white'}`}>{item.important ? '★' : index + 1}</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{item.important ? 'Actividad principal' : item.label}</p>
                      <h4 className="mt-1 font-semibold text-stone-950">{item.point}</h4>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{item.detail}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </article>

          <div className="grid gap-5 lg:grid-cols-3">
            <article className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Repostaje exacto</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {logistics.fuel.map((fuel) => (
                  <a key={`${fuel.time}-${fuel.name}`} href={mapsSearch(fuel.query)} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-stone-100 p-4 transition hover:bg-stone-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{fuel.time} · {fuel.use}</p>
                        <h4 className="mt-1 font-semibold text-stone-950">{fuel.name}</h4>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-stone-600">Maps</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{fuel.notes}</p>
                  </a>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-stone-500">Regla del día: {day.repostaje.regla}</p>
            </article>
            <article className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Plan B / clima</p>
              <p className="mt-3 text-sm leading-6 text-amber-950">{day.planBClima}</p>
            </article>
          </div>

          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Comida y cena</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">Opciones concretas y plan bocata</h3>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Links a ficha de Google Maps</span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {logistics.food.map((food) => (
                <a key={`${food.time}-${food.name}`} href={mapsSearch(food.query)} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-stone-200 bg-stone-50 p-4 transition hover:border-emerald-300 hover:bg-white hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{food.time} · {food.type}</p>
                      <h4 className="mt-1 font-semibold text-stone-950">{food.name}</h4>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-stone-600">{foodPriceLabel(food)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{foodNotes(food)}</p>
                </a>
              ))}
            </div>
          </article>

          <div className="grid gap-5 lg:grid-cols-3">
            <article className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Reservas / comprobar</p>
              {logistics.reservations.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {logistics.reservations.map((reservation) => (
                    <a key={reservation.title} href={reservation.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl bg-stone-100 p-4 transition hover:bg-stone-200">
                      <p className="font-semibold text-stone-950">{reservation.title}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{reservation.notes}</p>
                    </a>
                  ))}
                </div>
              ) : <p className="mt-3 text-sm leading-6 text-stone-600">Sin reserva específica. Revisar alojamiento, tiempo y rating de restaurantes antes de salir.</p>}
            </article>
            <article className="rounded-[2rem] border border-red-200 bg-red-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Cosas a evitar</p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-red-950">
                {logistics.avoid.map((item) => <li key={item}>• {displayDayReferences(item)}</li>)}
              </ul>
            </article>
            <article className="rounded-[2rem] border border-sky-200 bg-sky-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Costes y checklist</p>
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {logistics.costs.map((item) => <span key={item} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-sky-950 shadow-sm">{costNote(item)}</span>)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {logistics.checklist.map((item) => <span key={item} className="rounded-full bg-sky-100 px-3 py-2 text-xs font-medium text-sky-950">{displayDayReferences(item)}</span>)}
                </div>
              </div>
            </article>
          </div>

          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Mapas y puntos</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {day.mapas.map((map) => (
                <div key={map.bloque} className="rounded-2xl bg-stone-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Google Maps · {map.estado}</p>
                  <h4 className="mt-1 font-semibold text-stone-950">{map.bloque}</h4>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{map.puntos.join(' > ')}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <a href={map.url} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-red-600 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-red-700">Abrir Google Maps</a>
                    {map.gpxUrl && <a href={map.gpxUrl} download className="rounded-xl bg-stone-950 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-stone-800">Descargar GPX Garmin</a>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {day.etapas.map((stage) => (
                <a key={`${stage.nombre}-${stage.tipo}`} href={pointUrl(stage.nombre)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-sm ring-1 ring-stone-200 hover:bg-stone-50">
                  {stage.nombre}
                </a>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Notas prácticas</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {guide.practical.map((note) => <span key={note} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700">{displayDayReferences(note)}</span>)}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
