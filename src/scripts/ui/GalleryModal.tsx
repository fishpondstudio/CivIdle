import { type CollisionDetector, CollisionPriority, CollisionType } from "@dnd-kit/abstract";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import Tippy from "@tippyjs/react";
import { memo, useState } from "react";
import {
   calculateEffects,
   canFit,
   getAdjacentRects,
   type IPaintingPlacement,
   isTileUsed,
   Painters,
   type Painting,
   Paintings,
   Themes,
} from "../../../shared/definitions/GalleryPaintings";
import type { IMauritshuisBuildingData } from "../../../shared/logic/Tile";
import { cls, createTile, range, type Tile, tileToPoint } from "../../../shared/utilities/Helper";
import { $t, L } from "../../../shared/utilities/i18n";
import { TypedEvent } from "../../../shared/utilities/TypedEvent";
import { refreshOnTypedEvent, useTypedEvent } from "../utilities/Hook";
import "./GalleryModal.css";
import { PaintingImages } from "./GalleryPaintingImages";
import { hideModal } from "./GlobalModal";

export function GalleryModal({ building }: { building: IMauritshuisBuildingData }): React.ReactNode {
   const { paintings, placedPaintings } = building;
   return (
      <div className="window" style={{ width: "min(90vw, 1200px)" }}>
         <div className="title-bar">
            <div className="title-bar-text">{$t(L.Gallery)}</div>
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
                           {
                              x: targetPoint.x,
                              y: targetPoint.y,
                              width: sourceWidth,
                              height: sourceHeight,
                           },
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
                           {
                              x: targetPoint.x,
                              y: targetPoint.y,
                              width: targetWidth,
                              height: targetHeight,
                           },
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
                     <Grid placedPaintings={placedPaintings} />
                     <PlacedPaintings placedPaintings={placedPaintings} />
                  </div>
                  <div className="col f1" style={{ alignSelf: "stretch" }}>
                     <PaintingEffects placedPaintings={placedPaintings} />
                     <PendingPaintings placedPaintings={placedPaintings} paintings={paintings} />
                  </div>
               </div>
            </DragDropProvider>
         </div>
      </div>
   );
}

const GridSize = 20;
const grid = range(0, GridSize * GridSize);

function Grid({ placedPaintings }: { placedPaintings: Map<Painting, IPaintingPlacement> }): React.ReactNode {
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

function PaintingEffects({
   placedPaintings,
}: { placedPaintings: Map<Painting, IPaintingPlacement> }): React.ReactNode {
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
                  <div>{$t(L.AdjacencyBonus)}</div>
               </summary>
               <ul>
                  <li className="row">
                     <Tippy
                        content={$t(L.EachPairOfAdjacentPaintingsByTheSamePainterGrants1ProductionMultiplier)}
                     >
                        <div>{$t(L.PainterAdjacency)}</div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.samePainterPairs.size}</div>
                  </li>
                  <li className="row">
                     <Tippy content={$t(L.EachPairOfAdjacentPaintingsOfTheSameSizeGrants1BuildingLevelBoost)}>
                        <div>{$t(L.SizeAdjacency)}</div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.sameSizePairs.size}</div>
                  </li>
                  <li className="row">
                     <Tippy
                        content={$t(
                           L.EachPairOfAdjacentPaintingsPaintedInTheSameCenturyGrants1StorageMultiplier,
                        )}
                     >
                        <div>{$t(L.TimeAdjacency)}</div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.sameCenturyPairs.size}</div>
                  </li>
                  <li className="row">
                     <Tippy
                        content={$t(
                           L.EachPairOfAdjacentPaintingsWithTheSameThemeGrants1WorkerCapacityMultiplier,
                        )}
                     >
                        <div>{$t(L.ThemeAdjacency)}</div>
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
                  <div>{$t(L.PaintersCollectionBonus)}</div>
               </summary>
               <ul>
                  <li className="row">
                     <Tippy content={$t(L.Display3PaintingsByRembrandtVanRijnToUnlock1ProductionMultiplier)}>
                        <div>
                           {$t(L.XPaintingsBy, {
                              painter: Painters.RembrandtVanRijn(),
                              count: 3,
                           })}
                        </div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.byPainters.get("RembrandtVanRijn") ?? 0}/3</div>
                  </li>
                  <li className="row">
                     <Tippy content={$t(L.Display3PaintingsByJohannesVermeerToUnlock1ProductionMultiplier)}>
                        <div>
                           {$t(L.XPaintingsBy, {
                              painter: Painters.JohannesVermeer(),
                              count: 3,
                           })}
                        </div>
                     </Tippy>
                     <div className="f1" />
                     <div>{effects.byPainters.get("JohannesVermeer") ?? 0}/3</div>
                  </li>
                  <li className="row">
                     <Tippy content={$t(L.Display3PaintingsByVincentVanGoghToUnlock1ProductionMultiplier)}>
                        <div>
                           {$t(L.XPaintingsBy, {
                              painter: Painters.VincentVanGogh(),
                              count: 3,
                           })}
                        </div>
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
                  <div>{$t(L.DiversificationBonus)}</div>
               </summary>
            </details>
            <ul>
               <li className="row">
                  <Tippy content={$t(L.DisplayPaintingsBy5DifferentPaintersToUnlock1BuildingLevelBoost)}>
                     <div>{$t(L.XDifferentPainters, { count: 5 })}</div>
                  </Tippy>
                  <div className="f1" />
                  <div>{effects.byPainters.size}/5</div>
               </li>
               <li className="row">
                  <Tippy content={$t(L.DisplayPaintingsWith5DifferentThemesToUnlock1BuildingLevelBoost)}>
                     <div>{$t(L.XDifferentThemes, { count: 5 })}</div>
                  </Tippy>
                  <div className="f1" />
                  <div>{effects.byThemes.size}/5</div>
               </li>
               <li className="row">
                  <Tippy content={$t(L.Display5MasterpiecesToUnlock1BuildingLevelBoost)}>
                     <div>{$t(L.XDifferentMasterpieces, { count: 5 })}</div>
                  </Tippy>
                  <div className="f1" />
                  <div>{effects.masterpieces}/5</div>
               </li>
            </ul>
         </li>
      </ul>
   );
}

