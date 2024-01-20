import type { Application, FederatedPointerEvent, IDestroyOptions, IPointData } from "pixi.js";
import { Container, Rectangle } from "pixi.js";
import { clamp, lerp, sizeOf } from "../../../shared/utilities/Helper";
import { Vector2, v2 } from "../../../shared/utilities/Vector2";

const DEAD_ZONE_SQR = 25;

export class Camera extends Container {
   constructor(private app: Application) {
      super();
      this.eventMode = "static";
      this.interactiveChildren = false;
      this.app.renderer.events.domElement.addEventListener("contextmenu", this.disableContextMenu.bind(this));
      this.app.renderer.events.domElement.addEventListener("wheel", this.onMouseWheel);
      this.app.ticker.add(this.update);
      this.on("pointerdown", this.onPointerDown);
      this.on("pointermove", this.onPointerMove);
      this.on("pointerup", this.onPointerUp);
      this.on("pointercancel", this.onPointerOut);
      this.on("pointerout", this.onPointerOut);
      this.on("pointerleave", this.onPointerOut);
   }

   private pressedPointers: Record<number, { x: number; y: number; moved: boolean }> = {};

   private onPointerDown(e: FederatedPointerEvent) {
      this.pressedPointers[e.pointerId] = { x: e.x, y: e.y, moved: false };
   }

   private onPointerOut(e: FederatedPointerEvent) {
      delete this.pressedPointers[e.pointerId];
   }

   private onPointerUp(e: FederatedPointerEvent) {
      const p = this.pressedPointers[e.pointerId];
      delete this.pressedPointers[e.pointerId];
      if (!p?.moved) {
         this.emit("clicked", e);
      }
   }

   private onPointerMove(e: FederatedPointerEvent) {
      const active = this.pressedPointers[e.pointerId];
      if (!active) {
         return;
      }
      const pressedPointerCount = sizeOf(this.pressedPointers);
      if (pressedPointerCount === 1) {
         const lengthSqr = (active.x - e.x) ** 2 + (active.y - e.y) ** 2;
         // If we are already moving, we skip dead zone check.
         if (active.moved || lengthSqr > DEAD_ZONE_SQR) {
            this.targetOrigin = null;
            this.moveOrigin({
               x: this.pivot.x + (active.x - e.x) / this.zoom,
               y: this.pivot.y + (active.y - e.y) / this.zoom,
            });
            active.moved = true;
         }
      }
      if (active.moved) {
         active.x = e.x;
         active.y = e.y;
      }
      // const touches = e.getTouches();
      // if (touches.length >= 2) {
      //     const touch1 = touches[0];
      //     const touch2 = touches[1];
      //     const distance = touch1.getLocation().sub(touch2.getLocation());
      //     const delta = touch1.getDelta().sub(touch2.getDelta());
      //     let scale = 1;
      //     if (Math.abs(distance.x) > Math.abs(distance.y)) {
      //         scale = ((distance.x + delta.x) / distance.x) * this.cameraZoom;
      //     } else {
      //         scale = ((distance.y + delta.y) / distance.y) * this.cameraZoom;
      //     }
      //     this.cameraZoom = scale;
      // } else {
      //     this.cameraPosition = this.cameraPosition
      //         .sub(cc.v3(e.getDelta()).divSelf(this.cameraZoom))
      //         .clampf(this.minCameraPosition(), this.maxCameraPosition());
      // }
   }

   public screenToWorld(pos: IPointData): IPointData {
      return {
         x: this.pivot.x + pos.x / this.scale.x,
         y: this.pivot.y + pos.y / this.scale.y,
      };
   }

   public worldToScreen(pos: IPointData): IPointData {
      return {
         x: this.scale.x * (pos.x - this.pivot.x),
         y: this.scale.y * (pos.y - this.pivot.y),
      };
   }

   private disableContextMenu(e: Event): void {
      e.preventDefault();
   }

   public get screenWidth() {
      return this.app.screen.width;
   }

   public get screenHeight() {
      return this.app.screen.height;
   }

   private _worldWidth = 0;
   private _worldHeight = 0;
   public setWorldSize(width: number, height: number): void {
      this._worldWidth = width;
      this._worldHeight = height;
   }

   private minZoom = 0;
   private maxZoom = Infinity;

   public wheelMode = WheelMode.Zoom;

   public setZoomRange(min: number, max: number) {
      console.assert(max >= min);
      this.minZoom = min;
      this.maxZoom = max;
      this.wheelMode = WheelMode.Zoom;
   }

   private targetZoom: number | null = null;
   private targetOrigin: IPointData | null = null;
   private cursorPos: IPointData | null = null;

   private resize(): void {}

