import type { SmoothGraphics } from "@pixi/graphics-smooth";
import type { IDestroyOptions, IPointData } from "pixi.js";
import { BitmapText, Container, Rectangle, Sprite } from "pixi.js";
import type { Resource } from "../../../shared/definitions/ResourceDefinitions";
import {
   getBuildingLevelLabel,
   getBuildingPercentage,
   isWorldOrNaturalWonder,
} from "../../../shared/logic/BuildingLogic";
import type { GameOptions, GameState } from "../../../shared/logic/GameState";
import { getGameOptions, getGameState } from "../../../shared/logic/GameStateLogic";
import { getGrid } from "../../../shared/logic/IntraTickCache";
import { Tick } from "../../../shared/logic/TickLogic";
import type { ITileData } from "../../../shared/logic/Tile";
import {
   clamp,
   forEach,
   formatHMS,
   formatNumber,
   formatPercent,
   layoutCenter,
   pointToTile,
   pointToXy,
   sizeOf,
   type Tile,
} from "../../../shared/utilities/Helper";
import { v2 } from "../../../shared/utilities/Vector2";
import { getBuildingTexture, getNotProducingTexture, getTexture, getTileTexture } from "../logic/VisualLogic";
import { getColorCached } from "../utilities/CachedColor";
import { Actions } from "../utilities/pixi-actions/Actions";
import { Easing } from "../utilities/pixi-actions/Easing";
import type { Action } from "../utilities/pixi-actions/actions/Action";
import { Fonts } from "../visuals/Fonts";
import type { WorldScene } from "./WorldScene";

export class TileVisual extends Container {
   private readonly _world: WorldScene;
   private _fog: Sprite;
   private _spinner: Sprite;
   private _building: Sprite;
   private readonly _grid: IPointData;
   private readonly _deposits: Map<Resource, Sprite> = new Map();
   private readonly _tile: ITileData;
   private readonly _construction: Sprite;
   private readonly _notProducing: Sprite;
   private readonly _upgrade: Sprite;
   private readonly _level: BitmapText;
   private readonly _bottomText: BitmapText;
   private readonly _constructionAnimation: Action;
   private readonly _upgradeAnimation: Action;
   private readonly _xy: Tile;
   private _floaterValue = 0;
   private _aabb: Rectangle;

