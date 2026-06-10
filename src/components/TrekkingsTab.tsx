'use client';

import { Day } from '@/lib/types';

interface TrekkingsTabProps {
  days: Day[];
}

const trekkingDetails = [
  {
    day: 7,
    title: 'Seceda ridgeline',
    subtitle: 'El mirador más icónico de Val Gardena, con caminata flexible y tarde tranquila.',
    distance: '6-9 km',
    duration: '2h30-4h',
    difficulty: 'Media fácil si hay buena visibilidad',
    start: 'Teleférico Ortisei-Furnes-Seceda',
    end: 'Ortisei',
    map: 'https://www.google.com/maps/dir/Ortisei/Seceda%20Cable%20Car/Seceda/Ortisei',
    cost: 'Teleférico aprox. 40-50 €',
    plan: ['Subir temprano en teleférico', 'Caminar por la cresta panorámica', 'Picnic o café en refugio', 'Tarde libre en Ortisei/Santa Cristina'],
    checklist: ['Cortavientos', 'Agua', 'Gafas de sol', 'Capa de lluvia', 'Batería/cámara'],
  },
  {
    day: 12,
    title: 'Adolf Munkel Trail / Val di Funes',
    subtitle: 'Circular bajo las Odle, probablemente el trekking más equilibrado del viaje.',
    distance: '9-10 km',
    duration: '3h30-4h30',
    difficulty: 'Media, sendero alpino sencillo si hace buen tiempo',
    start: 'Parcheggio Zannes',
    end: 'Parcheggio Zannes',
    map: 'https://www.google.com/maps/dir/Parcheggio%20Zannes/Adolf%20Munkel%20Trail/Geisleralm/Rifugio%20Odle/Parcheggio%20Zannes',
    cost: 'Parking aprox. 8-12 €',
    plan: ['Aparcar temprano en Zannes', 'Sendero Adolf Munkel bajo las Odle', 'Parada larga en Geisleralm/Rifugio Odle', 'Fotos finales en Santa Maddalena'],
    checklist: ['Botas o zapatilla de trekking', 'Agua', 'Capa impermeable', 'Algo de abrigo', 'Picnic de súper'],
  },
  {
    day: 8,
    title: 'Lago di Braies',
    subtitle: 'Paseo corto obligatorio, encajado en el cambio de base hacia Cortina/Dobbiaco.',
    distance: '3,5-4 km',
    duration: '1h15-1h45',
    difficulty: 'Fácil, muy concurrido',
    start: 'Parking Lago di Braies',
    end: 'Parking Lago di Braies',
    map: 'https://www.google.com/maps/dir/Lago%20di%20Braies/Lago%20di%20Braies',
    cost: 'Parking/reserva según temporada',
    plan: ['Llegar antes de la hora punta', 'Vuelta completa al lago', 'Fotos desde la orilla opuesta', 'Seguir hacia Dobbiaco/Cortina sin prisa'],
    checklist: ['Reserva/parking revisado', 'Agua', 'Cámara', 'Chaqueta ligera'],
  },
  {
    day: 9,
    title: 'Tre Cime di Lavaredo',
    subtitle: 'Circular clásica desde Rifugio Auronzo hasta Locatelli, día completo sin añadir moto extra.',
    distance: '10 km aprox.',
    duration: '3h30-4h30',
    difficulty: 'Media, alpina pero muy marcada',
    start: 'Rifugio Auronzo',
    end: 'Rifugio Auronzo',
    map: 'https://www.google.com/maps/dir/Rifugio%20Auronzo/Tre%20Cime%20di%20Lavaredo/Rifugio%20Locatelli/Rifugio%20Auronzo',
    cost: 'Peaje/parking Rifugio Auronzo aprox. 30-35 €',
    plan: ['Salir muy temprano desde Cortina/Dobbiaco', 'Auronzo -> Lavaredo -> Locatelli', 'Parada larga frente a las tres cimas', 'Regreso sin añadir puertos'],
    checklist: ['Capas de abrigo', 'Impermeable', 'Agua', 'Picnic', 'Bastones opcionales'],
  },
  {
    day: 10,
    title: 'Lago di Sorapis',
    subtitle: 'El trekking más serio del plan: precioso, largo y solo recomendable con terreno seco.',
    distance: '11-13 km',
    duration: '4h30-5h30',
    difficulty: 'Media-alta por tramos expuestos con cable',
    start: 'Passo Tre Croci',
    end: 'Passo Tre Croci',
    map: 'https://www.google.com/maps/dir/Passo%20Tre%20Croci/Lago%20di%20Sorapis/Rifugio%20Vandelli/Passo%20Tre%20Croci',
    cost: 'Parking/transporte local si aplica',
    plan: ['Salir temprano para aparcar', 'Sendero 215 hacia Rifugio Vandelli', 'Lago di Sorapis con pausa larga', 'Regreso antes de la tarde'],
    checklist: ['Buen calzado', 'Sin vértigo fuerte', 'Agua suficiente', 'Impermeable', 'No hacerlo con lluvia'],
  },
  {
    day: 6,
    title: 'Lago di Carezza',
    subtitle: 'Paseo breve y fotogénico integrado en la entrada a Dolomitas por Carezza.',
    distance: '1-2 km',
    duration: '30-45 min',
    difficulty: 'Fácil',
    start: 'Parking Lago di Carezza',
    end: 'Parking Lago di Carezza',
    map: 'https://www.google.com/maps/dir/Bolzano/Lago%20di%20Carezza/Ortisei',
    cost: 'Parking aprox. 2-5 €',
    plan: ['Llegar por la mañana', 'Vuelta tranquila al lago', 'Fotos sin prisa', 'Continuar solo si el tiempo acompaña'],
    checklist: ['Cámara', 'Chaqueta ligera', 'Agua'],
  },
];

