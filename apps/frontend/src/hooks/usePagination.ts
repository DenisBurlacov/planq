import { useState } from 'react';

export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const reset = () => setPage(1);
  return { page, setPage, reset };
}
