const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A API trabalha com datas em UTC, então todos os cálculos usam UTC. */
export function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function subtractDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
}

export function todayIso() {
  return toIsoDate(new Date());
}

function parseIso(isoDate) {
  const match = ISO_DATE.exec(isoDate ?? '');
  if (!match) return null;
  const [, year, month, day] = match;
  return { year, month: Number(month), day };
}

/** '2024-10-24' -> '24/10/2024' */
export function formatDateBR(isoDate) {
  const parts = parseIso(isoDate);
  return parts ? `${parts.day}/${String(parts.month).padStart(2, '0')}/${parts.year}` : '—';
}

/** '2024-10-24' -> '24 Out' */
export function formatDayMonth(isoDate) {
  const parts = parseIso(isoDate);
  return parts ? `${parts.day} ${MONTHS_SHORT[parts.month - 1]}` : '—';
}

/** '2024-10-24' -> '24 Out 2024' */
export function formatDayMonthYear(isoDate) {
  const parts = parseIso(isoDate);
  return parts ? `${parts.day} ${MONTHS_SHORT[parts.month - 1]} ${parts.year}` : '—';
}

/** Date -> '17:42' em UTC */
export function formatUtcTime(date) {
  if (!(date instanceof Date)) return '—';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

/** Rótulo relativo para datas recentes: 'hoje', 'ontem' ou dd/mm/aaaa. */
export function formatRelativeDay(isoDate) {
  const today = todayIso();
  if (isoDate === today) return 'Hoje';
  if (isoDate === toIsoDate(subtractDays(new Date(), 1))) return 'Ontem';
  return formatDateBR(isoDate);
}

/** Dias corridos entre duas datas ISO. */
export function daysBetween(startIso, endIso) {
  return Math.round((Date.parse(endIso) - Date.parse(startIso)) / 86_400_000);
}
