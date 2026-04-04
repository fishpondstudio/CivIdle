import { type CollisionDetector, CollisionPriority, CollisionType } from "@dnd-kit/abstract";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { memo, useState } from "react";
import { type Tile, cls, createTile, range, tileToPoint } from "../../../shared/utilities/Helper";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";

import { refreshOnTypedEvent, useTypedEvent } from "../utilities/Hook";
import "./GalleryModal.css";
import { Paintings } from "./GalleryPaintings";
import { hideModal } from "./GlobalModal";

export function GalleryModal(): React.ReactNode {
   return (
      <div className="window" style={{ width: "min(80vw, 1200px)" }}>
         <div className="title-bar">
            <div className="title-bar-text">Gallery</div>
            <div className="title-bar-controls">
               <button onClick={hideModal} aria-label="Close"></button>
            </div>
         </div>
         <div className="window-body gallery-modal">
            <DragDropProvider
               onDragMove={(e) => {
                  if (e.operation.target) {
                     const sourceId = e.operation.source?.id as string | undefined;
                     const sourceWidth = e.operation.source?.data?.width as number | undefined;
                     const sourceHeight = e.operation.source?.data?.height as number | undefined;
                     if (!sourceWidth || !sourceHeight) {
                        return;
                     }
                     const targetPoint = tileToPoint(e.operation.target.id as number);
                     if (
                        canFit(
                           { x: targetPoint.x, y: targetPoint.y, width: sourceWidth, height: sourceHeight },
                           placedPaintings,
                           GridSize,
                           sourceId,
                        )
                     ) {
                        const ids = new Set<number>();
                        for (let x = 0; x < sourceWidth; x++) {
                           for (let y = 0; y < sourceHeight; y++) {
                              ids.add(createTile(targetPoint.x + x, targetPoint.y + y));
                           }
                        }
                        paintingMoved.emit({ id: sourceId, tiles: ids });
                     } else {
                        paintingMoved.emit({ id: sourceId, tiles: new Set<Tile>() });
                     }
                  }
               }}
               onDragEnd={(e) => {
                  const target = e.operation.target;
                  const source = e.operation.source;
                  if (source && target) {
                     const targetWidth = source.data.width as number;
                     const targetHeight = source.data.height as number;
                     const targetPoint = tileToPoint(target.id as number);
                     if (
                        canFit(
                           { x: targetPoint.x, y: targetPoint.y, width: targetWidth, height: targetHeight },
                           placedPaintings,
                           GridSize,
                           source.id as string,
                        )
                     ) {
                        placedPaintings.set(source.id as string, {
                           x: targetPoint.x,
                           y: targetPoint.y,
                           width: source.data.width,
                           height: source.data.height,
                        });
                        paintingUpdated.emit();
                        paintingMoved.emit({ id: undefined, tiles: new Set<Tile>() });
                     }
                  }
                  if (source && !target) {
                     placedPaintings.delete(source.id as string);
                     paintingUpdated.emit();
                     paintingMoved.emit({ id: undefined, tiles: new Set<Tile>() });
                  }
               }}
            >
               <div className="row g10">
                  <div style={{ position: "relative" }}>
                     <Grid />
                     <PlacedPaintings />
                  </div>
                  <PendingPaintings />
               </div>
            </DragDropProvider>
         </div>
      </div>
   );
}

const GridSize = 20;

const grid = range(0, GridSize * GridSize);

