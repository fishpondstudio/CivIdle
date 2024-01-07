import pako from "pako";
import { type CompressMessage } from "./Compress";

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
