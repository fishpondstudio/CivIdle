import koffi from "koffi";
import {
   CallbackId,
   CallbackIdToStruct,
   CallbackStructToId,
   EResult,
   ICallback_GetAuthSessionTicketResponse_t,
   ICallback_SteamAPICallCompleted_t,
   KoffiFunc,
   SteamAPI_ISteamApps,
   SteamAPI_ISteamApps_GetDLCCount,
   SteamAPI_ISteamRemoteStorage,
   SteamAPI_ISteamRemoteStorage_FileRead,
   SteamAPI_ISteamRemoteStorage_FileWrite,
   SteamAPI_ISteamRemoteStorage_GetFileSize,
   SteamAPI_ISteamUser,
   SteamAPI_ISteamUser_GetAuthSessionTicket,
   SteamAPI_ISteamUser_GetSteamID,
   SteamAPI_ISteamUtils,
   SteamAPI_ISteamUtils_GetAppID,
   SteamAPI_ISteamUtils_IsSteamRunningOnSteamDeck,
   SteamLib,
} from "./Steamworks.Generated";

koffi.struct("CallbackMsg_t", {
   m_hSteamUser: "HSteamUser",
   m_iCallback: "int",
   m_pubParam: "uint8*",
   m_cubParam: "int",
});

interface ICallback_CallbackMsg_t {
   m_hSteamUser: number;
   m_iCallback: number;
   m_pubParam: object;
   m_cubParam: number;
}

const SteamAPI_Init: KoffiFunc<() => boolean> = SteamLib.cdecl("bool SteamAPI_Init()");
const SteamAPI_Shutdown: KoffiFunc<() => void> = SteamLib.cdecl("void SteamAPI_Shutdown()");

const SteamAPI_GetHSteamPipe: KoffiFunc<() => number> = SteamLib.cdecl("HSteamPipe SteamAPI_GetHSteamPipe()");
const SteamAPI_ManualDispatch_Init: KoffiFunc<() => void> = SteamLib.cdecl("void SteamAPI_ManualDispatch_Init()");
const SteamAPI_ManualDispatch_RunFrame: KoffiFunc<(hSteamPipe: number) => void> = SteamLib.cdecl(
   "void SteamAPI_ManualDispatch_RunFrame(HSteamPipe hSteamPipe)"
);
const SteamAPI_ManualDispatch_GetNextCallback: KoffiFunc<(hSteamPipe: number, pCallbackMsg: object) => boolean> =
   SteamLib.cdecl(
      "bool SteamAPI_ManualDispatch_GetNextCallback(HSteamPipe hSteamPipe, _Out_ CallbackMsg_t *pCallbackMsg)"
   );
const SteamAPI_ManualDispatch_FreeLastCallback: KoffiFunc<(hSteamPipe: number) => void> = SteamLib.cdecl(
   "void SteamAPI_ManualDispatch_FreeLastCallback(HSteamPipe hSteamPipe)"
);

const SteamAPI_ManualDispatch_GetAPICallResult: KoffiFunc<
   (
      hSteamPipe: number,
      hSteamAPICall: number,
      pCallback: Buffer,
      cubCallback: number,
      iCallbackExpected: number,
      pbFailed: [boolean]
   ) => boolean
> = SteamLib.cdecl(
   "bool SteamAPI_ManualDispatch_GetAPICallResult(HSteamPipe hSteamPipe, SteamAPICall_t hSteamAPICall, _Out_ void * pCallback, int cubCallback, int iCallbackExpected, _Out_ bool *pbFailed)"
);

const fileReadPromises: Record<string, Promise<string>> = {};
const fileWritePromises: Record<string, Promise<boolean>> = {};

export class SteamAPI {
   private callResults: Record<number, (err: Error | null, b: Buffer) => void> = {};
   private callbacks: Record<number, (result: any) => void> = {};
   constructor() {
      if (!SteamAPI_Init()) {
         throw new Error("Steamworks SDK fails to initialize. Is Steam running? Are you launching the game via Steam?");
      }

      console.log(`Steamworks Initialized for App: ${this.getAppID()}`);

      SteamAPI_ManualDispatch_Init();
      setInterval(this.dispatchCallbacks.bind(this), 100);
   }

   dispatchCallbacks() {
      const pipe = SteamAPI_GetHSteamPipe();
      SteamAPI_ManualDispatch_RunFrame(pipe);
      const callback_ = {};
      while (SteamAPI_ManualDispatch_GetNextCallback(pipe, callback_)) {
         this.handleCallback(callback_ as ICallback_CallbackMsg_t, pipe);
         SteamAPI_ManualDispatch_FreeLastCallback(pipe);
      }
   }

   private handleCallback(callback: ICallback_CallbackMsg_t, pipe: number) {
      if (callback.m_iCallback === CallbackStructToId.SteamAPICallCompleted_t) {
         const callResult = koffi.decode(
            callback.m_pubParam,
            0,
            "SteamAPICallCompleted_t"
            // callback.m_cubParam
         ) as ICallback_SteamAPICallCompleted_t;
         const data = Buffer.allocUnsafe(callResult.m_cubParam);
         const fail = [false] as [boolean];
         if (
            SteamAPI_ManualDispatch_GetAPICallResult(
               pipe,
               callResult.m_hAsyncCall,
               data,
               callResult.m_cubParam,
               callResult.m_iCallback,
               fail
            )
         ) {
            if (this.callResults[callResult.m_hAsyncCall]) {
               this.callResults[callResult.m_hAsyncCall](
                  fail[0] ? new Error("SteamAPI_ManualDispatch_GetAPICallResult failed") : null,
                  data
               );
               delete this.callResults[callResult.m_hAsyncCall];
            } else {
               console.warn(`Received call result for ${callResult.m_hAsyncCall} but there's no registered handler`);
            }
         }
      } else {
         this.callbacks[callback.m_iCallback]?.(
            koffi.decode(
               callback.m_pubParam,
               0,
               CallbackIdToStruct[callback.m_iCallback as CallbackId]
               // callback.m_cubParam
            )
         );
      }
   }

