export const PRODUCT_UNITS = [
  { value: "piece", label: "পিস", labelEn: "Piece" },
  { value: "kg", label: "কেজি", labelEn: "Kg" },
  { value: "gram", label: "গ্রাম", labelEn: "Gram" },
  { value: "mg", label: "মিলিগ্রাম", labelEn: "Mg" },
  { value: "liter", label: "লিটার", labelEn: "Liter" },
  { value: "ml", label: "মিলিলিটার", labelEn: "Ml" },
  { value: "packet", label: "প্যাকেট", labelEn: "Packet" },
  { value: "box", label: "বক্স", labelEn: "Box" },
  { value: "inch", label: "ইঞ্চি", labelEn: "Inch" },
] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number]["value"];

export const DEFAULT_PRODUCT_UNIT: ProductUnit = "piece";

export function getUnitLabel(unit?: string | null): string {
  const found = PRODUCT_UNITS.find((u) => u.value === unit);
  return found?.label ?? "পিস";
}

export function isValidProductUnit(unit: string): unit is ProductUnit {
  return PRODUCT_UNITS.some((u) => u.value === unit);
}
