declare const IPCBridge:
   | {
        rpcCall: (method: string, ...args: any[]) => Promise<any>;
     }
   | undefined;