function Grid(): React.ReactNode {
   const [data, setData] = useState<IPaintingMoved>({
      id: undefined as string | undefined,
      tiles: new Set<Tile>(),
   });
   useTypedEvent(paintingMoved, (event) => {
      setData(event);
   });
   refreshOnTypedEvent(paintingUpdated);
   return (
      <div
         style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GridSize}, var(--grid-size))`,
         }}
      >
         {grid.map((i) => {
            const x = i % GridSize;
            const y = Math.floor(i / GridSize);
            const id = createTile(x, y);
            return (
               <GridItem
                  key={id}
                  id={id}
                  isUsed={isTileUsed(id, placedPaintings, data.id)}
                  isHighlighted={data.tiles.has(id)}
               />
            );
         })}
      </div>
   );
}

function PlacedPaintings(): React.ReactNode {
   refreshOnTypedEvent(paintingUpdated);
   return Array.from(placedPaintings.entries()).map(([id, { x, y, width, height }]) => {
      return (
         <PaintingItem
            key={id}
            id={id}
            style={{
               position: "absolute",
               top: `calc(var(--grid-size) * ${y})`,
               left: `calc(var(--grid-size) * ${x})`,
            }}
         />
      );
   });
}

function PendingPaintings(): React.ReactNode {
   refreshOnTypedEvent(paintingUpdated);
   return (
      <div
         className="inset-shallow white f1"
         style={{
            height: "var(--grid-height)",
            overflowY: "auto",
            padding: 2,
         }}
      >
         {Array.from(Object.entries(Paintings)).map(([key, size]) => {
            if (placedPaintings.has(key)) {
               return null;
            }
            return <PaintingItem key={key} id={key} />;
         })}
      </div>
   );
}

function _GridItem({
   id,
   isUsed,
   isHighlighted,
}: { id: number; isUsed: boolean; isHighlighted: boolean }): React.ReactNode {
   const { ref } = useDroppable({
      id,
      collisionDetector: collisionDetectorTopLeftCorner,
   });
   return (
      <div
         ref={ref}
         className={cls("grid-item", isHighlighted ? "highlight" : null, isUsed ? "used" : null)}
      ></div>
   );
}

const GridItem = memo(_GridItem);

function PaintingItem({ id, style }: { id: string; style?: React.CSSProperties }): React.ReactNode {
   const painting = Paintings[id as keyof typeof Paintings];
   const { ref } = useDraggable({
      id: id,
      data: {
         width: painting.width,
         height: painting.height,
      },
   });

   return (
      <img
         onClick={() => {
            const placed = placedPaintings.get(id);
            if (placed) {
               const adjacentRects = getAdjacentRects([id, placed], placedPaintings);
               console.log(adjacentRects);
            }
         }}
         ref={ref}
         style={{
            width: `calc(var(--grid-size) * ${painting.width})`,
            height: `calc(var(--grid-size) * ${painting.height})`,
            borderRadius: 4,
            border: "2px solid rgba(255, 255, 255, 0.5)",
            overflow: "hidden",
            objectFit: "cover",
            display: "block",
            float: "left",
            ...style,
         }}
         src={painting.image}
         alt={id}
      />
   );
}

interface IPaintingMoved {
   id: string | undefined;
   tiles: Set<Tile>;
}

const paintingMoved = new TypedEvent<IPaintingMoved>();
const paintingUpdated = new TypedEvent<void>();
const placedPaintings = new Map<string, { x: number; y: number; width: number; height: number }>();

interface IRect {
   x: number;
   y: number;
   width: number;
   height: number;
}

function canFit<T extends string | number>(
   rect: IRect,
   existingRects: Map<T, IRect>,
   gridSize: number,
   excludeId?: T,
): boolean {
   if (rect.x < 0 || rect.x + rect.width > gridSize || rect.y < 0 || rect.y + rect.height > gridSize) {
      return false;
   }
   for (const [existingId, existingRect] of existingRects) {
      if (existingId === excludeId) {
         continue;
      }
      if (
         rect.x < existingRect.x + existingRect.width &&
         rect.x + rect.width > existingRect.x &&
         rect.y < existingRect.y + existingRect.height &&
         rect.y + rect.height > existingRect.y
      ) {
         return false;
      }
   }
   return true;
}

function isTileUsed<T extends string | number>(
   tile: Tile,
   existingRects: Map<T, IRect>,
   excludeId?: T,
): boolean {
   const { x, y } = tileToPoint(tile);
   for (const [existingId, existingRect] of existingRects) {
      if (existingId === excludeId) {
         continue;
      }
      if (
         existingRect.x <= x &&
         existingRect.x + existingRect.width > x &&
         existingRect.y <= y &&
         existingRect.y + existingRect.height > y
      ) {
         return true;
      }
   }
   return false;
}

function getAdjacentRects<T extends string | number>(
   rect: [T, IRect],
   existingRects: Map<T, IRect>,
): [T, IRect][] {
   const [currId, currRect] = rect;
   const result: [T, IRect][] = [];
   // Convert current rect to a set of tiles
   const currTiles = new Set<Tile>();
   for (let dx = 0; dx < currRect.width; dx++) {
      for (let dy = 0; dy < currRect.height; dy++) {
         currTiles.add(createTile(currRect.x + dx, currRect.y + dy));
      }
   }

   for (const [otherId, otherRect] of existingRects) {
      if (otherId === currId) continue;

      // For each edge tile of the other rect, check if it's adjacent
      let isAdjacent = false;
      outer: for (let dx = 0; dx < otherRect.width; dx++) {
         for (let dy = 0; dy < otherRect.height; dy++) {
            const ox = otherRect.x + dx;
            const oy = otherRect.y + dy;
            // Four sides: up, down, left, right
            const neighbors = [
               [ox + 1, oy],
               [ox - 1, oy],
               [ox, oy + 1],
               [ox, oy - 1],
            ];
            for (const [nx, ny] of neighbors) {
               if (currTiles.has(createTile(nx, ny))) {
                  isAdjacent = true;
                  break outer;
               }
            }
         }
      }
      if (isAdjacent) {
         result.push([otherId, otherRect]);
      }
   }
   return result;
}

const collisionDetectorTopLeftCorner: CollisionDetector = (input) => {
   const { dragOperation, droppable } = input;
   const { shape, position } = dragOperation;
   if (!droppable.shape) {
      return null;
   }
   let p1 = position.current;
   if (shape) {
      p1 = { x: shape.current.boundingRectangle.top, y: shape.current.boundingRectangle.left };
   }
   const p2 = { x: droppable.shape.boundingRectangle.top, y: droppable.shape.boundingRectangle.left };
   const distanceX = Math.abs(p1.x - p2.x);
   const distanceY = Math.abs(p1.y - p2.y);
   if (
      distanceX > droppable.shape.boundingRectangle.width ||
      distanceY > droppable.shape.boundingRectangle.height
   ) {
      return null;
   }
   const distance = distanceX + distanceY;
   return {
      id: droppable.id,
      value: 1 / distance,
      type: CollisionType.Collision,
      priority: CollisionPriority.Normal,
   };
};
