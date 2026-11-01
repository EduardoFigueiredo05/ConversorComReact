import { daysBetween } from './dates';

const EUR = 'EUR';

/**
 * Taxa cruzada a partir de uma tabela com base EUR.
 * Retorna quanto 1 `from` vale em `to`, ou null se faltar algum dado.
 */
export function crossRate(eurRates, from, to) {
  if (!eurRates) return null;
  const fromRate = from === EUR ? 1 : eurRates[from];
  const toRate = to === EUR ? 1 : eurRates[to];
  if (!fromRate || !toRate) return null;
  return toRate / fromRate;
}

/** Variação percentual entre dois valores (em pontos percentuais). */
export function percentChange(previous, current) {
  if (!previous || !Number.isFinite(previous) || !Number.isFinite(current)) return null;
  return ((current - previous) / previous) * 100;
}

/** Média móvel simples. Os primeiros pontos usam a janela disponível. */
export function withMovingAverage(points, windowSize) {
  return points.map((point, index) => {
    const windowPoints = points.slice(Math.max(0, index - windowSize + 1), index + 1);
    const sum = windowPoints.reduce((total, item) => total + item.rate, 0);
    return { ...point, movingAverage: sum / windowPoints.length };
  });
}

/**
 * Média ponderada pelo tempo: cada cotação pesa pelos dias em que esteve vigente
 * (ex.: a taxa de sexta vale também para sábado e domingo).
 */
function timeWeightedAverage(points) {
  let weightedSum = 0;
  let totalWeight = 0;
  points.forEach((point, index) => {
    const next = points[index + 1];
    const weight = next ? Math.max(1, daysBetween(point.date, next.date)) : 1;
    weightedSum += point.rate * weight;
    totalWeight += weight;
  });
  return totalWeight ? weightedSum / totalWeight : null;
}

function standardDeviation(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function volatilityLabel(dailyReturnsStdDev) {
  if (dailyReturnsStdDev < 0.3) return 'Volatilidade Baixa';
  if (dailyReturnsStdDev < 0.8) return 'Volatilidade Moderada';
  return 'Volatilidade Alta';
}

function trendLabel(changePct) {
  if (changePct > 0.1) return { label: 'Tendência Alta', direction: 'up' };
  if (changePct < -0.1) return { label: 'Tendência Baixa', direction: 'down' };
  return { label: 'Tendência Estável', direction: 'flat' };
}

/** Resumo estatístico de uma série [{ date, rate }] já ordenada. */
export function summarizeSeries(points) {
  if (!points?.length) return null;

  const first = points[0];
  const last = points.at(-1);
  const previous = points.at(-2) ?? null;

  const { min, max } = points.reduce(
    (acc, point) => ({
      min: point.rate < acc.min.rate ? point : acc.min,
      max: point.rate > acc.max.rate ? point : acc.max,
    }),
    { min: first, max: first },
  );

  const dailyReturns = points.slice(1).map((point, index) => percentChange(points[index].rate, point.rate));
  const absoluteDailyMoves = points.slice(1).map((point, index) => Math.abs(point.rate - points[index].rate));
  const changePct = percentChange(first.rate, last.rate) ?? 0;

  return {
    current: last,
    dailyChangePct: previous ? percentChange(previous.rate, last.rate) : null,
    min,
    max,
    changePct,
    trend: trendLabel(changePct),
    weightedAverage: timeWeightedAverage(points),
    volatility: volatilityLabel(standardDeviation(dailyReturns)),
    averageDailyMove: absoluteDailyMoves.length
      ? absoluteDailyMoves.reduce((total, value) => total + value, 0) / absoluteDailyMoves.length
      : 0,
    observations: points.length,
  };
}

/**
 * Monta as linhas da tabela de moedas a partir da série de mercado (base EUR).
 * Cada linha traz taxa em BRL/USD, variação do último pregão e tendência recente.
 */
export function buildMarketRows({ currencies, series, localCode, globalCode, trendPoints }) {
  if (!currencies?.length || !series?.length) return [];

  const latest = series.at(-1);
  const previous = series.at(-2);
  const recent = series.slice(-trendPoints);

  return currencies.map(({ code, name }) => {
    const rateInLocal = crossRate(latest.rates, code, localCode);
    const previousInLocal = previous ? crossRate(previous.rates, code, localCode) : null;
    const trend = recent.map((entry) => crossRate(entry.rates, code, localCode)).filter((value) => value !== null);

    return {
      code,
      name,
      rateInLocal,
      rateInGlobal: crossRate(latest.rates, code, globalCode),
      change24h: code === localCode ? 0 : percentChange(previousInLocal, rateInLocal),
      trend,
      date: latest.date,
    };
  });
}

/** Cotações da faixa superior (ticker). */
export function buildTickerItems(series, pairs) {
  if (!series?.length) return [];
  const latest = series.at(-1);
  const previous = series.at(-2);

  return pairs.map(([from, to]) => {
    const rate = crossRate(latest.rates, from, to);
    const previousRate = previous ? crossRate(previous.rates, from, to) : null;
    return { id: `${from}/${to}`, from, to, rate, changePct: percentChange(previousRate, rate) };
  });
}
