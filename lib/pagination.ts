/**
 * Pagination helpers shared by list pages.
 *
 * Offset pagination is deliberate: queues are sorted by `updated_at`/`created_at`
 * and the UI offers numbered pages, which is what support agents expect. The cap
 * keeps a hand-edited `?page=999999` from turning into a huge OFFSET scan.
 */

export const DEFAULT_PAGE_SIZE = 20;

/** Hard ceiling on `?page=` so a crafted URL cannot scan the whole table. */
const MAX_PAGE = 1_000;

export interface PageParams {
  page: number;
  pageSize: number;
  offset: number;
}

/** Reads a 1-based page number from search params, clamped to a sane range. */
export function parsePage(
  raw: string | string[] | undefined,
  pageSize = DEFAULT_PAGE_SIZE,
): PageParams {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "1", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, MAX_PAGE) : 1;
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function makePage<T>(
  items: T[],
  total: number,
  { page, pageSize }: PageParams,
): Page<T> {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };
}
