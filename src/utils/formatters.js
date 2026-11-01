const LOCALE = 'pt-BR';

// Formatadores do Intl são caros de criar; mantemos um cache imutável por chave.
const formatterCache = new Map();
function getFormatter(key, factory) {
  if (!formatterCache.has(key)) formatterCache.set(key, factory());
  return formatterCache.get(key);
}

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

/** 1250 + 'BRL' -> 'R$ 1.250,00' */
export function formatMoney(value, currencyCode) {
  if (!isFiniteNumber(value)) return '—';
  try {
    return getFormatter(`money-${currencyCode}`, () =>
      new Intl.NumberFormat(LOCALE, { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    ).format(value);
  } catch {
    return `${formatNumber(value, 2)} ${currencyCode}`;
  }
}

/** 1250 -> '1.250,00' */
export function formatNumber(value, fractionDigits = 2) {
  if (!isFiniteNumber(value)) return '—';
  return getFormatter(`number-${fractionDigits}`, () =>
    new Intl.NumberFormat(LOCALE, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }),
  ).format(value);
}

/** Casas decimais de uma taxa conforme a magnitude (JPY, IDR e BRL convivem na mesma UI). */
export function rateDecimals(value) {
  const abs = Math.abs(value);
  if (abs >= 1000) return 2;
  if (abs >= 0.01) return 4;
  return 6;
}

/** Taxa de câmbio: 0.18446 -> '0,1845' */
export function formatRate(value, fractionDigits) {
  if (!isFiniteNumber(value)) return '—';
  return formatNumber(value, fractionDigits ?? rateDecimals(value));
}

/** 0.35 -> '+0,35%' (valor já em pontos percentuais) */
export function formatPercent(value, { signed = true, fractionDigits = 2 } = {}) {
  if (!isFiniteNumber(value)) return '—';
  const formatted = formatNumber(Math.abs(value), fractionDigits);
  if (!signed) return `${value < 0 ? '-' : ''}${formatted}%`;
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${formatted}%`;
}

/** Símbolo curto da moeda: 'BRL' -> 'R$', 'USD' -> '$'. */
export function getCurrencySymbol(currencyCode) {
  try {
    const parts = getFormatter(`symbol-${currencyCode}`, () =>
      new Intl.NumberFormat(LOCALE, { style: 'currency', currency: currencyCode, currencyDisplay: 'narrowSymbol' }),
    ).formatToParts(0);
    return parts.find((part) => part.type === 'currency')?.value ?? currencyCode;
  } catch {
    return currencyCode;
  }
}

/** Nome da moeda em português via Intl, com fallback para o nome em inglês da API. */
export function getCurrencyName(currencyCode, fallbackName = currencyCode) {
  try {
    const displayNames = getFormatter('display-names', () => new Intl.DisplayNames([LOCALE], { type: 'currency' }));
    const name = displayNames.of(currencyCode);
    if (!name || name === currencyCode) return fallbackName;
    return name
      .split(' ')
      .map((word) => (word.length > 2 ? word.charAt(0).toLocaleUpperCase(LOCALE) + word.slice(1) : word))
      .join(' ');
  } catch {
    return fallbackName;
  }
}

/** Remove acentos e caixa para comparações de busca. */
export function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Direção de uma variação para escolher cor/ícone. */
export function getTrendDirection(value, threshold = 0) {
  if (!isFiniteNumber(value) || Math.abs(value) <= threshold) return 'flat';
  return value > 0 ? 'up' : 'down';
}
