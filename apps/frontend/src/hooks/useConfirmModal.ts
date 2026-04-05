import { useState } from 'react';

export function useConfirmModal<T>() {
  const [target, setTarget] = useState<T | null>(null);
  return { target, isOpen: !!target, open: setTarget, close: () => setTarget(null) };
}
