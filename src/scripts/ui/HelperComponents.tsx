import { GameState } from "../logic/GameState";
import { formatNumber } from "../utilities/Helper";

export function FormatNumber({ value }: { value: number | undefined | null }) {
   return formatNumber(value, false, false) as React.ReactNode & React.ReactElement;
}

export function fmtNumber(value: number | undefined | null, gs: GameState) {
   return formatNumber(value, false, false);
}
