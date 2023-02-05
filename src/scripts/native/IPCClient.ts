type Promisify<T> = T extends (...args: any[]) => Promise<any>
   ? T // already a promise
   : T extends (...args: infer A) => infer R
   ? (...args: A) => Promise<R>
   : T; // not a function;

type PromisifyMethods<T extends object> = {
   [K in keyof T]: Promisify<T[K]>;
};

export function hasIPCBridge() {
   return typeof IPCBridge !== "undefined";
}

export function IPCClient<T extends object>() {
   const request = async (method: string, params: any[]) => {
      if (typeof IPCBridge === "undefined") {
         throw new Error(`IPCBridge is not defined: ${method}(${params})`);
      }
      return IPCBridge.rpcCall(method, params);
   };
   return new Proxy(
      {},
      {
         get(target, prop, receiver) {
            if (typeof prop === "symbol") return;
            if (prop.startsWith("$")) return;
            if (prop in Object.prototype) return;
            if (prop === "toJSON") return;
            return (...args: any) => request(prop.toString(), args);
         },
      }
   ) as PromisifyMethods<T>;
}
