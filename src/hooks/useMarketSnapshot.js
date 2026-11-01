import { useMemo } from 'react';
import { MARKET_LOOKBACK_DAYS } from '../constants';
import { fetchTimeSeries } from '../services/frankfurterApi';
import { subtractDays, toIsoDate } from '../utils/dates';
import { useApiResource } from './useApiResource';

/**
 * Uma única requisição (base EUR, todas as moedas, últimos ~14 dias) alimenta
 * o ticker do topo e a tabela: taxa atual, variação do último pregão e tendência 7D
 * são calculadas por taxa cruzada, sem uma chamada por moeda.
 */
export function useMarketSnapshot(refreshKey) {
  const start = useMemo(
    () => toIsoDate(subtractDays(new Date(), MARKET_LOOKBACK_DAYS)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey],
  );

  const { status, data, error } = useApiResource(
    (signal) => fetchTimeSeries({ start, base: 'EUR', signal }),
    [start, refreshKey],
  );

  const series = data?.series ?? [];

  return {
    series,
    latestDate: series.at(-1)?.date ?? null,
    meta: data?.meta ?? null,
    status,
    error,
  };
}
