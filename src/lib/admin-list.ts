import type { PaginatedResult } from "@/lib/pagination";

export function isPaginatedResponse<T>(
  data: unknown
): data is PaginatedResult<T> {
  return (
    typeof data === "object" &&
    data !== null &&
    "items" in data &&
    Array.isArray((data as PaginatedResult<T>).items)
  );
}

export function unwrapList<T>(data: unknown): T[] {
  if (isPaginatedResponse<T>(data)) return data.items;
  if (Array.isArray(data)) return data as T[];
  return [];
}
