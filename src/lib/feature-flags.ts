function envFlag(name: string): string {
  const raw = process.env[name];
  if (!raw) return "";
  return raw.replace(/^["']|["']$/g, "").trim().toLowerCase();
}

const INVENTORY_ON = new Set(["on", "true", "1", "yes", "enabled"]);
const INVENTORY_OFF = new Set(["off", "false", "0", "no", "disabled"]);

/** INVENTORY=on|off in .env — default: on */
export function isInventoryEnabled(): boolean {
  const value = envFlag("INVENTORY");
  if (!value) return true;
  if (INVENTORY_OFF.has(value)) return false;
  if (INVENTORY_ON.has(value)) return true;
  return true;
}
