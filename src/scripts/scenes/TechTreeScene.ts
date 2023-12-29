import { SmoothGraphics } from "@pixi/graphics-smooth";
import type { ColorSource, FederatedPointerEvent } from "pixi.js";
import { BitmapText, Color, Container, LINE_CAP, LINE_JOIN, Rectangle } from "pixi.js";
import { getGameOptions } from "../Global";
import type { ITechDefinition } from "../definitions/ITechDefinition";
import type { Tech } from "../definitions/TechDefinitions";
import { Config } from "../logic/Config";
import type { GameOptions } from "../logic/GameState";
import { isAgeUnlocked, unlockableTechs } from "../logic/TechLogic";
import { TechPage } from "../ui/TechPage";
import { WheelMode } from "../utilities/Camera";
import { forEach, sizeOf } from "../utilities/Helper";
import { ViewportScene, destroyAllChildren } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import { Actions } from "../utilities/pixi-actions/Actions";
import { Easing } from "../utilities/pixi-actions/Easing";
import { Fonts } from "../visuals/Fonts";

const BOX_WIDTH = 300;
const BOX_HEIGHT = 100;
const COLUMN_WIDTH = 500;
const PAGE_HEIGHT = 1000;
const HEADER_TOTAL_HEIGHT = 160;
const HEADER_BOX_HEIGHT = 70;

const LINE_STYLE = {
   width: 2,
   cap: LINE_CAP.ROUND,
   join: LINE_JOIN.ROUND,
   alignment: 0.5,
};

type AnimateType = "animate" | "jump" | "no";

export class TechTreeScene extends ViewportScene {
   private _selectedContainer: Container | undefined;
   private _selectedGraphics: SmoothGraphics | undefined;
   private _boxPositions: Partial<Record<Tech, Rectangle>> = {};
   private _selectedTech: Tech | undefined;
   private _layout: Record<number, Tech[]> = [];

   override onLoad(): void {
      const { app, gameState } = this.context;
      forEach(Config.Tech, (k, v) => {
         if (this._layout[v.column]) {
            this._layout[v.column].push(k);
         } else {
            this._layout[v.column] = [k];
         }
      });

      const width = sizeOf(this._layout) * COLUMN_WIDTH;

      this.viewport.setWorldSize(width, PAGE_HEIGHT);
      this.viewport.zoom = Math.max(app.screen.width / width, app.screen.height / (PAGE_HEIGHT * 1.05));
      this.viewport.wheelMode = WheelMode.HorizontalScroll;

      app.renderer.background.color = getGameOptions().themeColors.ResearchBackground;

      this.viewport.on("clicked", (e: FederatedPointerEvent) => {
         const pos = this.viewport.screenToWorld(e);
         forEach(this._boxPositions, (k, v) => {
            if (v?.contains(pos.x, pos.y)) {
               this.selectNode(k, "no", true);
               return true;
            }
            return false;
         });
      });

      this.renderTechTree("jump", true);
   }

   override onGameOptionsChanged(gameOptions: GameOptions): void {
      this.context.app.renderer.background.color = gameOptions.themeColors.ResearchBackground;
      this.renderTechTree("jump", false);
   }

   override onDestroy(): void {
      Actions.clear(this);
      this.viewport.destroy({ children: true });
   }

   private getTechDescription(def: ITechDefinition): string {
      const deposits = def.revealDeposit?.map((d) => Config.Resource[d].name()) ?? [];
      const buildings = def.unlockBuilding?.map((b) => Config.Building[b].name()) ?? [];
      const desc = deposits.concat(buildings.concat()).join(", ") ?? null;
      return desc;
   }

   public renderTechTree(cutTo: AnimateType, route: boolean): void {
      if (!this.viewport) {
         return;
      }
      const unlockedColor = Color.shared
         .setValue(getGameOptions().themeColors.ResearchUnlockedColor)
         .toNumber();
      const lockedColor = Color.shared.setValue(getGameOptions().themeColors.ResearchLockedColor).toNumber();
      destroyAllChildren(this.viewport);
      const g = new SmoothGraphics();
      this.viewport.addChild(g).lineStyle(LINE_STYLE);
      this._selectedGraphics = this.viewport.addChild(new SmoothGraphics());
      this._boxPositions = {};
      forEach(this._layout, (columnIdx, techs) => {
         const height = (PAGE_HEIGHT - HEADER_TOTAL_HEIGHT) / techs.length;
         techs.forEach((item, rowIdx) => {
            const x = 50 + 500 * columnIdx;
            const y =
               height * rowIdx +
               HEADER_TOTAL_HEIGHT +
               (height / 2 - BOX_HEIGHT / 2 - (HEADER_TOTAL_HEIGHT - HEADER_BOX_HEIGHT) / 2);
            const rect = new Rectangle(x, y, BOX_WIDTH, BOX_HEIGHT);
            this._boxPositions[item] = rect;
            const def = Config.Tech[item];
            this.drawBox(
               g,
               rect,
               def.name(),
               this.getTechDescription(def),
               this.context.gameState.unlockedTech[item] ? unlockedColor : lockedColor,
            );
         });
      });

      forEach(Config.TechAge, (k, v) => {
         this.drawHeader(
            g,
            v.from,
            v.to,
            v.name(),
            isAgeUnlocked(k, this.context.gameState) ? unlockedColor : lockedColor,
         );
      });

      forEach(Config.Tech, (to, v) => {
         v.requireTech.forEach((from) => {
            this.drawConnection(
               g,
               this._boxPositions[from]!.x + BOX_WIDTH,
               this._boxPositions[from]!.y + BOX_HEIGHT / 2,
               this._boxPositions[to]!.x,
               this._boxPositions[to]!.y + BOX_HEIGHT / 2,
               this.context.gameState.unlockedTech[from] || this.context.gameState.unlockedTech[to]
                  ? unlockedColor
                  : lockedColor,
            );
         });
      });

      this._selectedContainer = this.viewport.addChild(new Container());
      this.selectNode(this._selectedTech, cutTo, route);
   }

