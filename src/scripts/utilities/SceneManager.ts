import { Application, Container, Resource, Texture } from "pixi.js";
import { watchGameOptions, watchGameState } from "../Global";
import { GameOptions, GameState } from "../logic/GameState";
import { MainBundleAssets } from "../main";
import { Camera } from "./Camera";

export class Scene {
   public readonly context: ISceneContext;
   constructor(context: ISceneContext) {
      this.context = context;
   }

   onLoad(): void {}
   onDestroy(): void {}
   onResize(width: number, height: number): void {}
   onGameStateChanged(gameState: GameState): void {}
   onGameOptionsChanged(gameOptions: GameOptions): void {}
}

export class ViewportScene extends Scene {
   public readonly viewport: Camera;

   constructor(context: ISceneContext) {
      super(context);
      const { app, gameState } = context;
      this.viewport = new Camera(app);
      app.stage.addChild(this.viewport);
   }

   override onResize(width: number, height: number): void {
      // this.viewport.resize(width, height);
   }

   override onDestroy(): void {
      this.viewport.destroy({ children: true, texture: false, baseTexture: false });
   }
}

export type Textures = Record<string, Texture<Resource>>;

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
   protected gameOptionsWatcher: (() => void) | undefined;

   constructor(context: ISceneContext) {
      this.context = context;
      context.app.renderer.on("resize", (width: number, height: number) => {
         this.currentScene?.onResize(width, height);
      });
   }

   public getContext(): ISceneContext {
      return this.context;
   }

   public loadScene<T extends Scene>(SceneClass: new (context: ISceneContext) => T, force = false): T {
      if (!force && this.isCurrent(SceneClass)) {
         return this.currentScene as T;
      }
      if (this.currentScene) {
         this.currentScene.onDestroy();
      }
      if (this.gameStateWatcher) {
         this.gameStateWatcher();
      }
      if (this.gameOptionsWatcher) {
         this.gameOptionsWatcher();
      }

      destroyAllChildren(this.context.app.stage);

      this.currentScene = new SceneClass(this.context);
      this.currentScene.onLoad();
      this.gameStateWatcher = watchGameState((gs) => this.currentScene?.onGameStateChanged(gs));
      this.gameOptionsWatcher = watchGameOptions((gameOptions) =>
         this.currentScene?.onGameOptionsChanged(gameOptions),
      );
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
      if (this.isCurrent(SceneClass)) {
         return this.currentScene as T;
      }
      return null;
   }
}

export function destroyAllChildren(co: Container): void {
   const removed = co.removeChildren();
   for (let i = 0; i < removed.length; ++i) {
      removed[i].destroy({ children: true });
   }
}
