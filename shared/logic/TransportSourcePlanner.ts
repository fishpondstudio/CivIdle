import type { Material } from "../definitions/MaterialDefinitions";
import { forEach, mapSafePush, type Tile } from "../utilities/Helper";
import { getGameState } from "./GameStateLogic";
import { getGrid } from "./IntraTickCache";
import { Tick, type IBuildingIndex, type IResourceImportBuildingIndex } from "./TickLogic";
import type { IResourceImportBuildingData } from "./Tile";

interface ITransportSourceCandidate extends IBuildingIndex {
   importBuilding?: IResourceImportBuildingData;
}

class TransportSourcePlanner {
   private readonly distanceSourcesByMaterial = new Map<Material, Map<Tile, Tile[]>>();
   private resourcesByTile: ReadonlyMap<Material, IBuildingIndex[]> = new Map();
   private resourceImportBuildings: ReadonlyMap<Tile, IResourceImportBuildingIndex> = new Map();
   private readonly importSourcesByMaterial = new Map<Material, ITransportSourceCandidate[]>();
   private readonly candidatesByMaterial = new Map<Material, ITransportSourceCandidate[]>();
   private readonly storageOrderByMaterial = new Map<Material, Tile[]>();
   private importSourcesIndexed = false;

   public reset(): void {
      this.resourcesByTile = Tick.current.resourcesByTile;
      this.resourceImportBuildings = Tick.current.resourceImportBuildings;
      this.clearTickSources();
   }

   public clear(): void {
      this.clearDistanceSources();
      this.clearTickSources();
   }

   public clearDistanceSources(): void {
      this.distanceSourcesByMaterial.clear();
   }

   public getDistanceSources(targetXy: Tile, res: Material, useCache: boolean): Tile[] {
      if (useCache) {
         const cached = this.distanceSourcesByMaterial.get(res)?.get(targetXy);
         if (cached) {
            return cached;
         }
      }

      const sources = (this.resourcesByTile.get(res) ?? []).map((candidate) => candidate.tile);
      this.resourceImportBuildings.forEach((_, xy) => sources.push(xy));
      const grid = getGrid(getGameState());
      sources.sort((a, b) => grid.distanceTile(a, targetXy) - grid.distanceTile(b, targetXy));

      if (useCache) {
         let sourcesByTarget = this.distanceSourcesByMaterial.get(res);
         if (!sourcesByTarget) {
            sourcesByTarget = new Map();
            this.distanceSourcesByMaterial.set(res, sourcesByTarget);
         }
         sourcesByTarget.set(targetXy, sources);
      }

      return sources;
   }

   private clearTickSources(): void {
      this.importSourcesByMaterial.clear();
      this.candidatesByMaterial.clear();
      this.storageOrderByMaterial.clear();
      this.importSourcesIndexed = false;
   }

   public getAmountSources(res: Material): Tile[] {
      return this.getCandidates(res)
         .slice()
         .sort((a, b) => this.getAmount(b, res) - this.getAmount(a, res))
         .map((candidate) => candidate.tile);
   }

   public getStoragePercentageSources(res: Material): Tile[] {
      const cached = this.storageOrderByMaterial.get(res);
      if (cached) {
         return cached;
      }

      const sources = this.getCandidates(res)
         .slice()
         .sort((a, b) => b.usedStoragePercentage - a.usedStoragePercentage)
         .map((candidate) => candidate.tile);
      this.storageOrderByMaterial.set(res, sources);
      return sources;
   }

   private getCandidates(res: Material): ITransportSourceCandidate[] {
      const cached = this.candidatesByMaterial.get(res);
      if (cached) {
         return cached;
      }

      this.indexImportSources();
      const candidates: ITransportSourceCandidate[] = [...(this.resourcesByTile.get(res) ?? [])];
      candidates.push(...(this.importSourcesByMaterial.get(res) ?? []));
      this.candidatesByMaterial.set(res, candidates);
      return candidates;
   }

   private indexImportSources(): void {
      if (this.importSourcesIndexed) {
         return;
      }

      this.resourceImportBuildings.forEach((index) => {
         forEach(index.building.resources, (res, amount) => {
            if (!Number.isFinite(amount) || amount <= 0) {
               return;
            }
            mapSafePush(this.importSourcesByMaterial, res, this.makeImportCandidate(index, amount));
         });
      });
      this.importSourcesIndexed = true;
   }

   private makeImportCandidate(
      index: IResourceImportBuildingIndex,
      amount: number,
   ): ITransportSourceCandidate {
      return {
         tile: index.tile,
         amount,
         usedStoragePercentage: index.usedStoragePercentage,
         importBuilding: index.building,
      };
   }

   private getAmount(candidate: ITransportSourceCandidate, res: Material): number {
      return candidate.importBuilding?.resources[res] ?? candidate.amount;
   }
}

export const Planner = new TransportSourcePlanner();
