import { Dict } from "@pixi/utils";
import { Viewport } from "pixi-viewport";
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
   onResize(width: number, height: number): void {}
   onGameStateChanged(gameState: GameState): void {}
}

export class ViewportScene extends Scene {
   public readonly viewport: Viewport;

   constructor(context: ISceneContext) {
      super(context);
      const { app, gameState } = context;
      this.viewport = new Viewport({
         interaction: app.renderer.plugins.interaction,
         disableOnContextMenu: true,
         screenWidth: app.screen.width,
         screenHeight: app.screen.height,
      });
      app.stage.addChild(this.viewport);
   }

   override onResize(width: number, height: number): void {
      this.viewport.resize(width, height);
   }

   override onDestroy(): void {
      this.viewport.destroy({ children: true, texture: false, baseTexture: false });
   }
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
      context.app.renderer.on("resize", (width: number, height: number) => {
         this.currentScene?.onResize(width, height);
      });
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

      for (let i = 0; i < this.context.app.stage.children.length; i++) {
         this.context.app.stage.children[i].destroy({ children: true, texture: false, baseTexture: false });
      }

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
