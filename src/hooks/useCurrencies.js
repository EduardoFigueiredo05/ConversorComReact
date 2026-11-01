import { useMemo } from 'react';
import { fetchCurrencies } from '../services/frankfurterApi';
import { getCurrencyName } from '../utils/formatters';
import { useApiResource } from './useApiResource';

/** Carrega as moedas suportadas e as converte em [{ code, name, apiName }] ordenado por código. */
export function useCurrencies(refreshKey) {
  const { status, data, error } = useApiResource((signal) => fetchCurrencies({ signal }), [refreshKey]);

  const currencies = useMemo(() => {
    if (!data?.currencies) return [];
    return Object.entries(data.currencies)
      .map(([code, apiName]) => ({ code, apiName, name: getCurrencyName(code, apiName) }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [data]);

  const currencyByCode = useMemo(
    () => Object.fromEntries(currencies.map((currency) => [currency.code, currency])),
    [currencies],
  );

  return { currencies, currencyByCode, status, error };
}
