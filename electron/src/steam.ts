import koffi from "koffi";
import path from "path";

let steamworks;

if (process.platform === "win32") {
   steamworks = koffi.load(path.join(__dirname, "../steamworks/steam_api64.dll"));
} else if (process.platform === "linux") {
   steamworks = koffi.load(path.join(__dirname, "../steamworks/libsteam_api.so"));
} else if (process.platform === "darwin") {
   steamworks = koffi.load(path.join(__dirname, "../steamworks/libsteam_api.dylib"));
} else {
   throw new Error(`Unsupported platform: ${process.platform}`);
}

const ISteamUtils = koffi.opaque("ISteamUtils");
const ISteamRemoteStorage = koffi.opaque("ISteamRemoteStorage");
const ISteamApps = koffi.opaque("ISteamApps");
const ISteamUser = koffi.opaque("ISteamUser");
koffi.alias("HSteamPipe", "int");
koffi.alias("HSteamUser", "int");
koffi.alias("SteamAPICall_t", "uint64");
koffi.alias("uint64_steamid", "uint64");

const CallbackMsg_t = koffi.struct("CallbackMsg_t", {
   m_hSteamUser: "HSteamUser",
   m_iCallback: "int",
   m_pubParam: "uint8*",
   m_cubParam: "int",
});

const SteamAPICallCompleted_t = koffi.struct("SteamAPICallCompleted_t", {
   m_hAsyncCall: "SteamAPICall_t",
   m_iCallback: "int",
   m_cubParam: "uint32",
});

const RemoteStorageFileReadAsyncComplete_t = koffi.struct("RemoteStorageFileReadAsyncComplete_t", {
   m_hFileReadAsync: "SteamAPICall_t",
   m_eResult: "uint32",
   m_nOffset: "uint32",
   m_cubRead: "uint32",
});

const SteamAPI_Init = steamworks.cdecl("bool SteamAPI_Init()");
const SteamAPI_SteamUtils = steamworks.cdecl("ISteamUtils *SteamAPI_SteamUtils_v010()");
const SteamAPI_SteamRemoteStorage = steamworks.cdecl("ISteamRemoteStorage *SteamAPI_SteamRemoteStorage_v016()");
const SteamAPI_SteamApps = steamworks.cdecl("ISteamApps *SteamAPI_SteamApps_v008()");
const SteamAPI_SteamUser = steamworks.cdecl("ISteamUser *SteamAPI_SteamUser_v021()");

const SteamAPI_ISteamUtils_IsSteamRunningOnSteamDeck = steamworks.cdecl(
   "bool SteamAPI_ISteamUtils_IsSteamRunningOnSteamDeck(ISteamUtils * self)"
);
const SteamAPI_ISteamUtils_GetAppID = steamworks.cdecl("uint32 SteamAPI_ISteamUtils_GetAppID(ISteamUtils* self)");
const SteamAPI_ISteamUser_GetSteamID = steamworks.cdecl(
   "uint64_steamid SteamAPI_ISteamUser_GetSteamID(ISteamUser* self)"
);
const SteamAPI_RestartAppIfNecessary = steamworks.cdecl("bool SteamAPI_RestartAppIfNecessary(uint32 unOwnAppID)");

const SteamAPI_ISteamRemoteStorage_FileRead = steamworks.cdecl(
   "int SteamAPI_ISteamRemoteStorage_FileRead(ISteamRemoteStorage* self, const char * pchFile, _Out_ void * pvData, int cubDataToRead)"
);

const SteamAPI_ISteamApps_GetDLCCount = steamworks.cdecl("int SteamAPI_ISteamApps_GetDLCCount(ISteamApps* self)");

const SteamAPI_ISteamRemoteStorage_FileReadAsync = steamworks.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_FileReadAsync(ISteamRemoteStorage* self, const char * pchFile, uint32 nOffset, uint32 cubToRead)"
);
const SteamAPI_ISteamRemoteStorage_FileReadAsyncComplete = steamworks.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_FileReadAsyncComplete(ISteamRemoteStorage* self, SteamAPICall_t hReadCall, _Out_ void * pvBuffer, uint32 cubToRead)"
);
const SteamAPI_ISteamRemoteStorage_FileWrite = steamworks.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_FileWrite(ISteamRemoteStorage* self, const char *pchFile, const void *pvData, int cubData)"
);
const SteamAPI_ISteamRemoteStorage_GetFileSize = steamworks.cdecl(
   "int SteamAPI_ISteamRemoteStorage_GetFileSize(ISteamRemoteStorage* self, const char * pchFile)"
);

const SteamAPI_GetHSteamPipe = steamworks.cdecl("HSteamPipe SteamAPI_GetHSteamPipe()");
const SteamAPI_ManualDispatch_Init = steamworks.cdecl("void SteamAPI_ManualDispatch_Init()");
const SteamAPI_ManualDispatch_RunFrame = steamworks.cdecl(
   "void SteamAPI_ManualDispatch_RunFrame(HSteamPipe hSteamPipe)"
);
const SteamAPI_ManualDispatch_GetNextCallback = steamworks.cdecl(
   "bool SteamAPI_ManualDispatch_GetNextCallback(HSteamPipe hSteamPipe, _Out_ CallbackMsg_t *pCallbackMsg)"
);
const SteamAPI_ManualDispatch_FreeLastCallback = steamworks.cdecl(
   "void SteamAPI_ManualDispatch_FreeLastCallback(HSteamPipe hSteamPipe)"
);

