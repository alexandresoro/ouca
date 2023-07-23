import { type SortOrder } from "@ou-ca/common/api/common/entitiesSearchParams";
import { useState } from "react";

/**
 * @deprecated use usePaginatedTableParams instead
 */
export const usePaginatedTableParams_legacy = <T>() => {
  const { query, setQuery, orderBy, setOrderBy, sortOrder, setSortOrder } = usePaginationParams<T>();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  return {
    query,
    setQuery,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    orderBy,
    setOrderBy,
    sortOrder,
    setSortOrder,
  };
};

const usePaginationParams = <T>() => {
  const [query, setQuery] = useState("");
  const [orderBy, setOrderBy] = useState<T | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  return {
    query,
    setQuery,
    orderBy,
    setOrderBy,
    sortOrder,
    setSortOrder,
  };
};

export default usePaginationParams;
