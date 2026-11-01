import { useMemo } from 'react';
import { MOVING_AVERAGE_WINDOW } from '../constants';
import { fetchTimeSeries } from '../services/frankfurterApi';
import { subtractDays, toIsoDate } from '../utils/dates';
import { summarizeSeries, withMovingAverage } from '../utils/rates';
import { useApiResource } from './useApiResource';

/** Série histórica do par selecionado + média móvel e resumo do período. */
export function useHistoricalRates(from, to, periodDays, refreshKey) {
  const enabled = Boolean(from && to && from !== to);

  const range = useMemo(() => {
    const end = new Date();
    return { start: toIsoDate(subtractDays(end, periodDays)), end: toIsoDate(end) };
    // refreshKey recalcula o intervalo caso a página fique aberta de um dia para o outro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodDays, refreshKey]);

  const { status, data, error } = useApiResource(
    (signal) => fetchTimeSeries({ start: range.start, base: from, symbols: [to], signal }),
    [from, to, range.start, refreshKey],
    { enabled },
  );

  const points = useMemo(() => {
    if (!data?.series || data.base !== from) return [];
    const raw = data.series
      .map(({ date, rates }) => ({ date, rate: rates[to] }))
      .filter((point) => Number.isFinite(point.rate));
    return withMovingAverage(raw, MOVING_AVERAGE_WINDOW);
  }, [data, from, to]);

  const summary = useMemo(() => summarizeSeries(points), [points]);

  return { points, summary, range, status, error };
}
