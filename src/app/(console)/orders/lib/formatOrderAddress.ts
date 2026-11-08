import type { OrderAddressSnapshot } from "../types";
import { strings } from "../strings";

export function formatOrderAddress(
  snapshot: OrderAddressSnapshot | null | undefined,
): string[] {
  if (!snapshot || typeof snapshot !== "object") {
    return [];
  }
  const lines: string[] = [];
  const name = [snapshot.firstName, snapshot.lastName]
    .filter(Boolean)
    .join(" ");
  if (name) lines.push(name);
  if (snapshot.phone) lines.push(snapshot.phone);
  if (snapshot.line1) lines.push(snapshot.line1);
  if (snapshot.line2) lines.push(snapshot.line2);
  const cityLine = [snapshot.city, snapshot.state, snapshot.postalCode]
    .filter(Boolean)
    .join(", ");
  if (cityLine) lines.push(cityLine);
  if (snapshot.country) lines.push(snapshot.country);
  if (snapshot.label) lines.push(snapshot.label);
  return lines;
}

export function formatAddressBlock(
  snapshot: OrderAddressSnapshot | null | undefined,
): string {
  const lines = formatOrderAddress(snapshot);
  return lines.length > 0
    ? lines.join("\n")
    : strings.detail.addressNotProvided;
}