function PlacedPaintings({
   placedPaintings,
}: { placedPaintings: Map<Painting, IPaintingPlacement> }): React.ReactNode {
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
            placedPaintings={placedPaintings}
         />
      );
   });
}

function PendingPaintings({
   placedPaintings,
   paintings,
}: { placedPaintings: Map<Painting, IPaintingPlacement>; paintings: Set<Painting> }): React.ReactNode {
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
         {Array.from(paintings)
            .sort((a, b) => Paintings[a].height - Paintings[b].height)
            .map((key) => {
               if (placedPaintings.has(key)) {
                  return null;
               }
               return <PaintingItem key={key} id={key} placedPaintings={placedPaintings} />;
            })}
      </div>
   );
}

function _GridItem({
   id,
   isUsed,
   isHighlighted,
}: {
   id: number;
   isUsed: boolean;
   isHighlighted: boolean;
}): React.ReactNode {
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

function PaintingItem({
   id,
   placedPaintings,
   style,
}: {
   id: Painting;
   placedPaintings: Map<Painting, IPaintingPlacement>;
   style?: React.CSSProperties;
}): React.ReactNode {
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
                  <div className="dimmed">{$t(L.Name)}</div>
                  <div className="f1 text-right">{painting.name()}</div>
               </div>
               <div className="row g20">
                  <div className="dimmed">{$t(L.Painter)}</div>
                  <div className="f1 text-right">{Painters[painting.painter]()}</div>
               </div>
               <div className="row g20">
                  <div className="dimmed">{$t(L.Theme)}</div>
                  <div className="f1 text-right">{Themes[painting.theme]()}</div>
               </div>
               <div className="row g20">
                  <div className="dimmed">{$t(L.Year)}</div>
                  <div className="f1 text-right">{painting.year}</div>
               </div>
               {painting.masterpiece && (
                  <div className="row g20">
                     <div className="dimmed">{$t(L.Masterpiece)}</div>
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
            src={PaintingImages[id]}
            alt={id}
         />
      </Tippy>
   );
}

interface IPaintingMoved {
   id: string | undefined;
   tiles: Set<Tile>;
}

const paintingMoved = new TypedEvent<IPaintingMoved>();
const paintingUpdated = new TypedEvent<void>();

const collisionDetectorTopLeftCorner: CollisionDetector = (input) => {
   const { dragOperation, droppable } = input;
   const { shape, position } = dragOperation;
   if (!droppable.shape) {
      return null;
   }
   let p1 = position.current;
   if (shape) {
      p1 = {
         x: shape.current.boundingRectangle.top,
         y: shape.current.boundingRectangle.left,
      };
   }
   const p2 = {
      x: droppable.shape.boundingRectangle.top,
      y: droppable.shape.boundingRectangle.left,
   };
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
