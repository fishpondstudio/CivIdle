import { SmoothGraphics } from "@pixi/graphics-smooth";
import type { ColorSource, FederatedPointerEvent } from "pixi.js";
import { BitmapText, Color, Container, LINE_CAP, LINE_JOIN, NineSlicePlane, Rectangle, Text } from "pixi.js";
import type { ITechDefinition } from "../../../shared/definitions/ITechDefinition";
import type { Tech } from "../../../shared/definitions/TechDefinitions";
import { Config } from "../../../shared/logic/Config";
import type { GameOptions } from "../../../shared/logic/GameState";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import { getCurrentAge, isAgeUnlocked, unlockableTechs } from "../../../shared/logic/TechLogic";
import {
   containsNonASCII,
   forEach,
   layoutSpaceBetween,
   numberToRoman,
   sizeOf,
} from "../../../shared/utilities/Helper";
import { TechPage } from "../ui/TechPage";
import { getColorCached } from "../utilities/CachedColor";
import { WheelMode } from "../utilities/Camera";
import { Scene, destroyAllChildren, type ISceneContext } from "../utilities/SceneManager";
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
const FOOTER_SPACE = 60;

const LINE_STYLE = {
   width: 2,
   cap: LINE_CAP.ROUND,
   join: LINE_JOIN.ROUND,
   alignment: 0.5,
};

type AnimateType = "animate" | "jump" | "no";

export class TechTreeScene extends Scene {
   private _selectedContainer: Container | undefined;
   private _selectedGraphics: SmoothGraphics | undefined;
   private _boxPositions: Partial<Record<Tech, Rectangle>> = {};
   private _selectedTech: Tech | undefined;
   private _layout: Record<number, Tech[]> = [];

   constructor(context: ISceneContext) {
      super(context);

      const { app } = context;

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
      this.viewport.setZoomRange(this.viewport.zoom * 0.5, this.viewport.zoom * 1.5);
      this.viewport.wheelMode = WheelMode.HorizontalScroll;
   }

   override backgroundColor(): ColorSource {
      return getGameOptions().themeColors.ResearchBackground;
   }

   override onEnable(): void {
      this.renderTechTree("jump", true);
      super.onEnable();
   }

   override onClicked(e: FederatedPointerEvent): void {
      const pos = this.viewport.screenToWorld(e);
      forEach(this._boxPositions, (k, v) => {
         if (v?.contains(pos.x, pos.y)) {
            this.selectNode(k, "no", true);
            return true;
         }
         return false;
      });
   }

   override onDisable(): void {
      super.onDisable();
      Actions.clear(this);
   }

   override onGameOptionsChanged(gameOptions: GameOptions): void {
      this.setBackgroundColor(gameOptions.themeColors.ResearchBackground);
      this.renderTechTree("jump", false);
   }

   private getTechDescription(def: ITechDefinition): string {
      const deposits = def.revealDeposit?.map((d) => Config.Material[d].name()) ?? [];
      const buildings = def.unlockBuilding?.map((b) => Config.Building[b].name()) ?? [];
      const full = deposits.concat(buildings.concat());
      if (def.column === Config.Tech.Future.column) {
         return full.join("\n");
      }
      return full.join(", ");
   }

