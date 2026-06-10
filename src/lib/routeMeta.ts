const dayCountries: Record<number, string[]> = {
  0: ['🇪🇸 España'],
  1: ['🇪🇸 España', '🇫🇷 Francia'],
  2: ['🇫🇷 Francia'],
  3: ['🇫🇷 Francia'],
  4: ['🇫🇷 Francia', '🇨🇭 Suiza', '🇮🇹 Italia'],
  5: ['🇮🇹 Italia'],
  6: ['🇮🇹 Italia'],
  7: ['🇮🇹 Italia'],
  8: ['🇮🇹 Italia'],
  9: ['🇮🇹 Italia'],
  10: ['🇮🇹 Italia'],
  11: ['🇮🇹 Italia'],
  12: ['🇮🇹 Italia'],
  13: ['🇮🇹 Italia', '🇦🇹 Austria'],
  14: ['🇦🇹 Austria'],
  15: ['🇦🇹 Austria', '🇮🇹 Italia', '🇪🇸 España'],
  16: ['🇪🇸 España'],
};

const baseCountries: Record<number, string> = {
  0: 'Lleida, España 🇪🇸',
  1: 'Avignon, Francia 🇫🇷',
  2: 'Briançon, Francia 🇫🇷',
  3: 'Lanslebourg-Mont-Cenis, Francia 🇫🇷',
  4: 'Aosta, Italia 🇮🇹',
  5: 'Bormio, Italia 🇮🇹',
  6: 'Ortisei, Italia 🇮🇹',
  7: 'Ortisei, Italia 🇮🇹',
  8: 'Lago di Misurina, Italia 🇮🇹',
  9: 'Lago di Misurina, Italia 🇮🇹',
  10: 'Cortina d’Ampezzo, Italia 🇮🇹',
  11: 'Ortisei, Italia 🇮🇹',
  12: 'Ortisei, Italia 🇮🇹',
  13: 'Lienz, Austria 🇦🇹',
  14: 'Zell am See, Austria 🇦🇹',
  15: 'Ferry Génova-Barcelona 🇮🇹🇪🇸',
  16: 'Casa, España 🇪🇸',
};

export function getDayCountries(dayNumber: number) {
  return dayCountries[dayNumber] ?? [];
}

export function getBaseWithCountry(dayNumber: number, fallback: string) {
  return baseCountries[dayNumber] ?? fallback;
}

export function getCountriesLabel(dayNumber: number) {
  return getDayCountries(dayNumber).join(' · ');
}
