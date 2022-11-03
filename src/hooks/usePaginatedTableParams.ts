import { useState } from "react";
import { SortOrder } from "../gql/graphql";

export default function usePaginatedTableParams<T>() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
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
    setSortOrder
  };
}
