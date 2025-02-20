import type { ColorSource } from "pixi.js";
import { Scene } from "../utilities/SceneManager";

export class EmptyScene extends Scene {
   override backgroundColor(): ColorSource {
      return 0xffffff;
   }
}
