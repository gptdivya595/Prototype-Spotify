import { createHash } from "node:crypto";

export function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function overlapScore(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) return 0;
  const wanted = new Set(left);
  return right.filter((value) => wanted.has(value)).length / Math.max(wanted.size, 1);
}

export function stableFraction(seed: string, value: string): number {
  return createHash("sha256").update(`${seed}:${value}`).digest().readUInt32BE(0) / 0xffffffff;
}

export function artistId(artist: string) {
  return artist
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
