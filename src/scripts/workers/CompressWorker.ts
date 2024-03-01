import { Foras, Memory, deflate, inflate } from "@hazae41/foras";
export type Operation = "compress" | "decompress";

export interface CompressMessage {
   id: number;
   buffer: Uint8Array;
   op: Operation;
}

onmessage = async (ev: MessageEvent<CompressMessage>) => {
   console.time(`CompressWorker: ${ev.data.op}`);
   await Foras.initBundledOnce();
   switch (ev.data.op) {
      case "compress": {
         const buffer = deflate(new Memory(ev.data.buffer)).copyAndDispose();
         postMessage({ id: ev.data.id, buffer: buffer }, [buffer.buffer]);
         break;
      }
      case "decompress": {
         const buffer = inflate(new Memory(ev.data.buffer)).copyAndDispose();
         postMessage({ id: ev.data.id, buffer: buffer }, [buffer.buffer]);
         break;
      }
   }
   console.timeEnd(`CompressWorker: ${ev.data.op}`);
};
