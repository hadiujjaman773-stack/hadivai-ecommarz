const BD_MOBILE_RE = /^01[3-9]\d{8}$/;
const FAKE_PATTERNS = new Set([
  "01234567890",
  "09876543210",
  "01000000000",
  "01999999999",
]);

export function normalizeBdPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length >= 13) {
    digits = `0${digits.slice(3, 13)}`;
  } else if (digits.length === 10 && digits.startsWith("1")) {
    digits = `0${digits}`;
  }
  return digits.slice(0, 11);
}

export function isValidBdMobile(raw: string): boolean {
  const phone = normalizeBdPhone(raw);
  if (!BD_MOBILE_RE.test(phone)) return false;
  if (/^(\d)\1{10}$/.test(phone)) return false;
  if (FAKE_PATTERNS.has(phone)) return false;
  return true;
}
