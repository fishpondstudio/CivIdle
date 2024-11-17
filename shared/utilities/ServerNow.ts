let serverTimeOffset: number | null = null;
export function getServerNow(): number | null {
   if (serverTimeOffset === null) return null;
   return Date.now() + serverTimeOffset;
}

export function setServerNow(serverNow: number): void {
   serverTimeOffset = serverNow - Date.now();
   console.log(
      `[ServerNow] Server Now: ${serverNow}, Client Now = ${Date.now()}, Offset = ${serverTimeOffset}, Adjusted = ${getServerNow()}`,
   );
}
