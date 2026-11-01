import { useEffect, useState } from 'react';
import { isAbortError } from '../services/frankfurterApi';

const IDLE_STATE = { status: 'idle', data: null, error: null };

/**
 * Hook base usado pelos hooks de dados. Executa `loader(signal)` sempre que
 * `deps` mudam, cancela a requisição anterior (AbortController) e mantém os
 * últimos dados válidos enquanto uma nova requisição está em andamento.
 *
 * status: 'idle' | 'loading' | 'success' | 'error'
 */
export function useApiResource(loader, deps, { enabled = true } = {}) {
  const [state, setState] = useState(enabled ? { ...IDLE_STATE, status: 'loading' } : IDLE_STATE);

  useEffect(() => {
    if (!enabled) {
      setState(IDLE_STATE);
      return undefined;
    }

    const controller = new AbortController();
    setState((previous) => ({ ...previous, status: 'loading', error: null }));

    loader(controller.signal)
      .then((data) => setState({ status: 'success', data, error: null }))
      .catch((error) => {
        if (isAbortError(error)) return;
        setState((previous) => ({ status: 'error', data: previous.data, error }));
      });

    return () => controller.abort();
    // `loader` é recriado a cada render; as dependências reais são explícitas em `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return state;
}
