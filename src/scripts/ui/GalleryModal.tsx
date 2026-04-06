import { type CollisionDetector, CollisionPriority, CollisionType } from "@dnd-kit/abstract";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import Tippy from "@tippyjs/react";
import { memo, useState } from "react";
import { cls, createTile, mapSafeAdd, range, type Tile, tileToPoint } from "../../../shared/utilities/Helper";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { refreshOnTypedEvent, useTypedEvent } from "../utilities/Hook";
import "./GalleryModal.css";
import {
   makePaintingPair,
   type Painter,
   Painters,
   type Painting,
   type PaintingPair,
   Paintings,
   type Theme,
   Themes,
} from "./GalleryPaintings";
import { hideModal } from "./GlobalModal";

export function GalleryModal(): React.ReactNode {
   return (
      <div className="window" style={{ width: "min(90vw, 1200px)" }}>
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
                        placedPaintings.set(source.id as Painting, {
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
                     placedPaintings.delete(source.id as Painting);
                     paintingUpdated.emit();
                     paintingMoved.emit({ id: undefined, tiles: new Set<Tile>() });
                  }
               }}
            >
               <div className="row" style={{ gap: 8 }}>
                  <div style={{ position: "relative" }}>
                     <Grid />
                     <PlacedPaintings />
                  </div>
                  <div className="col f1" style={{ alignSelf: "stretch" }}>
                     <PaintingEffects />
                     <PendingPaintings />
                  </div>
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

function PaintingEffects(): React.ReactNode {
   refreshOnTypedEvent(paintingUpdated);
   const effects = calculateEffects(placedPaintings);
   return (
      <ul
         className="tree-view"
         style={{
            overflowY: "auto",
            height: "calc(var(--grid-height) * 0.25 - 8px)",
            marginBottom: 8,
         }}
      >
         <li>
            <details open>
               <summary className="row text-strong">
                  <div>Adjacency Bonus</div>
               </summary>
               <ul>
                  <li className="row">
                     <Tippy content="Each pair of adjacent paintings by the same painter grants +1 Production Multipliers">
                        <div>Painter Adjacency</div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.samePainterPairs.size}</div>
                  </li>
                  <li className="row">
                     <Tippy content="Each pair of adjacent paintings of the same size grants +1 Building Level Boost">
                        <div>Size Adjacency</div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.sameSizePairs.size}</div>
                  </li>
                  <li className="row">
                     <Tippy content="Each pair of adjacent paintings painted in the same century (100 years) grants +1 Storage Multiplier">
                        <div>Time Adjacency</div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.sameCenturyPairs.size}</div>
                  </li>
                  <li className="row">
                     <Tippy content="Each pair of adjacent paintings with the same theme grants +1 Worker Capacity Multiplier">
                        <div>Theme Adjacency</div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.sameThemePairs.size}</div>
                  </li>
               </ul>
            </details>
         </li>
         <li>
            <details open>
               <summary className="row text-strong">
                  <div>Painters Collection Bonus</div>
               </summary>
               <ul>
                  <li className="row">
                     <Tippy content="Display 3 paintings by Rembrandt Van Rijn to unlock +1 Production Multiplier">
                        <div>3 {Painters.RembrandtVanRijn()} Paintings</div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.byPainters.get("RembrandtVanRijn") ?? 0}/3</div>
                  </li>
                  <li className="row">
                     <Tippy content="Display 3 paintings by Johannes Vermeer to unlock +1 Production Multiplier">
                        <div>3 {Painters.JohannesVermeer()} Paintings</div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.byPainters.get("JohannesVermeer") ?? 0}/3</div>
                  </li>
                  <li className="row">
                     <Tippy content="Display 3 paintings by Vincent van Gogh to unlock +1 Production Multiplier">
                        <div>3 {Painters.VincentVanGogh()} Paintings</div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.byPainters.get("VincentVanGogh") ?? 0}/3</div>
                  </li>
               </ul>
            </details>
         </li>
         <li>
            <details open>
               <summary className="row text-strong">
                  <div>Diversification Bonus</div>
               </summary>
            </details>
            <ul>
               <li className="row">
                  <Tippy content="Display paintings by 5 different painters to unlock +1 Building Level Boost">
                     <div>5 Different Painters</div>
                  </Tippy>
                  <div className="f1" />
                  <div>{effects.byPainters.size}/5</div>
               </li>
               <li className="row">
                  <Tippy content="Display paintings with 5 different themes to unlock +1 Building Level Boost">
                     <div>5 Different Themes</div>
                  </Tippy>
                  <div className="f1" />
                  <div>{effects.byThemes.size}/5</div>
               </li>
               <li className="row">
                  <Tippy content="Display 5 masterpieces to unlock +1 Building Level Boost">
                     <div>5 Different Masterpieces</div>
                  </Tippy>
                  <div className="f1" />
                  <div>{effects.masterpieces}/5</div>
               </li>
            </ul>
         </li>
      </ul>
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
         className="inset-shallow white"
         style={{
            height: "calc(var(--grid-height) * 0.75)",
            overflowY: "auto",
            padding: 2,
         }}
      >
         {Array.from(Object.entries(Paintings)).map(([key, size]) => {
            if (placedPaintings.has(key as Painting)) {
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
      <Tippy
         content={
            <div>
               <div className="row g20">
                  <div className="dimmed">Name</div>
                  <div className="f1 text-right">{painting.name()}</div>
               </div>
               <div className="row g20">
                  <div className="dimmed">Painter</div>
                  <div className="f1 text-right">{Painters[painting.painter]()}</div>
               </div>
               <div className="row g20">
                  <div className="dimmed">Theme</div>
                  <div className="f1 text-right">{Themes[painting.theme]()}</div>
               </div>
               <div className="row g20">
                  <div className="dimmed">Year</div>
                  <div className="f1 text-right">{painting.year}</div>
               </div>
               {painting.masterpiece && (
                  <div className="row g20">
                     <div className="dimmed">Masterpiece</div>
                     <div className="f1 text-right">
                        <div className="m-icon small text-green">check_circle</div>
                     </div>
                  </div>
               )}
            </div>
         }
      >
         <img
            onClick={() => {
               const placed = placedPaintings.get(id as Painting);
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
      </Tippy>
   );
}

interface IPaintingMoved {
   id: string | undefined;
   tiles: Set<Tile>;
}

interface IPaintingPlacement {
   x: number;
   y: number;
   width: number;
   height: number;
}

const paintingMoved = new TypedEvent<IPaintingMoved>();
const paintingUpdated = new TypedEvent<void>();
const placedPaintings = new Map<Painting, IPaintingPlacement>();

function calculateEffects(placedPaintings: Map<Painting, IPaintingPlacement>) {
   const samePainterPairs = new Set<PaintingPair>();
   const sameCenturyPairs = new Set<PaintingPair>();
   const sameThemePairs = new Set<PaintingPair>();
   const sameSizePairs = new Set<PaintingPair>();
   const byPainters = new Map<Painter, number>();
   const byThemes = new Map<Theme, number>();
   let masterpieces = 0;
   placedPaintings.forEach(({ x, y, width, height }, _id) => {
      const id = _id as Painting;
      const me = Paintings[id];
      mapSafeAdd(byPainters, me.painter, 1);
      mapSafeAdd(byThemes, me.theme, 1);
      if (me.masterpiece) {
         ++masterpieces;
      }
      const adjacentRects = getAdjacentRects([id, { x, y, width, height }], placedPaintings);
      for (const [_otherId, otherRect] of adjacentRects) {
         const otherId = _otherId as Painting;
         const other = Paintings[otherId];
         if (me.painter === other.painter) {
            samePainterPairs.add(makePaintingPair(id, otherId));
         }
         if (Math.floor(me.year / 100) === Math.floor(other.year / 100)) {
            sameCenturyPairs.add(makePaintingPair(id, otherId));
         }
         if (me.theme === other.theme) {
            sameThemePairs.add(makePaintingPair(id, otherId));
         }
         if (me.width === other.width && me.height === other.height) {
            sameSizePairs.add(makePaintingPair(id, otherId));
         }
      }
   });
   return {
      samePainterPairs,
      sameCenturyPairs,
      sameThemePairs,
      sameSizePairs,
      byPainters,
      byThemes,
      masterpieces,
   };
}

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
