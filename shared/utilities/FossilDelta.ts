// Fossil SCM delta compression algorithm
// ======================================
//
// Format:
// http://www.fossil-scm.org/index.html/doc/tip/www/delta_format.wiki
//
// Algorithm:
// http://www.fossil-scm.org/index.html/doc/tip/www/delta_encoder_algorithm.wiki
//
// Original implementation:
// http://www.fossil-scm.org/index.html/artifact/d1b0598adcd650b3551f63b17dfc864e73775c3d
//
// LICENSE
// -------
//
// Copyright 2014 Dmitry Chestnykh (JavaScript port)
// Copyright 2007 D. Richard Hipp  (original C version)
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or
// without modification, are permitted provided that the
// following conditions are met:
//
//   1. Redistributions of source code must retain the above
//      copyright notice, this list of conditions and the
//      following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above
//      copyright notice, this list of conditions and the
//      following disclaimer in the documentation and/or other
//      materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHORS ``AS IS'' AND ANY EXPRESS
// OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHORS OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
// BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
// EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation
// are those of the authors and contributors and should not be interpreted
// as representing official policies, either expressed or implied, of anybody
// else.
//

// Hash window width in bytes. Must be a power of two.
const NHASH = 16;
const zDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~"
   .split("")
   .map((x) => x.charCodeAt(0));
const zValue = [
   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7,
   8, 9, -1, -1, -1, -1, -1, -1, -1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
   28, 29, 30, 31, 32, 33, 34, 35, -1, -1, -1, -1, 36, -1, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
   50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, -1, -1, -1, 63, -1,
];

class RollingHash {
   constructor(private a = 0, private b = 0, private i = 0, private z = new Array(NHASH)) {}

   init(z: Uint8Array, pos: number) {
      let a = 0;
      let b = 0;
      let i;
      let x;
      for (i = 0; i < NHASH; i++) {
         x = z[pos + i];
         a = (a + x) & 0xffff;
         b = (b + (NHASH - i) * x) & 0xffff;
         this.z[i] = x;
      }
      this.a = a & 0xffff;
      this.b = b & 0xffff;
      this.i = 0;
   }

   next(c: number) {
      const old = this.z[this.i];
      this.z[this.i] = c;
      this.i = (this.i + 1) & (NHASH - 1);
      this.a = (this.a - old + c) & 0xffff;
      this.b = (this.b - NHASH * old + this.a) & 0xffff;
   }

   value() {
      return ((this.a & 0xffff) | ((this.b & 0xffff) << 16)) >>> 0;
   }
}

class Reader {
   constructor(public a: Uint8Array, public pos = 0) {}
   haveBytes() {
      return this.pos < this.a.length;
   }
   getByte() {
      const b = this.a[this.pos];
      this.pos++;
      if (this.pos > this.a.length) throw new RangeError("out of bounds");
      return b;
   }
   getChar() {
      return String.fromCharCode(this.getByte());
   }
   getInt() {
      let v = 0;
      let c;
      // biome-ignore lint/suspicious/noAssignInExpressions:
      while (this.haveBytes() && (c = zValue[0x7f & this.getByte()]) >= 0) {
         v = (v << 6) + c;
      }
      this.pos--;
      return v >>> 0;
   }
}

class Writer {
   constructor(private a: number[] = []) {}
   toArray() {
      return new Uint8Array(this.a);
   }
   putByte(b: number) {
      this.a.push(b & 0xff);
   }
   putChar(s: string) {
      this.putByte(s.charCodeAt(0));
   }
   putInt(v: number) {
      let i;
      let j;
      const zBuf = [];
      if (v === 0) {
         this.putChar("0");
         return;
      }
      // biome-ignore lint/style/noParameterAssign:
      for (i = 0; v > 0; i++, v >>>= 6) zBuf.push(zDigits[v & 0x3f]);
      for (j = i - 1; j >= 0; j--) this.putByte(zBuf[j]);
   }
   putArray(a: Uint8Array, start: number, end: number) {
      for (let i = start; i < end; i++) this.a.push(a[i]);
   }
}

// Return the number digits in the base64 representation of a positive integer.
function digitCount(v: number) {
   let i;
   let x;
   for (i = 1, x = 64; v >= x; i++, x <<= 6) {
      /* nothing */
   }
   return i;
}

