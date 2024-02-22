import { TypedEvent } from "../utilities/TypedEvent";
import { GameOptions, GameState, SavedGame } from "./GameState";

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
export function serializeSave(gs: SavedGame = savedGame): Uint8Array {
   return new TextEncoder().encode(JSON.stringify(gs, replacer));
}
export function serializeSaveLite(gs: SavedGame = savedGame): Uint8Array {
   const transportation = gs.current.transportation;
   gs.current.transportation = new Map();
   const result = new TextEncoder().encode(JSON.stringify(gs, replacer));
   gs.current.transportation = transportation;
   return result;
}
export function deserializeSave(bytes: Uint8Array): SavedGame {
   return JSON.parse(new TextDecoder().decode(bytes), reviver);
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
