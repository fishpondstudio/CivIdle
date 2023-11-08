import { Viewport } from "pixi-viewport";
import { Application, IPointData, Resource, Texture } from "pixi.js";
import { watchGameOptions, watchGameState } from "../Global";
import { GameOptions, GameState } from "../logic/GameState";
import { MainBundleAssets } from "../main";
import { clamp } from "./Helper";

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
   public readonly viewport: Viewport;

   constructor(context: ISceneContext) {
      super(context);
      const { app, gameState } = context;
      this.viewport = new Viewport({
         events: app.renderer.events,
         disableOnContextMenu: true,
         screenWidth: app.screen.width,
         screenHeight: app.screen.height,
      });
      app.stage.addChild(this.viewport);
   }

   clampCenter(pos: IPointData): IPointData {
      const x = clamp(
         pos.x,
         this.viewport.screenWidth / 2 / this.viewport.scale.y,
         this.viewport.worldWidth - this.viewport.screenWidth / 2 / this.viewport.scale.y
      );
      const y = clamp(
         pos.y,
         this.viewport.screenHeight / 2 / this.viewport.scale.y,
         this.viewport.worldHeight - this.viewport.screenHeight / 2 / this.viewport.scale.y
      );
      return { x, y };
   }

   override onResize(width: number, height: number): void {
      this.viewport.resize(width, height);
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
      // context.app.renderer.on("resize", (width: number, height: number) => {
      //    this.currentScene?.onResize(width, height);
      // });
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

      for (let i = 0; i < this.context.app.stage.children.length; i++) {
         const removed = this.context.app.stage.removeChildren();
         for (let i = 0; i < removed.length; ++i) {
            removed[i].destroy({ children: true });
         }
      }

      this.currentScene = new SceneClass(this.context);
      this.currentScene.onLoad();
      this.gameStateWatcher = watchGameState((gs) => this.currentScene?.onGameStateChanged(gs));
      this.gameOptionsWatcher = watchGameOptions((gameOptions) => this.currentScene?.onGameOptionsChanged(gameOptions));
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
