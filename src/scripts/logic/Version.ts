import { PatchNotes } from "../../../shared/definitions/PatchNotes";
import { build } from "../Version.json";

export function getFullVersion(): string {
   return `${getVersion()} Build ${getBuildNumber()}`;
}

export function getVersion(): string {
   return PatchNotes[0].version;
}

export function getBuildNumber(): number {
   return build;
}
