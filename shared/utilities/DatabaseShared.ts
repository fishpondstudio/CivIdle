import { MAX_CHAT_PER_CHANNEL } from "../logic/Constants";
import { safeAdd } from "./Helper";

export function vacuumChat<T extends { channel: string } | object>(old: T[]): T[] {
   const channels: Record<string, number> = {};
   const chat: T[] = [];
   for (let i = old.length - 1; i >= 0; i--) {
      const message = old[i];
      if (!("channel" in message)) {
         chat.unshift(message);
         continue;
      }
      safeAdd(channels, message.channel, 1);
      if (channels[message.channel] <= MAX_CHAT_PER_CHANNEL) {
         chat.unshift(message);
      }
   }
   return chat;
}
