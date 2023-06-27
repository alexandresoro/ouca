import { type SortOrder } from "@ou-ca/common/api/common/entitiesSearchParams";
import { useState } from "react";

export default function usePaginatedTableParams<T>() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [orderBy, setOrderBy] = useState<T | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

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
}