// Return a 32-bit checksum of the array.
function checksum(arr: Uint8Array) {
   let sum0 = 0;
   let sum1 = 0;
   let sum2 = 0;
   let sum3 = 0;
   let z = 0;
   let N = arr.length;
   //TODO measure if this unrolling is helpful.
   while (N >= 16) {
      sum0 = (sum0 + arr[z + 0]) | 0;
      sum1 = (sum1 + arr[z + 1]) | 0;
      sum2 = (sum2 + arr[z + 2]) | 0;
      sum3 = (sum3 + arr[z + 3]) | 0;

      sum0 = (sum0 + arr[z + 4]) | 0;
      sum1 = (sum1 + arr[z + 5]) | 0;
      sum2 = (sum2 + arr[z + 6]) | 0;
      sum3 = (sum3 + arr[z + 7]) | 0;

      sum0 = (sum0 + arr[z + 8]) | 0;
      sum1 = (sum1 + arr[z + 9]) | 0;
      sum2 = (sum2 + arr[z + 10]) | 0;
      sum3 = (sum3 + arr[z + 11]) | 0;

      sum0 = (sum0 + arr[z + 12]) | 0;
      sum1 = (sum1 + arr[z + 13]) | 0;
      sum2 = (sum2 + arr[z + 14]) | 0;
      sum3 = (sum3 + arr[z + 15]) | 0;

      z += 16;
      N -= 16;
   }
   while (N >= 4) {
      sum0 = (sum0 + arr[z + 0]) | 0;
      sum1 = (sum1 + arr[z + 1]) | 0;
      sum2 = (sum2 + arr[z + 2]) | 0;
      sum3 = (sum3 + arr[z + 3]) | 0;
      z += 4;
      N -= 4;
   }
   sum3 = (((((sum3 + (sum2 << 8)) | 0) + (sum1 << 16)) | 0) + (sum0 << 24)) | 0;
   switch (N) {
      // biome-ignore lint/suspicious/noFallthroughSwitchClause:
      case 3:
         sum3 = (sum3 + (arr[z + 2] << 8)) | 0; /* falls through */
      // biome-ignore lint/suspicious/noFallthroughSwitchClause:
      case 2:
         sum3 = (sum3 + (arr[z + 1] << 16)) | 0; /* falls through */
      case 1:
         sum3 = (sum3 + (arr[z + 0] << 24)) | 0; /* falls through */
   }
   return sum3 >>> 0;
}

export function fossilDeltaCreate(src: Uint8Array, out: Uint8Array): Uint8Array {
   const zDelta = new Writer();
   const lenOut = out.length;
   const lenSrc = src.length;
   let i;
   let lastRead = -1;

   zDelta.putInt(lenOut);
   zDelta.putChar("\n");

   // If the source is very small, it means that we have no
   // chance of ever doing a copy command.  Just output a single
   // literal segment for the entire target and exit.
   if (lenSrc <= NHASH) {
      zDelta.putInt(lenOut);
      zDelta.putChar(":");
      zDelta.putArray(out, 0, lenOut);
      zDelta.putInt(checksum(out));
      zDelta.putChar(";");
      return zDelta.toArray();
   }

   // Compute the hash table used to locate matching sections in the source.
   const nHash = Math.ceil(lenSrc / NHASH);
   const collide = new Array(nHash);
   const landmark = new Array(nHash);
   for (i = 0; i < collide.length; i++) collide[i] = -1;
   for (i = 0; i < landmark.length; i++) landmark[i] = -1;
   let hv;
   const h = new RollingHash();
   for (i = 0; i < lenSrc - NHASH; i += NHASH) {
      h.init(src, i);
      hv = h.value() % nHash;
      collide[i / NHASH] = landmark[hv];
      landmark[hv] = i / NHASH;
   }

   let base = 0;
   let iSrc;
   let iBlock;
   let bestCnt;
   let bestOfst;
   let bestLitsz;
   while (base + NHASH < lenOut) {
      bestOfst = 0;
      bestLitsz = 0;
      h.init(out, base);
      i = 0; // Trying to match a landmark against zOut[base+i]
      bestCnt = 0;
      while (true) {
         let limit = 250;
         hv = h.value() % nHash;
         iBlock = landmark[hv];
         while (iBlock >= 0 && limit-- > 0) {
            //
            // The hash window has identified a potential match against
            // landmark block iBlock.  But we need to investigate further.
            //
            // Look for a region in zOut that matches zSrc. Anchor the search
            // at zSrc[iSrc] and zOut[base+i].  Do not include anything prior to
            // zOut[base] or after zOut[outLen] nor anything after zSrc[srcLen].
            //
            // Set cnt equal to the length of the match and set ofst so that
            // zSrc[ofst] is the first element of the match.  litsz is the number
            // of characters between zOut[base] and the beginning of the match.
            // sz will be the overhead (in bytes) needed to encode the copy
            // command.  Only generate copy command if the overhead of the
            // copy command is less than the amount of literal text to be copied.
            //
            let j;
            let k;
            let x;
            let y;

            // Beginning at iSrc, match forwards as far as we can.
            // j counts the number of characters that match.
            iSrc = iBlock * NHASH;
            for (j = 0, x = iSrc, y = base + i; x < lenSrc && y < lenOut; j++, x++, y++) {
               if (src[x] !== out[y]) break;
            }
            j--;

            // Beginning at iSrc-1, match backwards as far as we can.
            // k counts the number of characters that match.
            for (k = 1; k < iSrc && k <= i; k++) {
               if (src[iSrc - k] !== out[base + i - k]) break;
            }
            k--;

            // Compute the offset and size of the matching region.
            const ofst = iSrc - k;
            const cnt = j + k + 1;
            const litsz = i - k; // Number of bytes of literal text before the copy
            // sz will hold the number of bytes needed to encode the "insert"
            // command and the copy command, not counting the "insert" text.
            const sz = digitCount(i - k) + digitCount(cnt) + digitCount(ofst) + 3;
            if (cnt >= sz && cnt > bestCnt) {
               // Remember this match only if it is the best so far and it
               // does not increase the file size.
               bestCnt = cnt;
               bestOfst = iSrc - k;
               bestLitsz = litsz;
            }

            // Check the next matching block
            iBlock = collide[iBlock];
         }

         // We have a copy command that does not cause the delta to be larger
         // than a literal insert.  So add the copy command to the delta.
         if (bestCnt > 0) {
            if (bestLitsz > 0) {
               // Add an insert command before the copy.
               zDelta.putInt(bestLitsz);
               zDelta.putChar(":");
               zDelta.putArray(out, base, base + bestLitsz);
               base += bestLitsz;
            }
            base += bestCnt;
            zDelta.putInt(bestCnt);
            zDelta.putChar("@");
            zDelta.putInt(bestOfst);
            zDelta.putChar(",");
            if (bestOfst + bestCnt - 1 > lastRead) {
               lastRead = bestOfst + bestCnt - 1;
            }
            bestCnt = 0;
            break;
         }

         // If we reach this point, it means no match is found so far
         if (base + i + NHASH >= lenOut) {
            // We have reached the end and have not found any
            // matches.  Do an "insert" for everything that does not match
            zDelta.putInt(lenOut - base);
            zDelta.putChar(":");
            zDelta.putArray(out, base, base + lenOut - base);
            base = lenOut;
            break;
         }

         // Advance the hash by one character. Keep looking for a match.
         h.next(out[base + i + NHASH]);
         i++;
      }
   }
   // Output a final "insert" record to get all the text at the end of
   // the file that does not match anything in the source.
   if (base < lenOut) {
      zDelta.putInt(lenOut - base);
      zDelta.putChar(":");
      zDelta.putArray(out, base, base + lenOut - base);
   }
   // Output the final checksum record.
   zDelta.putInt(checksum(out));
   zDelta.putChar(";");
   return zDelta.toArray();
}

