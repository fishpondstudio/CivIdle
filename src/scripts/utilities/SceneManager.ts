import {
   Container,
   FederatedPointerEvent,
   type Application,
   type ColorSource,
   type IPointData,
   type Texture,
} from "pixi.js";
import type { GameOptions, GameState } from "../../../shared/logic/GameState";
import { watchGameOptions, watchGameState } from "../../../shared/logic/GameStateLogic";
import type { MainBundleAssets } from "../main";
import { Camera } from "./Camera";

export abstract class Scene {
   public readonly viewport: Camera;
   public readonly context: ISceneContext;

   constructor(context: ISceneContext) {
      this.context = context;
      const { app, gameState } = context;
      this.viewport = new Camera(app);
   }

   abstract backgroundColor(): ColorSource;

   onMoved(point: IPointData): void {}
   onZoomed(zoom: number): void {}
   onClicked(e: FederatedPointerEvent): void {}

   protected setBackgroundColor(color: ColorSource): void {
      this.context.app.renderer.background.color = color;
   }

   onEnable(): void {
      this.context.app.renderer.background.color = this.backgroundColor();
      this.viewport.on("moved", this.onMoved, this);
      this.viewport.on("zoomed", this.onZoomed, this);
      this.viewport.on("clicked", this.onClicked, this);
   }

   onDisable(): void {
      this.viewport.off("moved", this.onMoved, this);
      this.viewport.off("zoomed", this.onZoomed, this);
      this.viewport.off("clicked", this.onClicked, this);
   }

   onResize(width: number, height: number): void {
      this.viewport.onResize(width, height);
   }
   onGameStateChanged(gameState: GameState): void {}
   onGameOptionsChanged(gameOptions: GameOptions): void {}
}

export interface ISceneContext {
   app: Application;
   assets: MainBundleAssets;
   textures: Record<string, Texture>;
   gameState: GameState;
}

export class SceneManager {
   protected currentScene: Scene | undefined;
   protected context: ISceneContext;
   protected gameStateWatcher: (() => void) | undefined;
   protected gameOptionsWatcher: (() => void) | undefined;
   protected scenes = new Map<string, Scene>();

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
         this.currentScene.viewport.visible = false;
         this.currentScene.onDisable();
      }
      if (this.gameStateWatcher) {
         this.gameStateWatcher();
      }
      if (this.gameOptionsWatcher) {
         this.gameOptionsWatcher();
      }

      let scene = this.scenes.get(SceneClass.name);
      if (!scene) {
         scene = new SceneClass(this.context);
         this.context.app.stage.addChild(scene.viewport);
         this.scenes.set(SceneClass.name, scene);
      }

      this.currentScene = scene;
      this.currentScene.onEnable();
      this.currentScene.viewport.visible = true;
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
      return this.currentScene instanceof SceneClass;
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
      removed[i].destroy({ children: true, texture: false, baseTexture: false });
   }
}