   public selectNode(tech_: Tech | undefined, cutToTech: AnimateType, route: boolean): void {
      if (this._selectedContainer) {
         destroyAllChildren(this._selectedContainer);
      }
      this._selectedGraphics?.clear();
      const tech = tech_ ?? unlockableTechs(this.context.gameState)[0];
      if (!tech) {
         return;
      }
      const highlightColor = Color.shared
         .setValue(getGameOptions().themeColors.ResearchHighlightColor)
         .toNumber();
      this._selectedTech = tech;
      if (route) {
         Singleton().routeTo(TechPage, { id: tech });
      }
      this._selectedGraphics?.lineStyle(LINE_STYLE);
      let targets = [tech];
      const drawnBoxes: Partial<Record<string, true>> = {};
      const drawnConnections: Record<string, true> = {};
      while (targets.length > 0) {
         const newTo: Tech[] = [];
         targets.forEach((to) => {
            if (!drawnBoxes[to] && (!this.context.gameState.unlockedTech[to] || to === tech)) {
               const def = Config.Tech[to];
               this.drawBox(
                  this._selectedGraphics!,
                  this._boxPositions[to]!,
                  def.name(),
                  this.getTechDescription(def),
                  highlightColor,
                  10,
                  this._selectedContainer,
               );
               drawnBoxes[to] = true;
            }
            Config.Tech[to].requireTech.forEach((from) => {
               newTo.push(from);
               const key = `${from} -> ${to}`;
               if (
                  !drawnConnections[key] &&
                  !this.context.gameState.unlockedTech[from] &&
                  !this.context.gameState.unlockedTech[to]
               ) {
                  this.drawConnection(
                     this._selectedGraphics!,
                     this._boxPositions[from]!.x + BOX_WIDTH,
                     this._boxPositions[from]!.y + BOX_HEIGHT / 2,
                     this._boxPositions[to]!.x,
                     this._boxPositions[to]!.y + BOX_HEIGHT / 2,
                     highlightColor,
                  );
                  drawnConnections[key] = true;
               }
            });
         });
         targets = newTo;
      }
      const target = this._boxPositions[tech]
         ? this._boxPositions[tech]!.x + BOX_WIDTH / 2
         : this.viewport.center.x;
      if (cutToTech === "animate") {
         Actions.to<TechTreeScene>(this, { scrollX: target }, 0.5, Easing.InOutQuad).start();
      } else if (cutToTech === "jump") {
         this.scrollX = target;
      }
   }

   public get scrollX(): number {
      return this.viewport.center.x;
   }

   public set scrollX(value: number) {
      this.viewport.center = { x: value, y: this.viewport.center.y };
   }

   private drawConnection(
      g: SmoothGraphics,
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      color: ColorSource,
   ): void {
      g.moveTo(fromX, fromY);
      const oldColor = g.line.color;
      g.lineStyle({ ...g.line, color });
      g.bezierCurveTo((fromX + toX) / 2, fromY, (fromX + toX) / 2, toY, toX, toY);
      g.lineStyle({ ...g.line, color: oldColor });
   }

   private drawHeader(
      g: SmoothGraphics,
      startColumn: number,
      endColumn: number,
      text: string,
      color: ColorSource,
   ): void {
      this.drawBox(
         g,
         new Rectangle(
            50 + startColumn * COLUMN_WIDTH,
            (HEADER_TOTAL_HEIGHT - HEADER_BOX_HEIGHT) / 2,
            COLUMN_WIDTH * (endColumn - startColumn) + BOX_WIDTH,
            HEADER_BOX_HEIGHT,
         ),
         text.toUpperCase(),
         null,
         color,
      );
   }

   private drawBox(
      g: SmoothGraphics,
      rect: Rectangle,
      title: string,
      description: string | null,
      color: ColorSource,
      radius = 10,
      parent_: Container | null = null,
   ): void {
      const oldColor = g.line.color;
      const parent = parent_ ?? g.parent;
      g.lineStyle({ ...g.line, color });
      g.drawRoundedRect(rect.x, rect.y, rect.width, rect.height, radius);
      g.lineStyle({ ...g.line, color: oldColor });
      const bitmapText = parent.addChild(
         new BitmapText(title, {
            fontName: Fonts.Marcellus,
            fontSize: 28,
            tint: color,
         }),
      );
      bitmapText.anchor.x = 0.5;
      bitmapText.anchor.y = 0.5;
      bitmapText.x = rect.x + rect.width / 2;
      bitmapText.y = rect.y + rect.height / (description ? 3 : 2);
      bitmapText.cullable = true;

      if (description) {
         const bitmapText = parent.addChild(
            new BitmapText(description, {
               fontName: Fonts.Marcellus,
               tint: color,
            }),
         );

         bitmapText.fontSize = 18;
         while (bitmapText.width > rect.width - 20) {
            bitmapText.fontSize--;
         }

         bitmapText.anchor.x = 0.5;
         bitmapText.anchor.y = 0.5;
         bitmapText.x = rect.x + rect.width / 2;
         bitmapText.y = rect.y + (rect.height * 2) / 3;
         bitmapText.cullable = true;
      }
   }
}
