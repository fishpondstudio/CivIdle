import { SmoothGraphics } from "@pixi/graphics-smooth";
import { BitmapText, Container, IPointData, LINE_CAP, LINE_JOIN } from "pixi.js";
import { Building } from "../definitions/BuildingDefinitions";
import { Resource } from "../definitions/ResourceDefinitions";
import { Config } from "../logic/Constants";
import { DebugPage } from "../ui/DebugPage";
import { forEach, sizeOf } from "../utilities/Helper";
import { ViewportScene } from "../utilities/SceneManager";
import { Singleton } from "../utilities/Singleton";
import { Fonts } from "../visuals/Fonts";

const MaxX = 200;
const MaxY = 200;
const GridSize = 50;

export class FlowGraphScene extends ViewportScene {
   override onLoad(): void {
      const { app, textures } = this.context;

      this.viewport.worldWidth = MaxX * GridSize;
      this.viewport.worldHeight = MaxY * GridSize;

      this.viewport
         .drag()
         .wheel({ smooth: 10 })
         .clamp({
            direction: "all",
         })
         .clampZoom({
            maxScale: 1,
            minScale: Math.max(
               app.screen.width / this.viewport.worldWidth,
               app.screen.height / this.viewport.worldHeight,
            ),
         });

      app.renderer.background.color = 0xeeeeee;

      const graphics = this.viewport.addChild(new SmoothGraphics()).lineStyle({
         color: 0xdddddd,
         width: 1,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
         alignment: 0.5,
      });

      for (let x = 0; x <= MaxX; x++) {
         graphics.moveTo(x * GridSize, 0);
         graphics.lineTo(x * GridSize, MaxY * GridSize);
      }

      for (let y = 0; y <= MaxY; y++) {
         graphics.moveTo(0, y * GridSize);
         graphics.lineTo(MaxX * GridSize, y * GridSize);
      }

      const flourMill = new BuildingCard("FlourMill");
      this.viewport.addChild(flourMill).position.set(100, 200);
      const pizzeria = new BuildingCard("Bakery");
      pizzeria.interactive = true;
      this.viewport.addChild(pizzeria).position.set(500, 100);
      this.viewport.addChild(new BuildingCard("SiegeWorkshop")).position.set(900, 100);

      const connections = this.viewport.addChild(new SmoothGraphics());

      drawConnection(
         connections,
         flourMill.getPortPosition("Flour")!,
         pizzeria.getPortPosition("Flour")!,
         0xbbbbbb,
         4,
      );

      this.viewport.on("card-moved", () => {
         connections.clear();
         drawConnection(
            connections,
            flourMill.getPortPosition("Flour")!,
            pizzeria.getPortPosition("Flour")!,
            0xbbbbbb,
            4,
         );
      });

      Singleton().routeTo(DebugPage, {});
   }
}

function drawConnection(g: SmoothGraphics, from: IPointData, to: IPointData, color: number, width: number) {
   g.lineStyle({
      color: 0x666666,
      width: 3,
      cap: LINE_CAP.ROUND,
      join: LINE_JOIN.ROUND,
      alignment: 0.5,
   }).moveTo(from.x, from.y);
   const oldColor = g.line.color;
   g.lineStyle({ ...g.line, color, width });
   g.bezierCurveTo((from.x + to.x) / 2, from.y, (from.x + to.x) / 2, to.y, to.x, to.y);
   g.lineStyle({ ...g.line, color: oldColor });
}

class BuildingCard extends Container {
   private port: Partial<Record<Resource, IPointData>> = {};

   constructor(b: Building) {
      super();
      const graphics = this.addChild(new SmoothGraphics()).lineStyle({
         color: 0xcccccc,
         width: 1,
         cap: LINE_CAP.ROUND,
         join: LINE_JOIN.ROUND,
         alignment: 0.5,
      });
      graphics.beginFill(0xffffff).drawRoundedRect(0, 0, 300, 400, 10).endFill();

      const building = Config.Building[b];
      this.addChild(
         new BitmapText(building.name(), {
            fontName: Fonts.CabinSketch,
            fontSize: 36,
            tint: 0x333333,
         }),
      ).position.set(20, 20);

      const desc = this.addChild(
         new BitmapText('What do you call a flour mill that tells jokes? A "kneady" comedian!', {
            fontName: Fonts.Cabin,
            fontSize: 16,
            tint: 0x333333,
            maxWidth: 260,
         }),
      );
      desc.position.set(20, 60);

      const inputCount = sizeOf(building.input);
      let i = 0;
      forEach(building.input, (res, amount) => {
         ++i;
         const input = this.addChild(
            new BitmapText(Config.Resource[res].name(), {
               fontName: Fonts.Cabin,
               fontSize: 20,
               tint: 0x333333,
            }),
         );
         input.anchor.set(0, 0.5);
         input.position.set(50, 100 + (i * 300) / (inputCount + 1));
         const portX = 30;
         const portY = 100 + 2 + (i * 300) / (inputCount + 1);
         graphics.beginFill(0xf1c40f).drawCircle(portX, portY, 10).endFill();
         this.port[res] = { x: portX, y: portY };
      });

      const outputCount = sizeOf(building.output);
      i = 0;
      forEach(building.output, (res, amount) => {
         ++i;
         const output = this.addChild(
            new BitmapText(Config.Resource[res].name(), {
               fontName: Fonts.Cabin,
               fontSize: 20,
               align: "right",
               tint: 0x333333,
            }),
         );
         output.anchor.set(1, 0.5);
         output.position.set(250, 100 + (i * 300) / (outputCount + 1));
         const portX = 270;
         const portY = 100 + 2 + (i * 300) / (outputCount + 1);
         graphics.beginFill(0x2ecc71).drawCircle(portX, portY, 10).endFill();
         this.port[res] = { x: portX, y: portY };
      });

      let pointerDownPos: IPointData | null = null;
      const startPos = { x: this.x, y: this.y };

      this.on("pointerdown", (e) => {
         e.stopPropagation();
         pointerDownPos = { x: e.x, y: e.y };
         startPos.x = this.x;
         startPos.y = this.y;
      });

      this.on("pointermove", (e) => {
         e.stopPropagation();
         if (pointerDownPos) {
            this.x = startPos.x + e.x - pointerDownPos.x;
            this.y = startPos.y + e.y - pointerDownPos.y;
            this.parent.emit("card-moved");
         }
      });

      this.on("pointerup", (e) => {
         e.stopPropagation();
         pointerDownPos = null;
         startPos.x = this.x;
         startPos.y = this.y;
      });
   }

   getPortPosition(res: Resource): IPointData | null {
      const pos = this.port[res];
      if (!pos) {
         return null;
      }
      return { x: pos.x + this.x, y: pos.y + this.y };
   }
}