   public renderTechTree(cutTo: AnimateType, route: boolean): void {
      if (!this.viewport) {
         return;
      }
      const unlockedColor = Color.shared
         .setValue(getGameOptions().themeColors.ResearchUnlockedColor)
         .toNumber();
      const lockedColor = getColorCached(getGameOptions().themeColors.ResearchLockedColor).toNumber();
      destroyAllChildren(this.viewport);
      const g = new SmoothGraphics();
      this.viewport.addChild(g).lineStyle(LINE_STYLE);
      this._selectedGraphics = this.viewport.addChild(new SmoothGraphics());
      this._boxPositions = {};
      forEach(this._layout, (columnIdx, techs) => {
         techs.forEach((item, rowIdx) => {
            const x = 50 + 500 * columnIdx;
            const height = item === "Future" ? 150 : BOX_HEIGHT;
            const y =
               layoutSpaceBetween(
                  height,
                  PAGE_HEIGHT - HEADER_TOTAL_HEIGHT - FOOTER_SPACE,
                  techs.length,
                  rowIdx,
               ) + HEADER_TOTAL_HEIGHT;
            const rect = new Rectangle(x, y, BOX_WIDTH, height);
            this._boxPositions[item] = rect;
            const def = Config.Tech[item];
            this.drawBox(
               rect,
               def.name(),
               this.getTechDescription(def),
               this.context.gameState.unlockedTech[item] ? unlockedColor : lockedColor,
               null,
               false,
            );
         });
      });

      const currentAge = Config.TechAge[getCurrentAge(this.context.gameState)];

      forEach(Config.TechAge, (k, v) => {
         this.drawHeader(
            v.from,
            v.to,
            `${numberToRoman(v.idx + 1)}.  ${v.name()}`,
            isAgeUnlocked(k, this.context.gameState) ? unlockedColor : lockedColor,
            v.idx <= currentAge.idx,
         );
      });

      forEach(Config.Tech, (to, v) => {
         v.requireTech.forEach((from) => {
            this.drawConnection(
               g,
               this._boxPositions[from]!.x + BOX_WIDTH,
               this._boxPositions[from]!.y + this._boxPositions[from]!.height / 2,
               this._boxPositions[to]!.x,
               this._boxPositions[to]!.y + this._boxPositions[to]!.height / 2,
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
      let tech = tech_;

      if (!tech) {
         tech = unlockableTechs(this.context.gameState)[0];
      }

      if (!tech) {
         tech = "Future";
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
      const drawnBoxes = new Set<Tech>();
      const drawnConnections = new Set<string>();
      while (targets.length > 0) {
         const newTo: Tech[] = [];
         targets.forEach((to) => {
            if (drawnBoxes.has(to)) {
               return;
            }

            if (this.context.gameState.unlockedTech[to] && to !== tech) {
               return;
            }

            const def = Config.Tech[to];
            this.drawBox(
               this._boxPositions[to]!,
               def.name(),
               this.getTechDescription(def),
               highlightColor,
               this._selectedContainer,
               to === tech,
            );
            drawnBoxes.add(to);
            Config.Tech[to].requireTech.forEach((from) => {
               if (!this.context.gameState.unlockedTech[to]) {
                  newTo.push(from);
               }
               const key = `${from} -> ${to}`;
               if (
                  !drawnConnections.has(key) &&
                  !this.context.gameState.unlockedTech[from] &&
                  !this.context.gameState.unlockedTech[to]
               ) {
                  this.drawConnection(
                     this._selectedGraphics!,
                     this._boxPositions[from]!.x + this._boxPositions[from]!.width,
                     this._boxPositions[from]!.y + this._boxPositions[from]!.height / 2,
                     this._boxPositions[to]!.x,
                     this._boxPositions[to]!.y + this._boxPositions[to]!.height / 2,
                     highlightColor,
                  );
                  drawnConnections.add(key);
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
      startColumn: number,
      endColumn: number,
      text: string,
      color: ColorSource,
      fancy: boolean,
   ): void {
      this.drawBox(
         new Rectangle(
            50 + startColumn * COLUMN_WIDTH,
            (HEADER_TOTAL_HEIGHT - HEADER_BOX_HEIGHT) / 2,
            COLUMN_WIDTH * (endColumn - startColumn) + BOX_WIDTH,
            HEADER_BOX_HEIGHT,
         ),
         text.toUpperCase(),
         null,
         color,
         null,
         fancy,
      );
   }

   private drawBox(
      rect: Rectangle,
      title: string,
      description: string | null,
      color: ColorSource,
      parent_: Container | null = null,
      fancy = false,
   ): void {
      const parent = parent_ ?? this.viewport;

      const frame = parent.addChild(
         fancy
            ? new NineSlicePlane(this.context.textures.Misc_FrameSelected, 55, 55, 55, 55)
            : new NineSlicePlane(this.context.textures.Misc_Frame, 55, 55, 55, 55),
      );

      frame.width = rect.width + 30;
      frame.height = rect.height + 30;
      frame.x = rect.x - 15;
      frame.y = rect.y - 15;
      frame.tint = color;

      const bitmapText = parent.addChild(this.drawText(title, color, 28, rect.width - 20));
      bitmapText.anchor.x = 0.5;
      bitmapText.anchor.y = 0.5;
      bitmapText.x = rect.x + rect.width / 2;
      if (description) {
         if (description.includes("\n")) {
            bitmapText.y = rect.y + rect.height / 4;
         } else {
            bitmapText.y = rect.y + rect.height / 3;
         }
      } else {
         bitmapText.y = rect.y + rect.height / 2;
      }
      bitmapText.cullable = true;

      if (description) {
         const bitmapText = parent.addChild(this.drawText(description, color, 18, rect.width - 20));
         bitmapText.anchor.x = 0.5;
         bitmapText.anchor.y = 0.5;
         bitmapText.x = rect.x + rect.width / 2;
         bitmapText.y = rect.y + (rect.height * 2) / 3;
         bitmapText.cullable = true;
      }
   }

   private drawText(text: string, color: ColorSource, size: number, maxWidth: number): Text | BitmapText {
      if (containsNonASCII(text)) {
         const result = new Text(text, {
            fontFamily: "serif",
            fontSize: size,
            fill: getColorCached(color).toHex(),
            align: "center",
         });

         while (result.width > maxWidth) {
            result.style.fontSize = (result.style.fontSize as number) - 1;
         }
         return result;
      }

      const result = new BitmapText(text, {
         fontName: Fonts.Platypi,
         fontSize: size,
         tint: color,
         align: "center",
      });

      while (result.width > maxWidth) {
         result.fontSize--;
      }
      return result;
   }
}
