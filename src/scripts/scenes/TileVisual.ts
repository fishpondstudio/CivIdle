import { Viewport } from "pixi-viewport";
import { BitmapText, Container, IPointData, Sprite } from "pixi.js";
import { Resource } from "../definitions/ResourceDefinitions";
import { Fonts } from "../generated/FontBundle";
import { getGameState, Singleton } from "../Global";
import { getBuildingLevelLabel, getBuildingTexture, getTileTexture } from "../logic/BuildingLogic";
import { GameState } from "../logic/GameState";
import { ITileData } from "../logic/Tile";
import { clamp, forEach, layoutCenter, pointToXy, sizeOf } from "../utilities/Helper";
import Actions from "../utilities/pixi-actions/Actions";
import Action from "../utilities/pixi-actions/actions/Action";
import { Easing } from "../utilities/pixi-actions/Easing";
import { v2 } from "../utilities/Vector2";
import { WorldScene } from "./WorldScene";

export class TileVisual extends Container {
   private readonly _world: WorldScene;
   private _fog: Sprite;
   private _spinner: Sprite;
   private _building: Sprite;
   private readonly _grid: IPointData;
   private readonly _deposits: Partial<Record<Resource, Sprite>> = {};
   private readonly _tile: ITileData;
   private readonly _construction: Sprite;
   private readonly _upgrade: Sprite;
   private readonly _level: BitmapText;
   private _constructionAnimation: Action;
   private _upgradeAnimation: Action;

   constructor(world: WorldScene, grid: IPointData) {
      super();
      this._world = world;
      this._grid = grid;
      this.position = Singleton().grid.gridToPosition(this._grid);

      const { textures } = this._world.context;

      this._spinner = this.addChild(new Sprite(textures.Spinner));
      this._spinner.anchor.set(0.5);
      this._spinner.visible = false;
      this._spinner.alpha = 0;

      this._building = this.addChild(new Sprite());
      this._building.anchor.set(0.5);
      this._building.scale.set(0.5);

      this._construction = this.addChild(new Sprite(textures.Construction));
      this._construction.position.set(-25, -5);
      this._construction.anchor.set(0, 1);
      this._construction.scale.set(0.5);
      this._construction.visible = false;

      this._constructionAnimation = Actions.repeat(
         Actions.sequence(
            Actions.to(this._construction, { angle: 45 }, 0.5, Easing.OutBounce),
            Actions.to(this._construction, { angle: 0 }, 0.5, Easing.OutSine)
         )
      );

      this._upgrade = this.addChild(new Sprite(textures.Upgrade));
      this._upgrade.position.set(-25, 10);
      this._upgrade.anchor.set(0, 1);
      this._upgrade.scale.set(0.5);
      this._upgrade.alpha = 0;
      this._upgrade.visible = false;

      this._upgradeAnimation = Actions.repeat(
         Actions.sequence(
            Actions.runFunc(() => {
               this._upgrade.y = 10;
               this._upgrade.alpha = 0;
            }),
            Actions.to(this._upgrade, { y: 0, alpha: 1 }, 0.5, Easing.OutSine),
            Actions.to(this._upgrade, { y: -10, alpha: 0 }, 0.5, Easing.InSine)
         )
      );

      this._level = this.addChild(
         new BitmapText("", {
            fontName: Fonts.CabinMedium,
            fontSize: 16,
            tint: 0xffffff,
         })
      );
      this._level.anchor.set(0.5, 0.5);
      this._level.position.set(25, -25);
      this._level.visible = false;

      this._fog = this.addChild(new Sprite(textures.Cloud));
      this._fog.anchor.set(0.5);

      const gs = getGameState();
      const xy = pointToXy(this._grid);
      this._tile = gs.tiles[xy];

      if (this._tile) {
         forEach(this._tile.deposit, (deposit) => {
            const sprite = this.addChild(new Sprite(getTileTexture(deposit, textures)));
            sprite.alpha = 0.5;
            sprite.anchor.set(0.5);
            sprite.visible = this._tile.explored;
            this._deposits[deposit] = sprite;
         });
         this.updateLayout();
      }

      this.update(getGameState(), 0);
      world.viewport.on("zoomed-end", this.onZoomed, this);
      this.on("destroy", this.onDestroyed);
   }

