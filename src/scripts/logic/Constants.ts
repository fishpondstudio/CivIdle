import { SAVE_FILE_VERSION } from "../../../shared/logic/GameState";
import { build } from "../Version.json";

export function getVersion(): string {
   return `0.${SAVE_FILE_VERSION}.${build}`;
}
