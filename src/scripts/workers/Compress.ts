import type { CompressMessage, Operation } from "./CompressWorker";

const worker = new Worker(new URL("CompressWorker.ts", import.meta.url), {
   type: "module",
});

interface IExecutor {
   resolve: (data: Uint8Array) => void;
   reject: (error?: any) => void;
}

const pending: Record<number, IExecutor> = {};

let uniqueId = 0;

export function compress(data: Uint8Array): Promise<Uint8Array> {
   return processBuffer(data, "compress");
}

export function decompress(data: Uint8Array): Promise<Uint8Array> {
   return processBuffer(data, "decompress");
}

function processBuffer(data: Uint8Array, op: Operation): Promise<Uint8Array> {
   const id = ++uniqueId;
   return new Promise<Uint8Array>((resolve, reject) => {
      pending[id] = { resolve, reject };
      worker.postMessage({ id, buffer: data, op } as CompressMessage, [data.buffer]);
      setTimeout(() => {
         if (pending[id]) {
            pending[id].reject(new Error("Timeout"));
            delete pending[id];
         }
      }, 5000);
   });
}

worker.onmessage = (ev) => {
   if (pending[ev.data.id]) {
      pending[ev.data.id].resolve(ev.data.buffer);
      delete pending[ev.data.id];
   }
};
