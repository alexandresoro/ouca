const SORT_ORDER = ["asc", "desc", null] as const;

/**
 * @deprecated
 */
export type SortOrder = (typeof SORT_ORDER)[number];