   public updateLayout() {
      if (!this._tile.explored) {
         return;
      }
      let position = v2({ x: 0, y: 0 });
      let scale = 0.25;
      if (this._tile.building) {
         position = v2({ x: 0, y: 30 });
         scale = 0.15;
      }
      const width = scale * 100;
      let i = 0;
      const total = sizeOf(this._tile.deposit);
      forEach(this._deposits, (_, sprite) => {
         sprite.visible = true;
         sprite.position.copyFrom(position.add({ x: layoutCenter(width, 4, total, i++), y: 0 }));
         sprite.scale.set(scale);
      });
   }

   private onZoomed(e: Viewport) {
      if (!this._tile.explored) {
         return;
      }
      forEach(this._deposits, (_, sprite) => {
         sprite.visible = !this._tile.building || e.scale.x >= 1;
      });
   }

   public onDestroyed() {
      this._world.viewport.off("zoomed-end", this.onZoomed, this);
   }

   public async reveal(): Promise<TileVisual> {
      this.updateLayout();
      return await new Promise((resolve) => {
         Actions.sequence(
            Actions.to(this._fog, { alpha: 0, scale: { x: 0.8, y: 0.8 } }, 1, Easing.InQuad),
            Actions.runFunc(() => resolve(this))
         ).play();
      });
   }

   public update(gs: GameState, dt: number) {
      const { textures, gameState } = this._world.context;
      if (!this._tile) {
         console.warn(`[TileVisual] Cannot find tile data for ${pointToXy(this._grid)}`);
         return;
      }
      if (!this._tile.explored) {
         this._fog.visible = true;
         return;
      }
      this._fog.visible = false;
      if (!this._tile.building) {
         this._building.visible = false;
         this._spinner.visible = false;
         return;
      }
      this._building.visible = true;
      if (this._building.texture.noFrame) {
         this._building.texture = getBuildingTexture(this._tile.building.type, textures, gameState.city);
         this.updateLayout();
      }
      this._level.visible = true;
      this._level.text = getBuildingLevelLabel(this._tile.building);
      if (this._tile.building.status === "building") {
         this._construction.visible = true;
         this._spinner.visible = false;
         this._building.alpha = 0.5;
         this.toggleConstructionTween(true);
         return;
      }
      if (this._tile.building.status === "paused") {
         this.toggleConstructionTween(false);
         this._construction.visible = true;
         this._spinner.visible = false;
         this._building.alpha = 0.5;
         return;
      }
      this._construction.visible = false;
      this.toggleConstructionTween(false);
      if (this._tile.building.status === "upgrading") {
         this._upgrade.visible = true;
         this.toggleUpgradeTween(true);
         this._spinner.visible = false;
         return;
      }
      this._upgrade.visible = false;
      this.toggleUpgradeTween(false);
      this._spinner.visible = true;
      this._spinner.angle += dt * 90;
      if (this._tile.building.notProducingReason == null) {
         this._spinner.alpha += dt;
         this._building.alpha += dt;
      } else {
         this._spinner.alpha -= dt;
         this._building.alpha -= dt;
      }
      this._spinner.alpha = clamp(this._spinner.alpha, 0, 0.5);
      this._building.alpha = clamp(this._building.alpha, 0.5, 1);
   }

   private toggleConstructionTween(on: boolean) {
      if (on && !this._constructionAnimation.isPlaying()) {
         this._constructionAnimation.play();
      }
      if (!on) {
         this._constructionAnimation.stop();
      }
   }

   private toggleUpgradeTween(on: boolean) {
      if (on && !this._upgradeAnimation.isPlaying()) {
         this._upgradeAnimation.play();
      }
      if (!on) {
         this._upgradeAnimation.stop();
      }
   }
}