export function fossilDeltaOutputSize(delta: Uint8Array): number {
   const zDelta = new Reader(delta);
   const size = zDelta.getInt();
   if (zDelta.getChar() !== "\n") throw new Error("size integer not terminated by '\\n'");
   return size;
}

export function fossilDeltaApply(
   src: Uint8Array,
   delta: Uint8Array,
   opts: { verifyChecksum: boolean },
): Uint8Array {
   let total = 0;
   const zDelta = new Reader(delta);
   const lenSrc = src.length;
   const lenDelta = delta.length;
   const limit = zDelta.getInt();
   if (zDelta.getChar() !== "\n") throw new Error("size integer not terminated by '\\n'");
   const zOut = new Writer();
   while (zDelta.haveBytes()) {
      let ofst;
      const cnt = zDelta.getInt();
      switch (zDelta.getChar()) {
         case "@": {
            ofst = zDelta.getInt();
            if (zDelta.haveBytes() && zDelta.getChar() !== ",")
               throw new Error("copy command not terminated by ','");
            total += cnt;
            if (total > limit) throw new Error("copy exceeds output file size");
            if (ofst + cnt > lenSrc) throw new Error("copy extends past end of input");
            zOut.putArray(src, ofst, ofst + cnt);
            break;
         }
         case ":": {
            total += cnt;
            if (total > limit) throw new Error("insert command gives an output larger than predicted");
            if (cnt > lenDelta) throw new Error("insert count exceeds size of delta");
            zOut.putArray(zDelta.a, zDelta.pos, zDelta.pos + cnt);
            zDelta.pos += cnt;
            break;
         }
         case ";": {
            const out = zOut.toArray();
            if ((!opts || opts.verifyChecksum !== false) && cnt !== checksum(out))
               throw new Error("bad checksum");
            if (total !== limit) throw new Error("generated size does not match predicted size");
            return out;
         }
         default: {
            throw new Error("unknown delta operator");
         }
      }
   }
   throw new Error("unterminated delta");
}
