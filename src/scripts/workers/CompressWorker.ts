import pako from "pako";

export type Operation = "compress" | "decompress";

export interface CompressMessage {
   id: number;
   buffer: Uint8Array;
   op: Operation;
}

onmessage = (ev: MessageEvent<CompressMessage>) => {
   switch (ev.data.op) {
      case "compress": {
         const buffer = pako.deflateRaw(ev.data.buffer);
         postMessage({ id: ev.data.id, buffer: buffer }, [buffer.buffer]);
         break;
      }
      case "decompress": {
         const buffer = pako.inflateRaw(ev.data.buffer);
         postMessage({ id: ev.data.id, buffer: buffer }, [buffer.buffer]);
         break;
      }
   }
};
