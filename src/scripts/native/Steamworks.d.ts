declare const IPCBridge:
   | {
        rpcCall: (method: string, ...args: any[]) => Promise<any>;
        onClose: (callback: () => void) => void;
     }
   | undefined;
