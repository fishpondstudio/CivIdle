/////////////////////////////////////////////////////////////////////////////////////////////
// Attention! Do not complicates the import of this file since it causes HMR to break easily
import { ITileData } from "../logic/Tile";
import { Grid } from "../scenes/Grid";
import { GameTicker } from "./GameTicker";
import { SceneManager } from "./SceneManager";
/////////////////////////////////////////////////////////////////////////////////////////////

export type RouteTo = <P extends Record<string, unknown>>(
   component: React.ComponentType<P>,
   params: P,
) => void;

export interface ISingleton {
   sceneManager: SceneManager;
   grid: Grid;
   buildings: ISpecialBuildings;
   routeTo: RouteTo;
   ticker: GameTicker;
}

export interface ISpecialBuildings {
   Headquarter: Required<ITileData>;
   Petra?: Required<ITileData>;
}

let singletons: ISingleton | null = null;

export function initializeSingletons(s: ISingleton) {
   if (singletons != null) {
      console.warn("Singletons are already initialized, you are trying to initialize it again!");
   }
   singletons = s;
   if (import.meta.env.DEV) {
      // @ts-expect-error
      window.singleton = s;
   }
}

export function isSingletonReady() {
   return singletons !== null;
}

export function Singleton(): ISingleton {
   if (singletons == null) {
      throw new Error("Singletons are not initialized yet!");
   }
   return singletons;
}
