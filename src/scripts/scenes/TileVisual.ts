import { Easing, Tween } from "@tweenjs/tween.js";
import { Viewport } from "pixi-viewport";
import { BitmapText, Container, IPointData, Sprite } from "pixi.js";
import { Resource } from "../definitions/ResourceDefinitions";
import { Fonts } from "../generated/FontBundle";
import { getGameState, Singleton } from "../Global";
import { getBuildingLevelLabel, getBuildingTexture, getTileTexture } from "../logic/BuildingLogic";
import { GameState } from "../logic/GameState";
import { ITileData } from "../logic/Tile";
import { clamp, forEach, layoutCenter, pointToXy, sizeOf } from "../utilities/Helper";
import { v2 } from "../utilities/Vector2";
import { WorldScene } from "./WorldScene";

interface IDisposable {
   dispose: () => void;
}

export class TileVisual extends Container implements IDisposable {
   private readonly _world: WorldScene;
   private _fog: Sprite;
   private _spinner: Sprite;
   private _building: Sprite;
   private readonly _grid: IPointData;
   private readonly _deposits: Partial<Record<Resource, Sprite>> = {};
   private readonly _tile: ITileData;
   private readonly _construction: Sprite;
   private readonly _constructionTween: Tween<Sprite>;
   private _constructionTweenPlaying = false;
   private _upgradeTweenPlaying = false;
   private readonly _upgrade: Sprite;
   private readonly _upgradeTween: Tween<Sprite>;
   private readonly _level: BitmapText;

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
      this._constructionTween = new Tween(this._construction).to({ angle: 45 }, 500).easing(Easing.Bounce.Out);
      const tween1 = new Tween(this._construction).to({ angle: 0 }, 500).easing(Easing.Sinusoidal.Out);
      this._constructionTween.chain(tween1);
      tween1.chain(this._constructionTween);

      this._upgrade = this.addChild(new Sprite(textures.Upgrade));
      this._upgrade.position.set(-25, 10);
      this._upgrade.anchor.set(0, 1);
      this._upgrade.scale.set(0.5);
      this._upgrade.alpha = 0;
      this._upgrade.visible = false;
      this._upgradeTween = new Tween(this._upgrade).to({ y: 0, alpha: 1 }, 750).easing(Easing.Sinusoidal.In);
      const tween2 = new Tween(this._upgrade).to({ y: -10, alpha: 0 }, 750).easing(Easing.Sinusoidal.Out);
      this._upgradeTween.chain(tween2);
      tween2.chain(this._upgradeTween);

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

   public dispose() {
      this._world.viewport.off("zoomed-end", this.onZoomed, this);
      this._constructionTween.stop();
      this._upgradeTween.stop();
      this.destroy({ children: true });
   }

   public async reveal(): Promise<TileVisual> {
      this.updateLayout();
      return await new Promise((resolve) => {
         new Tween(this._fog)
            .to({ alpha: 0, scale: { x: 0.8, y: 0.8 } }, 1000)
            .easing(Easing.Quadratic.In)
            .onComplete(() => resolve(this))
            .start();
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
      if (on && !this._constructionTweenPlaying) {
         this._constructionTweenPlaying = true;
         this._constructionTween.start();
      }
      if (!on) {
         this._constructionTweenPlaying = false;
         this._constructionTween.stop();
      }
   }

   private toggleUpgradeTween(on: boolean) {
      if (on && !this._upgradeTweenPlaying) {
         this._upgradeTweenPlaying = true;
         this._upgradeTween.start();
      }
      if (!on) {
         this._upgradeTweenPlaying = false;
         this._upgradeTween.stop();
      }
   }
}
