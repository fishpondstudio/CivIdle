import { formatNumber } from "../../../shared/utilities/Helper";
import type { GameState } from "../logic/GameState";

export function FormatNumber({ value }: { value: number | undefined | null }): React.ReactNode {
   return formatNumber(value, false, false);
}

export function fmtNumber(value: number | undefined | null, gs: GameState): React.ReactNode {
   return formatNumber(value, false, false);
}
