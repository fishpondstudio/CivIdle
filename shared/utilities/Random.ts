export function sfc32(a: number, b: number, c: number, d: number) {
   return () => {
      a |= 0;
      b |= 0;
      c |= 0;
      d |= 0;

      const t = (((a + b) | 0) + d) | 0;
      d = (d + 1) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
   };
}

export function xmur3(str: string) {
   let i: number;
   let h: number;
   for (i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
      // biome-ignore lint/style/noCommaOperator:
      (h = Math.imul(h ^ str.charCodeAt(i), 3432918353)), (h = (h << 13) | (h >>> 19));
   return () => {
      // biome-ignore lint/style/noCommaOperator:
      (h = Math.imul(h ^ (h >>> 16), 2246822507)), (h = Math.imul(h ^ (h >>> 13), 3266489909));
      // biome-ignore lint/suspicious/noAssignInExpressions:
      return (h ^= h >>> 16) >>> 0;
   };
}

export function srand(s: string): () => number {
   const seed = xmur3(s);
   return sfc32(seed(), seed(), seed(), seed());
}
