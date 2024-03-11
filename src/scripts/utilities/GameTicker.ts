import type { Ticker } from "pixi.js";
import type { GameState } from "../../../shared/logic/GameState";
import { shouldTick, tickEveryFrame, tickEverySecond } from "../logic/ClientUpdate";
import { Actions } from "./pixi-actions/Actions";

export class GameTicker {
   private _interval = 0;
   constructor(
      private _ticker: Ticker,
      private _gameState: GameState,
   ) {}

   public start(): void {
      this._ticker.add(() => {
         if (!shouldTick()) {
            return;
         }
         const dt = (this._speedUp * this._ticker.elapsedMS) / 1000;
         Actions.tick(dt);
         tickEveryFrame(this._gameState, dt);
      });
      if (this._interval) {
         window.clearInterval(this._interval);
         this._interval = 0;
      }
      this._interval = window.setInterval(
         tickEverySecond.bind(null, this._gameState, false),
         1000 / this._speedUp,
      );
   }

   private _speedUp = 1;
   public get speedUp(): number {
      return this._speedUp;
   }
   public set speedUp(value: number) {
      if (this._speedUp === value) {
         return;
      }
      this._speedUp = value;
      if (this._interval) {
         window.clearInterval(this._interval);
         this._interval = 0;
      }
      this._interval = window.setInterval(
         tickEverySecond.bind(null, this._gameState, false),
         1000 / this._speedUp,
      );
   }
}
