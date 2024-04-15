import { Color, type ColorSource } from "pixi.js";

const _cache = new Map<ColorSource, Color>();

export function getColorCached(color: ColorSource): Color {
   const cached = _cache.get(color);
   if (cached) return cached;
   const result = new Color(color);
   _cache.set(color, result);
   return result;
}
