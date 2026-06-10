export function displayDayNumber(dayNumber: number) {
  return dayNumber + 1;
}

export function displayDayLabel(dayNumber: number) {
  return `Día ${displayDayNumber(dayNumber)}`;
}

export function displayDayReferences(text: string) {
  return text.replace(/\b(día|Día) (\d+)\b/g, (match, label: string, value: string) => {
    const displayValue = displayDayNumber(Number(value));
    return `${label} ${displayValue}`;
  });
}
