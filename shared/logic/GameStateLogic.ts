import { wyhash } from "../thirdparty/wyhash";
import { TypedEvent } from "../utilities/TypedEvent";
import { SavedGame, type GameOptions, type GameState } from "./GameState";

export const savedGame = new SavedGame();
export const TILE_SIZE = 64;
export const GameStateChanged = new TypedEvent<GameState>();
export const GameOptionsChanged = new TypedEvent<GameOptions>();
export function getGameState(): GameState {
   return savedGame.current;
}
export function getGameOptions(): GameOptions {
   return savedGame.options;
}
export function serializeSave(save: SavedGame = savedGame): string {
   save.options.checksum = null;
   const checksum = wyhash(serializeSaveLite(save), BigInt(0)).toString(16);
   save.options.checksum = checksum;
   return JSON.stringify(save, replacer);
}
export function serializeSaveLite(gs: SavedGame = savedGame): Uint8Array {
   const transportation = gs.current.transportationV2;
   gs.current.transportationV2 = [];
   const json = JSON.stringify(gs, replacer);
   gs.current.transportationV2 = transportation;
   const result = new TextEncoder().encode(json);
   return result;
}
export const checksum = { expected: "", actual: "" };
export function deserializeSave(str: string): SavedGame {
   const saveGame = JSON.parse(str, reviver) as SavedGame;
   const expected = saveGame.options.checksum;
   if (!expected) {
      return saveGame;
   }
   checksum.expected = expected;
   saveGame.options.checksum = null;
   checksum.actual = wyhash(serializeSaveLite(saveGame), BigInt(0)).toString(16);
   // TODO: Remove this when everyone is migrated!
   if ("transportation" in saveGame.current) {
      checksum.actual = checksum.expected;
   }
   return saveGame;
}
export function notifyGameStateUpdate(gameState?: GameState): void {
   GameStateChanged.emit(gameState ?? getGameState());
}
export function notifyGameOptionsUpdate(gameOptions?: GameOptions): void {
   GameOptionsChanged.emit(gameOptions ?? getGameOptions());
}
export function watchGameState(cb: (gs: GameState) => void): () => void {
   cb(getGameState());
   function handleGameStateChanged(gs: GameState) {
      cb(gs);
   }
   GameStateChanged.on(handleGameStateChanged);
   return () => {
      GameStateChanged.off(handleGameStateChanged);
   };
}
export function watchGameOptions(cb: (gameOptions: GameOptions) => void): () => void {
   cb(getGameOptions());
   function handleGameOptionsChanged(gameOptions: GameOptions) {
      cb(gameOptions);
   }
   GameOptionsChanged.on(handleGameOptionsChanged);
   return () => {
      GameOptionsChanged.off(handleGameOptionsChanged);
   };
}
export function replacer(key: string, value: any): any {
   if (value instanceof Map) {
      return {
         $type: "Map",
         value: Array.from(value.entries()),
      };
   }
   if (value instanceof Set) {
      return {
         $type: "Set",
         value: Array.from(value.values()),
      };
   }
   return value;
}
export function reviver(key: string, value: any): any {
   if (typeof value === "object" && value !== null) {
      if (value.$type === "Map") {
         return new Map(value.value);
      }
      if (value.$type === "Set") {
         return new Set(value.value);
      }
   }
   return value;
}
