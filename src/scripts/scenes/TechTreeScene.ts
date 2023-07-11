import { SmoothGraphics } from "@pixi/graphics-smooth";
import { BitmapText, Container, LINE_CAP, LINE_JOIN, Rectangle } from "pixi.js";
import { BG_COLOR } from "../Colors";
import { ITechDefinition } from "../definitions/ITechDefinition";
import { Tech, TechAge } from "../definitions/TechDefinitions";
import { Singleton } from "../Global";
import { isAgeUnlocked, unlockableTechs } from "../logic/TechLogic";
import { Tick } from "../logic/TickLogic";
import { TechPage } from "../ui/TechPage";
import { forEach, sizeOf } from "../utilities/Helper";
import Actions from "../utilities/pixi-actions/Actions";
import { Easing } from "../utilities/pixi-actions/Easing";
import { ViewportScene } from "../utilities/SceneManager";
import { Fonts } from "../visuals/Fonts";

const BOX_WIDTH = 300;
const BOX_HEIGHT = 100;
const COLUMN_WIDTH = 500;
const PAGE_HEIGHT = 1000;
const HEADER_TOTAL_HEIGHT = 160;
const HEADER_BOX_HEIGHT = 70;

const LOCKED_COLOR = 0xbebebe;
const UNLOCKED_COLOR = 0xffffff;
const HIGHLIGHT_COLOR = 0xffff99;
const LINE_STYLE = {
   width: 2,
   cap: LINE_CAP.ROUND,
   join: LINE_JOIN.ROUND,
   alignment: 0.5,
};

type AnimateType = "animate" | "jump" | "no";

export class TechTreeScene extends ViewportScene {
   private _selectedContainer: Container | undefined;
   private readonly _selectedGraphics = new SmoothGraphics();
   private _boxPositions: Partial<Record<Tech, Rectangle>> = {};
   private _selectedTech: Tech | undefined;
   private _layout: Record<number, Tech[]> = [];

   override onLoad(): void {
      const { app, gameState } = this.context;
      forEach(Tech, (k, v) => {
         if (this._layout[v.column]) {
            this._layout[v.column].push(k);
         } else {
            this._layout[v.column] = [k];
         }
      });

      const width = sizeOf(this._layout) * COLUMN_WIDTH;

      this.viewport.worldWidth = width;
      this.viewport.worldHeight = PAGE_HEIGHT;

      app.renderer.background.color = BG_COLOR;
      app.renderer.plugins.interaction.moveWhenInside = true;

      const preferredZoom = Math.max(app.screen.width / width, app.screen.height / PAGE_HEIGHT);
      this.viewport
         .drag()
         .wheel({ smooth: 10 })
         .clamp({
            direction: "all",
         })
         .clampZoom({
            maxScale: preferredZoom,
            minScale: preferredZoom / 5,
         });

      this.viewport.on("clicked", (e) => {
         const pos = e.world;
         forEach(this._boxPositions, (k, v) => {
            if (v?.contains(pos.x, pos.y)) {
               this.selectNode(k, "no");
               return true;
            }
            return false;
         });
      });

      this.renderTechTree("jump");
      this.viewport.setZoom(Math.max(app.screen.width / width, app.screen.height / PAGE_HEIGHT));
   }

   override onDestroy(): void {
      Actions.clear(this);
      this.viewport.destroy({ children: true });
   }

   private getTechDescription(def: ITechDefinition): string {
      const deposits = def.revealDeposit?.map((d) => Tick.current.resources[d].name()) ?? [];
      const buildings = def.unlockBuilding?.map((b) => Tick.current.buildings[b].name()) ?? [];
      const desc = deposits.concat(buildings.concat()).join(", ") ?? null;
      return desc;
   }

