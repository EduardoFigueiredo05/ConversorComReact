import { useCallback, useEffect, useRef, useState } from 'react';

/** Feedback temporário (ex.: sucesso/erro da exportação CSV). */
export function useToast(durationMs = 3500) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);

  const showToast = useCallback(
    (message, tone = 'success') => {
      clearTimeout(timeoutRef.current);
      setToast({ id: Date.now(), message, tone });
      timeoutRef.current = setTimeout(() => setToast(null), durationMs);
    },
    [durationMs],
  );

  const dismissToast = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setToast(null);
  }, []);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return { toast, showToast, dismissToast };
}
