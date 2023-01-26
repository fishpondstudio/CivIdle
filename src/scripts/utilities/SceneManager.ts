import { Dict } from "@pixi/utils";
import { Application, Resource, Texture } from "pixi.js";
import { watchGameState } from "../Global";
import { GameState } from "../logic/GameState";
import { MainBundleAssets } from "../main";

export class Scene {
   public readonly context: ISceneContext;
   constructor(context: ISceneContext) {
      this.context = context;
   }

   onLoad(): void {}
   onDestroy(): void {}
   onGameStateChanged(gameState: GameState): void {}
}

export type Textures = Dict<Texture<Resource>>;

export interface ISceneContext {
   app: Application;
   assets: MainBundleAssets;
   textures: Textures;
   gameState: GameState;
}

export class SceneManager {
   protected currentScene: Scene | undefined;
   protected context: ISceneContext;
   protected gameStateWatcher: (() => void) | undefined;

   constructor(context: ISceneContext) {
      this.context = context;
   }

   public getContext(): ISceneContext {
      return this.context;
   }

   loadScene<T extends Scene>(SceneClass: new (context: ISceneContext) => T, force = false): T {
      if (!force && this.isCurrent(SceneClass)) {
         return this.currentScene as T;
      }
      if (this.currentScene) {
         this.currentScene.onDestroy();
      }
      if (this.gameStateWatcher) {
         this.gameStateWatcher();
      }
      this.context.app.stage.removeChildren();

      this.currentScene = new SceneClass(this.context);
      this.currentScene.onLoad();
      this.gameStateWatcher = watchGameState((gs) => this.currentScene?.onGameStateChanged(gs));
      return this.currentScene as T;
   }

   isCurrent(SceneClass: typeof Scene): boolean {
      // This is for HMR
      if (!this.currentScene) {
         return false;
      }
      return Object.getPrototypeOf(this.currentScene).constructor.name === SceneClass.name;
   }

   getCurrent<T extends Scene>(SceneClass: new (context: ISceneContext) => T): T | null {
      if (this.currentScene instanceof SceneClass) {
         return this.currentScene;
      }
      return null;
   }
}
