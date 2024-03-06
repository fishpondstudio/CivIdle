import { deflateSync, inflateSync } from "fflate";
export type Operation = "compress" | "decompress";

export interface CompressMessage {
   id: number;
   buffer: Uint8Array;
   op: Operation;
}

onmessage = async (ev: MessageEvent<CompressMessage>) => {
   switch (ev.data.op) {
      case "compress": {
         const buffer = deflateSync(ev.data.buffer);
         postMessage({ id: ev.data.id, buffer: buffer }, [buffer.buffer]);
         break;
      }
      case "decompress": {
         const buffer = inflateSync(ev.data.buffer);
         postMessage({ id: ev.data.id, buffer: buffer }, [buffer.buffer]);
         break;
      }
   }
};
