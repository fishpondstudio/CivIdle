import { sound } from "@pixi/sound";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import ageup from "../../sounds/ageup.mp3";
import beep from "../../sounds/beep.mp3";
import bubble from "../../sounds/bubble.mp3";
import chime from "../../sounds/chime.mp3";
import click from "../../sounds/click.mp3";
import ding from "../../sounds/ding.mp3";
import error from "../../sounds/error.mp3";
import kaching from "../../sounds/kaching.mp3";
import levelup from "../../sounds/levelup.mp3";
import success from "../../sounds/success.mp3";
import upgrade from "../../sounds/upgrade.mp3";

sound.disableAutoPause = true;

sound.add("click", click).singleInstance = true;
sound.add("beep", beep).singleInstance = true;
sound.add("error", error).singleInstance = true;
sound.add("kaching", kaching).singleInstance = true;
sound.add("levelup", levelup).singleInstance = true;
sound.add("bubble", bubble).singleInstance = true;
sound.add("ageup", ageup).singleInstance = true;
sound.add("ding", ding).singleInstance = true;
sound.add("success", success).singleInstance = true;
sound.add("upgrade", upgrade).singleInstance = true;
sound.add("chime", chime).singleInstance = true;

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

export function playAgeUp() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("ageup");
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

export function playDing() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("ding");
}

export function playUpgrade() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("upgrade");
}

export function playSuccess() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("success");
}

export function playChime() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("chime");
}