export function TrekkingsTab({ days }: TrekkingsTabProps) {
  const trekkingDays = trekkingDetails.map((trekking) => ({
    ...trekking,
    dayData: days.find((day) => day.numero === trekking.day),
  }));

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white shadow-xl shadow-stone-200/70">
        <div className="relative min-h-[430px] overflow-hidden bg-[radial-gradient(circle_at_18%_25%,rgba(52,211,153,0.34),transparent_28rem),linear-gradient(135deg,#064e3b,#0f172a_58%,#1c1917)] p-6 text-white md:p-8">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(120deg,transparent_0,transparent_44%,rgba(255,255,255,.2)_45%,transparent_46%)]" />
          <div className="relative flex min-h-[370px] flex-col justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-stone-950">6 trekkings / paseos clave</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">Dolomitas como prioridad</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">Días 6-12</span>
            </div>
            <div className="max-w-4xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-200">Plan de montaña</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Más caminar, menos devorar kilómetros</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-200">Seceda, Val di Funes, Braies, Tre Cime, Sorapis y Carezza quedan integrados en días con bases lógicas y margen meteorológico.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {trekkingDays.map((trekking) => (
          <article key={trekking.title} className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-emerald-900 to-stone-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Día {trekking.day}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{trekking.title}</h3>
              <p className="mt-2 text-xs text-emerald-100">Sin foto genérica: usar mapa y datos reales del punto.</p>
            </div>
            <div className="space-y-5 p-5">
              <p className="text-sm leading-6 text-stone-600">{trekking.subtitle}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Distancia</p><p className="font-semibold text-stone-950">{trekking.distance}</p></div>
                <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Duración</p><p className="font-semibold text-stone-950">{trekking.duration}</p></div>
                <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Inicio</p><p className="font-semibold text-stone-950">{trekking.start}</p></div>
                <div className="rounded-2xl bg-stone-100 p-3"><p className="text-xs uppercase tracking-wide text-stone-500">Coste</p><p className="font-semibold text-stone-950">{trekking.cost}</p></div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Plan</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
                  {trekking.plan.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <span className="font-semibold">Plan B: </span>{trekking.dayData?.planBClima ?? 'Mover a una ventana de buen tiempo o sustituir por paseo corto.'}
              </div>
              <div className="flex flex-wrap gap-2">
                {trekking.checklist.map((item) => <span key={item} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700">{item}</span>)}
              </div>
              <a href={trekking.map} target="_blank" rel="noopener noreferrer" className="block rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700">Abrir mapa</a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