const SteamAPI_ManualDispatch_GetAPICallResult = steamworks.cdecl(
   "bool SteamAPI_ManualDispatch_GetAPICallResult(HSteamPipe hSteamPipe, SteamAPICall_t hSteamAPICall, _Out_ void * pCallback, int cubCallback, int iCallbackExpected, _Out_ bool *pbFailed)"
);

const kSteamAPICallCompleted = 703;

const SteamAPI_Shutdown = steamworks.cdecl("void SteamAPI_Shutdown()");

const fileReadPromises: Record<string, Promise<string>> = {};
const fileWritePromises: Record<string, Promise<boolean>> = {};

export class SteamAPI {
   private _steamUtils: any;
   private _steamRemoteStorage: any;
   private _steamApps: any;
   private _steamUser: any;

   private callResults: Record<number, (err: Error | null, b: Buffer) => void> = {};
   private callbacks: Record<number, (b: Buffer) => void> = {};

   constructor() {
      if (!SteamAPI_Init()) {
         throw new Error("Steamworks SDK fails to initialize. Is Steam running? Are you launching the game via Steam?");
      }

      this._steamUtils = SteamAPI_SteamUtils();
      this._steamRemoteStorage = SteamAPI_SteamRemoteStorage();
      this._steamApps = SteamAPI_SteamApps();
      this._steamUser = SteamAPI_SteamUser();

      console.log(`Steamworks Initialized for App: ${this.getAppId()}`);

      SteamAPI_ManualDispatch_Init();
      setInterval(this.dispatchCallbacks.bind(this), 100);
   }

   dispatchCallbacks() {
      const pipe = SteamAPI_GetHSteamPipe();
      SteamAPI_ManualDispatch_RunFrame(pipe);
      const callback: any = {};
      while (SteamAPI_ManualDispatch_GetNextCallback(pipe, callback)) {
         if (callback.m_iCallback === kSteamAPICallCompleted) {
            const completed = koffi.decode(callback.m_pubParam, "SteamAPICallCompleted_t", callback.m_cubParam);
            const data = Buffer.alloc(completed.m_cubParam as number);
            const fail = [false];
            if (
               SteamAPI_ManualDispatch_GetAPICallResult(
                  pipe,
                  completed.m_hAsyncCall,
                  data.buffer,
                  completed.m_cubParam,
                  completed.m_iCallback,
                  fail
               )
            ) {
               if (this.callResults[completed.m_hAsyncCall as number]) {
                  this.callResults[completed.m_hAsyncCall as number](
                     fail[0] ? new Error("SteamAPI_ManualDispatch_GetAPICallResult failed") : null,
                     data
                  );
                  delete this.callResults[completed.m_hAsyncCall as number];
               } else {
                  console.warn(`Received call result for ${completed.m_hAsyncCall} but there's no registered handler`);
               }
            }
         }
         SteamAPI_ManualDispatch_FreeLastCallback(pipe);
      }
   }

   getSteamId(): number {
      return SteamAPI_ISteamUser_GetSteamID(this._steamUser);
   }

   getDlcCount(): number {
      return SteamAPI_ISteamApps_GetDLCCount(this._steamApps);
   }

   getAppId(): number {
      return SteamAPI_ISteamUtils_GetAppID(this._steamUtils);
   }

   isSteamRunningOnSteamDeck(): boolean {
      return SteamAPI_ISteamUtils_IsSteamRunningOnSteamDeck(this._steamUtils);
   }

   getFileSize(name: string): number {
      return SteamAPI_ISteamRemoteStorage_GetFileSize(this._steamRemoteStorage, name);
   }

   // readFileContent(name: string): Promise<string> {
   //     const handle = SteamAPI_ISteamRemoteStorage_FileReadAsync(
   //         this._steamRemoteStorage,
   //         name,
   //         0,
   //         this.getFileSize(name)
   //     );
   //     if (!handle) {
   //         return Promise.reject("SteamAPI_ISteamRemoteStorage_FileReadAsync return false");
   //     }
   //     if (this.callResults[handle]) {
   //         return Promise.reject(`Call result handle: ${handle} already exists`);
   //     }
   //     return new Promise((resolve, reject) => {
   //         this.callResults[handle] = (err, buffer) => {
   //             if (err) {
   //                 reject(err);
   //                 return;
   //             }
   //             const result = koffi.decode(buffer, "RemoteStorageFileReadAsyncComplete_t");
   //             const content = Buffer.alloc(result.m_cubRead);
   //             const success = SteamAPI_ISteamRemoteStorage_FileReadAsyncComplete(
   //                 this._steamRemoteStorage,
   //                 result.m_hFileReadAsync,
   //                 content.buffer,
   //                 result.m_cubRead
   //             );
   //             if (success) {
   //                 const fileText = new TextDecoder().decode(content);
   //                 console.log(fileText);
   //                 resolve(fileText);
   //             } else {
   //                 reject(new Error("SteamAPI_ISteamRemoteStorage_FileReadAsyncComplete failed"));
   //             }
   //         };
   //     });
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
         SteamAPI_ISteamRemoteStorage_FileRead.async(this._steamRemoteStorage, name, buffer, fileSize, (err: any) => {
            delete fileReadPromises[name];
            if (err) {
               reject(err);
               return;
            }
            resolve(buffer.toString("utf8"));
         });
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
         const buffer = new TextEncoder().encode(content);
         SteamAPI_ISteamRemoteStorage_FileWrite.async(
            this._steamRemoteStorage,
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
