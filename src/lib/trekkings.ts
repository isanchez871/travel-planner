export type TrekkingDifficulty = 'facil' | 'media' | 'alta';

export type TrekkingInfo = {
  day: number;
  title: string;
  subtitle: string;
  distance: string;
  duration: string;
  elevation: string;
  difficulty: TrekkingDifficulty;
  difficultyLabel: string;
  start: string;
  end: string;
  map: string;
  wikiloc: string;
  photos: string;
  cost: string;
  bestTime: string;
  routeNotes: string[];
  advice: string[];
  avoid: string[];
  plan: string[];
  checklist: string[];
};

function wikilocSearch(query: string) {
  return `https://www.wikiloc.com/wikiloc/find.do?q=${encodeURIComponent(query)}`;
}

function googlePhotos(query: string) {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
}

const rawTrekkingDetails: TrekkingInfo[] = [
  {
    day: 6,
    title: 'Lago di Carezza',
    subtitle: 'Paseo breve y fotogénico integrado en la entrada a Dolomitas por Carezza.',
    distance: '1-2 km',
    duration: '30-45 min',
    elevation: 'Prácticamente llano',
    difficulty: 'facil',
    difficultyLabel: 'Fácil',
    start: 'Parking Lago di Carezza',
    end: 'Parking Lago di Carezza',
    map: 'https://www.google.com/maps/dir/Bolzano/Lago%20di%20Carezza/Ortisei',
    wikiloc: wikilocSearch('Lago di Carezza circular'),
    photos: googlePhotos('Lago di Carezza Dolomites'),
    cost: 'Parking aprox. 2-5 €',
    bestTime: 'Mañana o última hora, cuando hay menos grupos.',
    routeNotes: ['Paseo circular corto alrededor del lago.', 'No salirse de pasarelas ni zonas marcadas.', 'Ideal como parada visual, no como trekking largo.'],
    advice: ['Usarlo como parada de entrada a Dolomitas.', 'Si llueve, sigue mereciendo una parada corta.', 'No perder más de 45-60 min si el día va cargado.'],
    avoid: ['Aparcar fuera de zonas permitidas.', 'Convertirlo en parada larga si vais tarde hacia Ortisei.'],
    plan: ['Llegar por la mañana', 'Vuelta tranquila al lago', 'Fotos sin prisa', 'Continuar solo si el tiempo acompaña'],
    checklist: ['Cámara', 'Chaqueta ligera', 'Agua'],
  },
  {
    day: 7,
    title: 'Seceda ridgeline',
    subtitle: 'El mirador más icónico de Val Gardena, con caminata flexible y tarde tranquila.',
    distance: '6-9 km',
    duration: '2h30-4h',
    elevation: '+250/+500 m según variante',
    difficulty: 'media',
    difficultyLabel: 'Media fácil con buena visibilidad',
    start: 'Teleférico Ortisei-Furnes-Seceda',
    end: 'Ortisei',
    map: 'https://www.google.com/maps/dir/Ortisei/Seceda%20Cable%20Car/Seceda/Ortisei',
    wikiloc: wikilocSearch('Seceda Ortisei Rifugio Firenze'),
    photos: googlePhotos('Seceda ridgeline Val Gardena'),
    cost: 'Teleférico aprox. 40-50 €',
    bestTime: 'Primera subida del teleférico si el cielo está limpio.',
    routeNotes: ['Subir en teleférico desde Ortisei.', 'Priorizar la cresta y miradores de Seceda.', 'Alargar hacia Rifugio Firenze solo si hay visibilidad y piernas.'],
    advice: ['Mirar webcams antes de pagar el teleférico.', 'Llevar cortavientos aunque abajo haga calor.', 'Si hay nubes cerradas, cambiar por paseo bajo en Val Gardena.'],
    avoid: ['Subir tarde con previsión de tormenta.', 'Hacer la cresta con viento fuerte o niebla cerrada.'],
    plan: ['Subir temprano en teleférico', 'Caminar por la cresta panorámica', 'Picnic o café en refugio', 'Tarde libre en Ortisei/Santa Cristina'],
    checklist: ['Cortavientos', 'Agua', 'Gafas de sol', 'Capa de lluvia', 'Batería/cámara'],
  },
  {
    day: 8,
    title: 'Lago di Braies',
    subtitle: 'Paseo corto obligatorio, encajado en el cambio de base hacia Cortina/Dobbiaco.',
    distance: '3,5-4 km',
    duration: '1h15-1h45',
    elevation: 'Baja',
    difficulty: 'facil',
    difficultyLabel: 'Fácil, muy concurrido',
    start: 'Parking Lago di Braies',
    end: 'Parking Lago di Braies',
    map: 'https://www.google.com/maps/dir/Lago%20di%20Braies/Lago%20di%20Braies',
    wikiloc: wikilocSearch('Lago di Braies circular'),
    photos: googlePhotos('Lago di Braies Pragser Wildsee'),
    cost: 'Parking/reserva según temporada',
    bestTime: 'Muy temprano o final de tarde.',
    routeNotes: ['Vuelta circular alrededor del lago.', 'El lado opuesto tiene mejores fotos y menos presión.', 'Puede requerir reserva de acceso/parking en temporada.'],
    advice: ['Confirmar restricciones 2026 antes del viaje.', 'No confiar en llegar a media mañana sin reserva.', 'Encajarlo como paseo, no como trekking principal.'],
    avoid: ['Horas punta.', 'Entrar sin mirar parking/reserva.', 'Quedarse demasiado tiempo si hay que dormir en Misurina.'],
    plan: ['Llegar antes de la hora punta', 'Vuelta completa al lago', 'Fotos desde la orilla opuesta', 'Seguir hacia Dobbiaco/Cortina sin prisa'],
    checklist: ['Reserva/parking revisado', 'Agua', 'Cámara', 'Chaqueta ligera'],
  },
  {
    day: 9,
    title: 'Tre Cime di Lavaredo',
    subtitle: 'Circular clásica desde Rifugio Auronzo hasta Locatelli, día completo sin añadir moto extra.',
    distance: '10 km aprox.',
    duration: '3h30-4h30',
    elevation: '+350/+450 m',
    difficulty: 'media',
    difficultyLabel: 'Media, alpina pero marcada',
    start: 'Rifugio Auronzo',
    end: 'Rifugio Auronzo',
    map: 'https://www.google.com/maps/dir/Rifugio%20Auronzo/Tre%20Cime%20di%20Lavaredo/Rifugio%20Locatelli/Rifugio%20Auronzo',
    wikiloc: wikilocSearch('Tre Cime di Lavaredo Rifugio Auronzo Locatelli circular'),
    photos: googlePhotos('Tre Cime di Lavaredo Rifugio Locatelli'),
    cost: 'Peaje/parking Rifugio Auronzo aprox. 30-35 €',
    bestTime: 'Salir muy temprano; Locatelli antes de la masa de gente.',
    routeNotes: ['Circular clásica Auronzo -> Lavaredo -> Locatelli -> Auronzo.', 'Cadini solo si tiempo, visibilidad y energía acompañan.', 'Es una ruta muy popular: madrugar cambia el día.'],
    advice: ['Dormir cerca de Misurina es clave.', 'Llevar picnic aunque haya refugios.', 'Revisar meteo alpina y estado del acceso Auronzo.'],
    avoid: ['Llegar tarde al parking.', 'Meter Cadini con niebla o tormenta.', 'Subestimar frío/viento en altura.'],
    plan: ['Salir muy temprano desde Cortina/Dobbiaco', 'Auronzo -> Lavaredo -> Locatelli', 'Parada larga frente a las tres cimas', 'Regreso sin añadir puertos'],
    checklist: ['Capas de abrigo', 'Impermeable', 'Agua', 'Picnic', 'Bastones opcionales'],
  },
  {
    day: 10,
    title: 'Lago di Sorapis',
    subtitle: 'El trekking más serio del plan: precioso, largo y solo recomendable con terreno seco.',
    distance: '11-13 km',
    duration: '4h30-5h30',
    elevation: '+450/+600 m',
    difficulty: 'alta',
    difficultyLabel: 'Media-alta por tramos expuestos',
    start: 'Passo Tre Croci',
    end: 'Passo Tre Croci',
    map: 'https://www.google.com/maps/dir/Passo%20Tre%20Croci/Lago%20di%20Sorapis/Rifugio%20Vandelli/Passo%20Tre%20Croci',
    wikiloc: wikilocSearch('Lago di Sorapis Passo Tre Croci Rifugio Vandelli'),
    photos: googlePhotos('Lago di Sorapis Rifugio Vandelli trail'),
    cost: 'Parking/transporte local si aplica',
    bestTime: 'Salida temprana con terreno seco y previsión estable.',
    routeNotes: ['Ruta clásica por sendero 215 desde Passo Tre Croci.', 'Hay tramos estrechos/equipados con cable.', 'El lago es el objetivo; no forzar si hay lluvia.'],
    advice: ['Solo hacerlo con buen calzado y terreno seco.', 'Llevar agua suficiente; no depender del refugio.', 'Si hay vértigo fuerte, mejor alternativa baja.'],
    avoid: ['Lluvia, nieve residual o tormentas.', 'Empezar tarde.', 'Ir sin agua/comida o con zapatilla inadecuada.'],
    plan: ['Salir temprano para aparcar', 'Sendero 215 hacia Rifugio Vandelli', 'Lago di Sorapis con pausa larga', 'Regreso antes de la tarde'],
    checklist: ['Buen calzado', 'Sin vértigo fuerte', 'Agua suficiente', 'Impermeable', 'No hacerlo con lluvia'],
  },
  {
    day: 12,
    title: 'Adolf Munkel Trail / Val di Funes',
    subtitle: 'Circular bajo las Odle, probablemente el trekking más equilibrado del viaje.',
    distance: '9-10 km',
    duration: '3h30-4h30',
    elevation: '+350/+500 m',
    difficulty: 'media',
    difficultyLabel: 'Media, sendero alpino sencillo con buen tiempo',
    start: 'Parcheggio Zannes',
    end: 'Parcheggio Zannes',
    map: 'https://www.google.com/maps/dir/Parcheggio%20Zannes/Adolf%20Munkel%20Trail/Geisleralm/Rifugio%20Odle/Parcheggio%20Zannes',
    wikiloc: wikilocSearch('Adolf Munkel Trail Zannes Geisleralm'),
    photos: googlePhotos('Adolf Munkel Trail Geisleralm Odle'),
    cost: 'Parking aprox. 8-12 €',
    bestTime: 'Mañana con luz lateral bajo las Odle.',
    routeNotes: ['Inicio lógico en Zannes/Zanser Alm.', 'Sendero bajo las Odle con parada en Geisleralm o Rifugio Odle.', 'Combina trekking y fotos sin mover base.'],
    advice: ['Llegar pronto a Zannes.', 'Llevar picnic aunque haya refugio.', 'Cerrar con Santa Maddalena si hay luz.'],
    avoid: ['Empezar tarde.', 'Hacerlo con lluvia fuerte.', 'No llevar efectivo/tarjeta para parking.'],
    plan: ['Aparcar temprano en Zannes', 'Sendero Adolf Munkel bajo las Odle', 'Parada larga en Geisleralm/Rifugio Odle', 'Fotos finales en Santa Maddalena'],
    checklist: ['Botas o zapatilla de trekking', 'Agua', 'Capa impermeable', 'Algo de abrigo', 'Picnic de súper'],
  },
];

export const trekkingDetails = [...rawTrekkingDetails].sort((a, b) => a.day - b.day);

export function getTrekkingsForDay(dayNumber: number) {
  return trekkingDetails.filter((trekking) => trekking.day === dayNumber);
}

export function difficultyClass(difficulty: TrekkingDifficulty) {
  if (difficulty === 'facil') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (difficulty === 'media') return 'border-amber-200 bg-amber-50 text-amber-800';
  return 'border-red-200 bg-red-50 text-red-800';
}