   getAuthSessionTicket(): Promise<string> {
      if (this.callbacks[CallbackStructToId.GetAuthSessionTicketResponse_t]) {
         return Promise.reject(new Error("Another SteamAPI_ISteamUser_GetAuthSessionTicket is ongoing"));
      }
      return new Promise((resolve, reject) => {
         const buffer = Buffer.allocUnsafe(1024);
         const length = [0] as [number];
         this.callbacks[CallbackStructToId.GetAuthSessionTicketResponse_t] = (
            result: ICallback_GetAuthSessionTicketResponse_t
         ) => {
            delete this.callbacks[CallbackStructToId.GetAuthSessionTicketResponse_t];
            const r = buffer.subarray(0, length[0]).toString("hex");
            if (result.m_eResult === EResult.k_EResultOK) {
               resolve(r);
            } else {
               reject(new Error(result.m_eResult.toString()));
            }
         };
         SteamAPI_ISteamUser_GetAuthSessionTicket(SteamAPI_ISteamUser(), buffer, buffer.length, length);
      });
   }

   getSteamID(): number {
      return SteamAPI_ISteamUser_GetSteamID(SteamAPI_ISteamUser());
   }

   getDLCCount(): number {
      return SteamAPI_ISteamApps_GetDLCCount(SteamAPI_ISteamApps());
   }

   getAppID(): number {
      return SteamAPI_ISteamUtils_GetAppID(SteamAPI_ISteamUtils());
   }

   isSteamRunningOnSteamDeck(): boolean {
      return SteamAPI_ISteamUtils_IsSteamRunningOnSteamDeck(SteamAPI_ISteamUtils());
   }

   getFileSize(name: string): number {
      return SteamAPI_ISteamRemoteStorage_GetFileSize(SteamAPI_ISteamRemoteStorage(), name);
   }

   // readFileContent(name: string): Promise<string> {
   //    const handle = SteamAPI_ISteamRemoteStorage_FileReadAsync(
   //       this._steamRemoteStorage,
   //       name,
   //       0,
   //       this.getFileSize(name)
   //    );
   //    if (!handle) {
   //       return Promise.reject("SteamAPI_ISteamRemoteStorage_FileReadAsync return false");
   //    }
   //    if (this.callResults[handle]) {
   //       return Promise.reject(`Call result handle: ${handle} already exists`);
   //    }
   //    return new Promise((resolve, reject) => {
   //       this.callResults[handle] = (err, buffer) => {
   //          if (err) {
   //             reject(err);
   //             return;
   //          }
   //          const result = koffi.decode(buffer, "RemoteStorageFileReadAsyncComplete_t");
   //          const content = Buffer.allocUnsafe(result.m_cubRead);
   //          const success = SteamAPI_ISteamRemoteStorage_FileReadAsyncComplete(
   //             this._steamRemoteStorage,
   //             result.m_hFileReadAsync,
   //             content,
   //             result.m_cubRead
   //          );
   //          if (success) {
   //             const fileText = new TextDecoder().decode(content);
   //             console.log(fileText);
   //             resolve(fileText);
   //          } else {
   //             reject(new Error("SteamAPI_ISteamRemoteStorage_FileReadAsyncComplete failed"));
   //          }
   //       };
   //    });
   // }

   readFileContent(name: string): Promise<string> {
      const inProgress = fileReadPromises[name];
      if (inProgress) {
         return inProgress;
      }
      const promise = new Promise<string>((resolve, reject) => {
         const fileSize = this.getFileSize(name);
         if (fileSize == 0) {
            reject(new Error(`File "${name}" does not exist`));
            return;
         }
         const buffer = Buffer.allocUnsafe(fileSize);
         SteamAPI_ISteamRemoteStorage_FileRead.async(
            SteamAPI_ISteamRemoteStorage(),
            name,
            buffer,
            fileSize,
            (err: any) => {
               delete fileReadPromises[name];
               if (err) {
                  reject(err);
                  return;
               }
               resolve(buffer.toString("utf8"));
            }
         );
      });
      fileReadPromises[name] = promise;
      return promise;
   }

   writeFileContent(name: string, content: string): Promise<boolean> {
      const inProgress = fileWritePromises[name];
      if (inProgress) {
         return inProgress;
      }
      const promise = new Promise<boolean>((resolve, reject) => {
         const buffer = Buffer.from(new TextEncoder().encode(content));
         SteamAPI_ISteamRemoteStorage_FileWrite.async(
            SteamAPI_ISteamRemoteStorage(),
            name,
            buffer,
            buffer.byteLength,
            (err: any, success: boolean) => {
               delete fileWritePromises[name];
               if (err) {
                  reject(err);
                  return;
               }
               resolve(success);
            }
         );
      });
      fileWritePromises[name] = promise;
      return promise;
   }

   static shutdown() {
      SteamAPI_Shutdown();
   }
}
