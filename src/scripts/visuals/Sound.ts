import { sound } from "@pixi/sound";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import beep from "../../sounds/beep.mp3";
import bubble from "../../sounds/bubble.mp3";
import click from "../../sounds/click.mp3";
import error from "../../sounds/error.mp3";
import kaching from "../../sounds/kaching.mp3";
import levelup from "../../sounds/levelup.mp3";
import music from "../../sounds/music/pilgrimage-ancient-mediaeval-harp.mp3";

sound.add("click", click);
sound.add("beep", beep);
sound.add("error", error);
sound.add("kaching", kaching);
sound.add("levelup", levelup);
sound.add("bubble", bubble);
sound.add("music", music);

export function playClick() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("click");
}

export function playBeep() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("beep");
}

export function playError() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("error");
}

export function playKaching() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("kaching");
}

export function playLevelUp() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("levelup");
}

export function playBubble() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("bubble");
}