   constructor(world: WorldScene, grid: IPointData) {
      super();
      this._world = world;
      this._grid = grid;
      this._xy = pointToTile(this._grid);

      const gs = getGameState();
      this._tile = gs.tiles.get(this._xy)!;
      console.assert(this._tile, "Expect tile to exist!");
      const g = getGrid(gs);
      this.position = g.gridToPosition(this._grid);

      // We use a very large AABB to avoid flickering when zooming
      this._aabb = new Rectangle(
         this.position.x - 2 * g.size,
         this.position.y - 2 * g.size,
         4 * g.size,
         4 * g.size,
      );

      this.cullable = true;

      const { textures } = this._world.context;

      this._spinner = this.addChild(new Sprite(getTexture("Misc_Spinner", textures)));
      this._spinner.anchor.set(0.5);
      this._spinner.visible = false;
      this._spinner.alpha = 0;

      this._building = this.addChild(new Sprite());
      this._building.anchor.set(0.5);
      this._building.scale.set(0.5);

      this._construction = this.addChild(new Sprite(getTexture("Misc_Construction", textures)));
      this._construction.position.set(-25, -5);
      this._construction.anchor.set(0, 1);
      this._construction.scale.set(0.5);
      this._construction.visible = false;

      this._notProducing = this.addChild(new Sprite());
      this._notProducing.position.set(-20, -20);
      this._notProducing.anchor.set(0.5, 0.5);
      this._notProducing.scale.set(0.5);
      this._notProducing.visible = false;

      this._constructionAnimation = Actions.repeat(
         Actions.sequence(
            Actions.to(this._construction, { angle: 45 }, 0.5, Easing.OutBounce),
            Actions.to(this._construction, { angle: 0 }, 0.5, Easing.OutSine),
         ),
      );

      this._upgrade = this.addChild(new Sprite(getTexture("Misc_Upgrade", textures)));
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
            Actions.to(this._upgrade, { y: -10, alpha: 0 }, 0.5, Easing.InSine),
         ),
      );

      this._level = this.addChild(
         new BitmapText("", {
            fontName: Fonts.Cabin,
            fontSize: 16,
            tint: 0xffffff,
         }),
      );
      this._level.anchor.set(0.5, 0.5);
      this._level.position.set(25, -25);
      this._level.visible = true;
      this._level.cullable = true;

      this._bottomText = this.addChild(
         new BitmapText("", { fontName: Fonts.Cabin, fontSize: 12, tint: 0xffffff }),
      );
      this._bottomText.anchor.set(0.5, 0.5);
      this._bottomText.position.set(0, 35);
      this._bottomText.visible = true;
      this._bottomText.cullable = true;

      this._fog = this.addChild(new Sprite(getTexture("Misc_Cloud", textures)));
      this._fog.anchor.set(0.5);
      this._fog.visible = !this._tile.explored;

      if (this._tile) {
         // Deposit
         forEach(Object.assign({}, this._tile.deposit, { Power: true }), (deposit) => {
            const sprite = this.addChild(new Sprite(getTileTexture(deposit, textures)));
            sprite.alpha = 0.5;
            sprite.anchor.set(0.5);
            sprite.visible = this._tile.explored;
            this._deposits.set(deposit, sprite);
         });
         this.updateDepositLayout();
         this.updateDepositColor(getGameOptions());
      }

      this.update(0);
   }

   public isInViewport(): boolean {
      const rect = this._world.viewport.visibleWorldRect();
      if (!rect) return true;
      return rect.intersects(this._aabb);
   }

   public debugDraw(g: SmoothGraphics): void {
      g.drawRect(this._aabb.x, this._aabb.y, this._aabb.width, this._aabb.height);
   }

   override destroy(options?: boolean | IDestroyOptions | undefined): void {
      super.destroy(options);
      this._upgradeAnimation.stop();
      this._constructionAnimation.stop();
   }

   public updateDepositColor(options: GameOptions) {
      this._deposits.forEach((sprite, deposit) => {
         sprite.tint = getColorCached(options.resourceColors[deposit] ?? "#ffffff");
      });
   }

   public reveal(): void {
      this.updateDepositLayout();
      Actions.sequence(
         Actions.to(this._fog, { alpha: 0, scale: { x: 0.5, y: 0.5 } }, 1, Easing.InQuad),
         Actions.runFunc(() => {
            this._fog.visible = false;
         }),
      ).start();
   }

   public addFloater(value: number): void {
      this._floaterValue += value;
   }

   public flushFloater(speed: number): void {
      if (this._floaterValue <= 0 || !this.isInViewport()) return;
      const t = this._world.tooltipPool.allocate();
      t.text = `+${formatNumber(this._floaterValue)}`;
      this._floaterValue = 0;
      t.position = this.position;
      t.y = t.y - 20;
      Actions.sequence(
         Actions.to(t, { y: t.y - 10, alpha: 1 }, 0.25 * speed, Easing.OutQuad),
         Actions.to(t, { y: t.y - 40, alpha: 0 }, 1.25 * speed, Easing.InQuad),
         Actions.runFunc(() => {
            this._world.tooltipPool.release(t);
         }),
      ).start();
   }

   public update(dt: number) {
      if (!this.isInViewport()) {
         this.visible = false;
         return;
      }

      if (!this.visible) {
         this.visible = true;
         this.onTileDataChanged(this._tile);
      }

      if (!this._tile || !this._tile.building) {
         return;
      }

      const color = getGameOptions().buildingColors[this._tile.building.type];
      if (color) {
         const c = getColorCached(color);
         this._building.tint = c;
         this._notProducing.tint = c;
         this._spinner.tint = c;
      } else {
         this._building.tint = 0xffffff;
         this._notProducing.tint = 0xffffff;
         this._spinner.tint = 0xffffff;
      }
      if (this._tile.building.status !== "completed") {
         return;
      }
      this._spinner.angle += Tick.current.electrified.has(this._tile.tile) ? dt * 180 : dt * 90;
      if (Tick.current.notProducingReasons.has(this._xy)) {
         this._spinner.alpha -= dt;
         this._building.alpha -= dt;
      } else {
         this._spinner.alpha += dt;
         this._building.alpha += dt;
      }
      this._spinner.alpha = clamp(this._spinner.alpha, 0, 0.5);
      this._building.alpha = clamp(
         this._building.alpha,
         getGameOptions().themeColors.InactiveBuildingAlpha,
         1,
      );
   }

   public onTileDataChanged(tileData: ITileData) {
      const { textures, gameState, app } = this._world.context;
      if (!this._tile) {
         console.warn(`[TileVisual] Cannot find tile data for ${pointToXy(this._grid)}`);
         return;
      }

      if (!this._tile.explored) {
         this._building.visible = false;
         return;
      }

      if (!this.isInViewport()) {
         return;
      }

      this.updateDepositLayout();

      if (!this._tile.building) {
         this._building.visible = false;
         this._spinner.visible = false;
         return;
      }
      this._building.visible = true;
      if (this._building.texture.noFrame) {
         this._building.texture = getBuildingTexture(this._tile.building.type, textures, gameState.city);
      }

      switch (this._tile.building.status) {
         case "building": {
            this._construction.visible = true;
            this._notProducing.visible = false;
            this._upgrade.visible = false;
            this._level.visible = false;
            this._spinner.visible = false;
            this._building.alpha = 0.5;
            this.toggleConstructionTween(true);
            this.showTimeLeft(tileData, gameState);
            return;
         }
         case "upgrading": {
            this._construction.visible = false;
            this._notProducing.visible = false;
            this._upgrade.visible = true;
            this.toggleUpgradeTween(true);
            this._spinner.visible = false;
            if (!isWorldOrNaturalWonder(this._tile.building.type)) {
               this._level.visible = true;
               this._level.text = getBuildingLevelLabel(this._tile.building);
            }
            this.showTimeLeft(tileData, gameState);
            return;
         }
         case "completed": {
            this._construction.visible = false;
            this.toggleConstructionTween(false);
            this._upgrade.visible = false;
            this.toggleUpgradeTween(false);

            switch (getGameOptions().extraTileInfoType) {
               case "None": {
                  this._bottomText.visible = false;
                  break;
               }
               case "EmpireValue": {
                  const ev =
                     (Tick.current.buildingValueByTile.get(tileData.tile) ?? 0) +
                     (Tick.current.resourceValueByTile.get(tileData.tile) ?? 0);
                  if (ev > 0) {
                     this._bottomText.visible = true;
                     this._bottomText.text = formatNumber(ev);
                  } else {
                     this._bottomText.visible = false;
                  }
                  break;
               }
               case "StoragePercentage": {
                  const pct = Tick.current.storagePercentages.get(tileData.tile);
                  if (pct) {
                     this._bottomText.visible = true;
                     this._bottomText.text = formatPercent(pct);
                  } else {
                     this._bottomText.visible = false;
                  }
               }
            }

            if (!isWorldOrNaturalWonder(this._tile.building.type)) {
               this._level.visible = true;
               this._level.text = getBuildingLevelLabel(this._tile.building);
            }

            const reason = Tick.current.notProducingReasons.get(tileData.tile);
            if (reason) {
               this._notProducing.texture = getNotProducingTexture(reason, textures);
               this.fadeInTopLeftIcon();
            } else if (Tick.current.electrified.has(tileData.tile)) {
               this._notProducing.texture = getTexture("Misc_Bolt", textures);
               this.fadeInTopLeftIcon();
            } else {
               this.fadeOutTopLeftIcon();
            }

            this._spinner.visible = true;
         }
      }
   }

   private fadeOutTopLeftIcon(): void {
      if (this._notProducing.visible) {
         Actions.sequence(
            Actions.to(this._notProducing, { alpha: 0 }, 0.25, Easing.OutQuad),
            Actions.runFunc(() => {
               this._notProducing.visible = false;
            }),
         ).start();
      }
   }

   private fadeInTopLeftIcon(): void {
      if (!this._notProducing.visible) {
         this._notProducing.visible = true;
         this._notProducing.alpha = 0;
         Actions.to(this._notProducing, { alpha: 1 }, 0.25, Easing.InQuad).start();
      }
   }

   private showTimeLeft(tileData: ITileData, gameState: GameState) {
      const { secondsLeft } = getBuildingPercentage(tileData.tile, gameState);
      this._bottomText.text = formatHMS(secondsLeft * 1000);
      this._bottomText.visible = true;
   }

   private toggleConstructionTween(on: boolean) {
      if (on && !this._constructionAnimation.isPlaying()) {
         this._constructionAnimation.start();
      }
      if (!on) {
         this._constructionAnimation.stop();
      }
   }

   private toggleUpgradeTween(on: boolean) {
      if (on && !this._upgradeAnimation.isPlaying()) {
         this._upgradeAnimation.start();
      }
      if (!on) {
         this._upgradeAnimation.stop();
      }
   }

   private updateDepositLayout() {
      if (!this._tile.explored) {
         return;
      }
      let position = v2({ x: 0, y: 0 });
      let scale = 0.25;
      if (this._tile.building) {
         position = v2({ x: 0, y: 28 });
         scale = 0.15;
      }
      const width = scale * 100;

      let total = sizeOf(this._tile.deposit);
      const power = Tick.current.powerGrid.has(this._tile.tile);
      if (power) {
         ++total;
      }

      let i = 0;
      this._deposits.forEach((sprite, res) => {
         if (res === "Power" && !power) {
            sprite.visible = false;
            return;
         }
         sprite.visible = true;
         sprite.position.copyFrom(position.add({ x: layoutCenter(width, 4, total, i++), y: 0 }));
         sprite.scale.set(scale);
      });
   }
}
