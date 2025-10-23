export interface PaginationMeta {
  total_items?: number;
  total_pages?: number;
  current_page?: number;
  limit: number;
  in_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  next_cursor?: string;
  previous_cursor?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export function buildPaginatedResponse<T>(
  data: T[],
  limit: number,
  cursor?: string,
  hasNextPage: boolean = false
): PaginatedResponse<T> {
  const inPage = data.length;
  const hasPreviousPage = !!cursor;

  return {
    success: true,
    data,
    meta: {
      limit,
      in_page: inPage,
      has_next_page: hasNextPage,
      has_previous_page: hasPreviousPage,
      next_cursor:
        hasNextPage && inPage > 0
          ? (data[inPage - 1] as { id?: string; _id?: string }).id ||
            (data[inPage - 1] as { id?: string; _id?: string })._id
          : undefined,
    },
  };
}

export function getCursorPaginationParams(query: Record<string, unknown>) {
  const limit = Math.min(parseInt(query.limit as string) || 20, 100);
  const cursor = query.cursor as string;

  return { limit, cursor };
}
