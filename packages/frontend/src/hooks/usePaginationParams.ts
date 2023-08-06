import { type SortOrder } from "@ou-ca/common/api/common/entitiesSearchParams";
import { useState } from "react";

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