   public get zoom(): number {
      return this.scale.x;
   }
   public set zoom(value: number) {
      const clamped = clamp(value, this.minZoom, this.maxZoom);
      const oldCenter = this.center;
      this.scale.set(clamped, clamped);
      this.center = oldCenter;
   }

   private moveOrigin(point: IPointData): void {
      const clamped = this.clampOrigin(point);
      this.pivot.set(clamped.x, clamped.y);
      this.recalculateHitArea();
      this.emit("moved", clamped);
   }

   private update = () => {
      if (this.targetZoom) {
         const posBefore = this.screenToWorld(this.cursorPos!);
         const newZoom = lerp(this.zoom, this.targetZoom, Math.min(0.01 * this.app.ticker.deltaMS, 1 / 3));
         this.scale.set(newZoom, newZoom);
         const posAfter = this.screenToWorld(this.cursorPos!);
         const newPivot = v2(posBefore).subtractSelf(posAfter).addSelf(this.pivot);
         this.moveOrigin(newPivot);
         if (Math.abs(this.targetZoom - this.zoom) < 0.001) {
            this.targetZoom = null;
            this.cursorPos = null;
            this.recalculateHitArea();
            this.emit("zoomed", this.zoom);
         }
      }
      if (this.targetOrigin) {
         const target = Vector2.lerp(
            this.pivot,
            this.targetOrigin,
            Math.min(0.01 * this.app.ticker.deltaMS, 1 / 3),
         );
         this.moveOrigin(target);
         if ((this.targetOrigin.x - target.x) ** 2 + (this.targetOrigin.y - target.y) ** 2 < 0.1 ** 2) {
            this.targetOrigin = null;
         }
      }
   };

   private onMouseWheel = (e: WheelEvent) => {
      e.preventDefault();
      switch (this.wheelMode) {
         case WheelMode.Zoom: {
            this.cursorPos = { x: e.x, y: e.y };
            this.targetZoom = clamp(this.zoom - e.deltaY * 0.001 * this.zoom, this.minZoom, this.maxZoom);
            break;
         }
         case WheelMode.HorizontalScroll: {
            this.targetOrigin = v2(this.pivot).addSelf({ x: e.deltaY * 2, y: 0 });
            break;
         }
         case WheelMode.VerticalScroll: {
            this.targetOrigin = v2(this.pivot).addSelf({ x: 0, y: e.deltaY * 2 });
            break;
         }
      }
   };

   public get center(): IPointData {
      return this.originToCenter(this.pivot);
   }

   public set center(point: IPointData) {
      this.targetOrigin = null;
      this.moveOrigin(this.centerToOrigin(point));
   }

   public clampCenter(point: IPointData, result?: IPointData): IPointData {
      return this.originToCenter(this.clampOrigin(this.centerToOrigin(point, result), result), result);
   }

   public centerToOrigin(point: IPointData, result?: IPointData): IPointData {
      const x = point.x - this.screenWidth / this.scale.x / 2;
      const y = point.y - this.screenHeight / this.scale.y / 2;
      if (result) {
         result.x = x;
         result.y = y;
         return result;
      }
      return { x, y };
   }

   public originToCenter(point: IPointData, result?: IPointData): IPointData {
      const x = point.x + this.screenWidth / this.scale.x / 2;
      const y = point.y + this.screenHeight / this.scale.y / 2;
      if (result) {
         result.x = x;
         result.y = y;
         return result;
      }
      return { x, y };
   }

   public clampOrigin(point: IPointData, result?: IPointData): IPointData {
      const maxX = this._worldWidth - this.screenWidth / this.scale.x;
      const maxY = this._worldHeight - this.screenHeight / this.scale.y;
      const x = maxX < 0 ? maxX / 2 : clamp(point.x, 0, maxX);
      const y = maxY < 0 ? maxY / 2 : clamp(point.y, 0, maxY);
      if (result) {
         result.x = x;
         result.y = y;
         return result;
      }
      return { x, y };
   }

   private recalculateHitArea() {
      const topLeft = this.screenToWorld({ x: 0, y: 0 });
      this.hitArea = new Rectangle(
         topLeft.x,
         topLeft.y,
         this.screenWidth / this.scale.x,
         this.screenHeight / this.scale.y,
      );
   }

   override destroy(options?: boolean | IDestroyOptions | undefined): void {
      this.app.renderer.events.domElement.removeEventListener("contextmenu", this.disableContextMenu);
      this.app.renderer.events.domElement.removeEventListener("wheel", this.onMouseWheel);
      this.app.ticker.remove(this.update);
      super.destroy(options);
   }
}

export enum WheelMode {
   Zoom = 0,
   VerticalScroll = 1,
   HorizontalScroll = 2,
}
