import { PatchNotes } from "../../../shared/definitions/PatchNotes";
import { build } from "../Version.json";

export function getVersion(): string {
   return `${PatchNotes[0].version} Build ${build}`;
}
