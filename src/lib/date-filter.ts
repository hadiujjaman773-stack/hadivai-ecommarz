const DHAKA_OFFSET = "+06:00";

function parseDhakaDayStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00${DHAKA_OFFSET}`);
}

function parseDhakaDayEndExclusive(dateStr: string): Date {
  const start = parseDhakaDayStart(dateStr);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export function getDhakaTodayString(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getOrderDateRange(options: {
  today?: boolean;
  date?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}): { gte: Date; lt: Date } | null {
  if (options.today) {
    const day = getDhakaTodayString();
    return { gte: parseDhakaDayStart(day), lt: parseDhakaDayEndExclusive(day) };
  }

  if (options.date) {
    return {
      gte: parseDhakaDayStart(options.date),
      lt: parseDhakaDayEndExclusive(options.date),
    };
  }

  const from = options.dateFrom?.trim();
  const to = options.dateTo?.trim();
  if (!from && !to) return null;

  const startDay = from || to!;
  const endDay = to || from!;

  return {
    gte: parseDhakaDayStart(startDay),
    lt: parseDhakaDayEndExclusive(endDay),
  };
}
