import { useEffect, useState } from 'react';

/** Atrasa a propagação de um valor (ex.: busca digitada) até o usuário parar de digitar. */
export function useDebounce(value, delayMs = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}
