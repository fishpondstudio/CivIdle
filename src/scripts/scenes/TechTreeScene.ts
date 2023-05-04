import { SmoothGraphics } from "@pixi/graphics-smooth";
import { BitmapText, Container, LINE_CAP, LINE_JOIN, Rectangle } from "pixi.js";
import { BG_COLOR } from "../Colors";
import { Singleton } from "../Global";
import { getTechTree, isAgeUnlocked, unlockableTechs } from "../logic/TechLogic";
import { TechPage } from "../ui/TechPage";
import { forEach } from "../utilities/Helper";
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
   private _boxPositions: Partial<Record<string, Rectangle>> = {};
   private _selectedTech: string | undefined;
   private _layout: string[][] = [];

   override onLoad(): void {
      const { app, gameState } = this.context;
      const techTree = getTechTree(gameState);
      forEach(techTree.definitions, (k, v) => {
         if (this._layout[v.column]) {
            this._layout[v.column].push(k);
         } else {
            this._layout[v.column] = [k];
         }
      });

      const width = this._layout.length * COLUMN_WIDTH;

      this.viewport.worldWidth = width;
      this.viewport.worldHeight = PAGE_HEIGHT;

      app.renderer.backgroundColor = BG_COLOR;
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
      this.viewport.destroy({ children: true });
   }

   public renderTechTree(cutTo: AnimateType): void {
      if (!this.viewport) {
         return;
      }
      const techTree = getTechTree(this.context.gameState);
      this.viewport.removeChildren();
      const g = new SmoothGraphics();
      this.viewport.addChild(g).lineStyle(LINE_STYLE);
      this.viewport.addChild(this._selectedGraphics);
      this._boxPositions = {};
      this._layout.forEach((column, columnIdx) => {
         const height = (PAGE_HEIGHT - HEADER_TOTAL_HEIGHT) / column.length;
         column.forEach((item, rowIdx) => {
            const x = 50 + 500 * columnIdx;
            const y =
               height * rowIdx +
               HEADER_TOTAL_HEIGHT +
               (height / 2 - BOX_HEIGHT / 2 - (HEADER_TOTAL_HEIGHT - HEADER_BOX_HEIGHT) / 2);
            const rect = new Rectangle(x, y, BOX_WIDTH, BOX_HEIGHT);
            this._boxPositions[item] = rect;
            this.viewport.addChild(
               this.drawBox(
                  g,
                  rect,
                  techTree.definitions[item].name(),
                  this.context.gameState.unlocked[item] ? UNLOCKED_COLOR : LOCKED_COLOR
               )
            );
         });
      });

      forEach(techTree.ages, (k, v) => {
         this.viewport.addChild(
            this.drawHeader(
               g,
               v.from,
               v.to,
               v.name(),
               isAgeUnlocked(k, this.context.gameState) ? UNLOCKED_COLOR : LOCKED_COLOR
            )
         );
      });

      forEach(techTree.definitions, (to, v) => {
         v.require.forEach((from) => {
            this.drawConnection(
               g,
               this._boxPositions[from]!.x + BOX_WIDTH,
               this._boxPositions[from]!.y + BOX_HEIGHT / 2,
               this._boxPositions[to]!.x,
               this._boxPositions[to]!.y + BOX_HEIGHT / 2,
               this.context.gameState.unlocked[from] || this.context.gameState.unlocked[to]
                  ? UNLOCKED_COLOR
                  : LOCKED_COLOR
            );
         });
      });

      this._selectedContainer = this.viewport.addChild(new Container());
      this.selectNode(this._selectedTech, cutTo);
   }

   public selectNode(tech: string | undefined, cutToTech: AnimateType): void {
      this._selectedContainer!.removeChildren();
      this._selectedGraphics.clear();
      tech = tech ?? unlockableTechs(this.context.gameState)[0];
      if (!tech) {
         return;
      }
      const techTree = getTechTree(this.context.gameState);
      this._selectedTech = tech;
      Singleton().routeTo(TechPage, { id: tech });
      this._selectedGraphics.lineStyle(LINE_STYLE);
      let targets = [tech];
      const drawnBoxes: Partial<Record<string, true>> = {};
      const drawnConnections: Record<string, true> = {};
      while (targets.length > 0) {
         const newTo: string[] = [];
         targets.forEach((to) => {
            if (!drawnBoxes[to] && (!this.context.gameState.unlocked[to] || to === tech)) {
               this._selectedContainer!.addChild(
                  this.drawBox(
                     this._selectedGraphics,
                     this._boxPositions[to]!,
                     techTree.definitions[to].name(),
                     HIGHLIGHT_COLOR
                  )
               );
               drawnBoxes[to] = true;
            }
            techTree.definitions[to].require.forEach((from) => {
               newTo.push(from);
               const key = `${from} -> ${to}`;
               // rome-ignore lint: bad suggestions
               if (
                  !drawnConnections[key] &&
                  !this.context.gameState.unlocked[from] &&
                  !this.context.gameState.unlocked[to]
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

   private drawHeader(
      g: SmoothGraphics,
      startColumn: number,
      endColumn: number,
      text: string,
      color: number
   ): BitmapText {
      return this.drawBox(
         g,
         new Rectangle(
            50 + startColumn * COLUMN_WIDTH,
            (HEADER_TOTAL_HEIGHT - HEADER_BOX_HEIGHT) / 2,
            COLUMN_WIDTH * (endColumn - startColumn) + BOX_WIDTH,
            HEADER_BOX_HEIGHT
         ),
         text.toUpperCase(),
         color
      );
   }

   private drawBox(g: SmoothGraphics, rect: Rectangle, text: string, color: number, radius = 10): BitmapText {
      const oldColor = g.line.color;
      g.lineStyle({ ...g.line, color });
      g.drawRoundedRect(rect.x, rect.y, rect.width, rect.height, radius);
      g.lineStyle({ ...g.line, color: oldColor });
      const bitmapText = new BitmapText(text, {
         fontName: Fonts.Marcellus,
         fontSize: 28,
         tint: color,
      });
      bitmapText.anchor.x = 0.5;
      bitmapText.anchor.y = 0.5;
      bitmapText.x = rect.x + rect.width / 2;
      bitmapText.y = rect.y + rect.height / 2;
      bitmapText.cullable = true;
      return bitmapText;
   }
}