   public renderTechTree(cutTo: AnimateType): void {
      if (!this.viewport) {
         return;
      }
      this.viewport.removeChildren();
      const g = new SmoothGraphics();
      this.viewport.addChild(g).lineStyle(LINE_STYLE);
      this.viewport.addChild(this._selectedGraphics);
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
            const def = Tech[item];
            this.drawBox(
               g,
               rect,
               def.name(),
               this.getTechDescription(def),
               this.context.gameState.unlockedTech[item] ? UNLOCKED_COLOR : LOCKED_COLOR
            );
         });
      });

      forEach(TechAge, (k, v) => {
         this.drawHeader(
            g,
            v.from,
            v.to,
            v.name(),
            isAgeUnlocked(k, this.context.gameState) ? UNLOCKED_COLOR : LOCKED_COLOR
         );
      });

      forEach(Tech, (to, v) => {
         v.requireTech.forEach((from) => {
            this.drawConnection(
               g,
               this._boxPositions[from]!.x + BOX_WIDTH,
               this._boxPositions[from]!.y + BOX_HEIGHT / 2,
               this._boxPositions[to]!.x,
               this._boxPositions[to]!.y + BOX_HEIGHT / 2,
               this.context.gameState.unlockedTech[from] || this.context.gameState.unlockedTech[to]
                  ? UNLOCKED_COLOR
                  : LOCKED_COLOR
            );
         });
      });

      this._selectedContainer = this.viewport.addChild(new Container());
      this.selectNode(this._selectedTech, cutTo);
   }

   public selectNode(tech: Tech | undefined, cutToTech: AnimateType): void {
      this._selectedContainer!.removeChildren();
      this._selectedGraphics.clear();
      tech = tech ?? unlockableTechs(this.context.gameState)[0];
      if (!tech) {
         return;
      }
      this._selectedTech = tech;
      Singleton().routeTo(TechPage, { id: tech });
      this._selectedGraphics.lineStyle(LINE_STYLE);
      let targets = [tech];
      const drawnBoxes: Partial<Record<string, true>> = {};
      const drawnConnections: Record<string, true> = {};
      while (targets.length > 0) {
         const newTo: Tech[] = [];
         targets.forEach((to) => {
            if (!drawnBoxes[to] && (!this.context.gameState.unlockedTech[to] || to === tech)) {
               const def = Tech[to];
               this.drawBox(
                  this._selectedGraphics,
                  this._boxPositions[to]!,
                  def.name(),
                  this.getTechDescription(def),
                  HIGHLIGHT_COLOR,
                  10,
                  this._selectedContainer
               );
               drawnBoxes[to] = true;
            }
            Tech[to].requireTech.forEach((from) => {
               newTo.push(from);
               const key = `${from} -> ${to}`;
               if (
                  !drawnConnections[key] &&
                  !this.context.gameState.unlockedTech[from] &&
                  !this.context.gameState.unlockedTech[to]
               ) {
                  this.drawConnection(
                     this._selectedGraphics,
                     this._boxPositions[from]!.x + BOX_WIDTH,
                     this._boxPositions[from]!.y + BOX_HEIGHT / 2,
                     this._boxPositions[to]!.x,
                     this._boxPositions[to]!.y + BOX_HEIGHT / 2,
                     HIGHLIGHT_COLOR
                  );
                  drawnConnections[key] = true;
               }
            });
         });
         targets = newTo;
      }
      const targetX = this._boxPositions[tech]?.x ?? this.viewport.center.x;
      if (cutToTech === "animate") {
         Actions.to<TechTreeScene>(this, { scrollX: targetX }, 0.5, Easing.InOutQuad).play();
      } else if (cutToTech === "jump") {
         this.scrollX = targetX;
      }
   }

   public get scrollX(): number {
      return this.viewport.center.x;
   }

   public set scrollX(value: number) {
      this.viewport.moveCenter(value, this.viewport.center.y);
   }

   private drawConnection(
      g: SmoothGraphics,
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      color: number
   ): void {
      g.moveTo(fromX, fromY);
      const oldColor = g.line.color;
      g.lineStyle({ ...g.line, color });
      g.bezierCurveTo((fromX + toX) / 2, fromY, (fromX + toX) / 2, toY, toX, toY);
      g.lineStyle({ ...g.line, color: oldColor });
   }

   private drawHeader(g: SmoothGraphics, startColumn: number, endColumn: number, text: string, color: number): void {
      this.drawBox(
         g,
         new Rectangle(
            50 + startColumn * COLUMN_WIDTH,
            (HEADER_TOTAL_HEIGHT - HEADER_BOX_HEIGHT) / 2,
            COLUMN_WIDTH * (endColumn - startColumn) + BOX_WIDTH,
            HEADER_BOX_HEIGHT
         ),
         text.toUpperCase(),
         null,
         color
      );
   }

   private drawBox(
      g: SmoothGraphics,
      rect: Rectangle,
      title: string,
      description: string | null,
      color: number,
      radius = 10,
      parent: Container | null = null
   ): void {
      const oldColor = g.line.color;
      parent = parent ?? g.parent;
      g.lineStyle({ ...g.line, color });
      g.drawRoundedRect(rect.x, rect.y, rect.width, rect.height, radius);
      g.lineStyle({ ...g.line, color: oldColor });
      const bitmapText = parent.addChild(
         new BitmapText(title, {
            fontName: Fonts.Marcellus,
            fontSize: 28,
            tint: color,
         })
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
               fontSize: 18,
               tint: color,
            })
         );
         bitmapText.anchor.x = 0.5;
         bitmapText.anchor.y = 0.5;
         bitmapText.x = rect.x + rect.width / 2;
         bitmapText.y = rect.y + (rect.height * 2) / 3;
         bitmapText.cullable = true;
      }
   }
}
