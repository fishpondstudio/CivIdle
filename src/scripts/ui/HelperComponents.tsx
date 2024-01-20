import type { GameState } from "../../../shared/logic/GameState";
import { formatNumber } from "../../../shared/utilities/Helper";

export function FormatNumber({ value }: { value: number | undefined | null }): React.ReactNode {
   return formatNumber(value, false, false);
}

export function fmtNumber(value: number | undefined | null, gs: GameState): React.ReactNode {
   return formatNumber(value, false, false);
}
