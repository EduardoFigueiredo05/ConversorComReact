import { fetchLatestRate } from '../services/frankfurterApi';
import { useApiResource } from './useApiResource';

/**
 * Taxa atual entre duas moedas. Refaz a requisição quando o par muda
 * ou quando `requestKey` muda (botão "Converter Agora" / "Atualizar taxas").
 * Não chama a API se o par for inválido.
 */
export function useExchangeRate(from, to, requestKey) {
  const enabled = Boolean(from && to && from !== to);
  const { status, data, error } = useApiResource(
    (signal) => fetchLatestRate({ from, to, signal }),
    [from, to, requestKey],
    { enabled },
  );

  // Descarta dados de um par anterior que ainda estejam em memória.
  const isCurrentPair = Boolean(data && data.base === from && data.quote === to);

  return {
    rate: isCurrentPair ? data.rate : null,
    date: isCurrentPair ? data.date : null,
    meta: data?.meta ?? null,
    status,
    error,
  };
}
