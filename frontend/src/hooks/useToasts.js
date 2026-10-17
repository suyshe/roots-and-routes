import { useCallback, useState } from 'react';

// Simple auto-dismissing toast notifications.
export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, kind = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return { toasts, addToast };
}
