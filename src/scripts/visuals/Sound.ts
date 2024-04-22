import { sound } from "@pixi/sound";
import { getGameOptions } from "../../../shared/logic/GameStateLogic";
import beep from "../../sounds/beep.mp3";
import bubble from "../../sounds/bubble.mp3";
import click from "../../sounds/click.mp3";
import ding from "../../sounds/ding.mp3";
import error from "../../sounds/error.mp3";
import gong from "../../sounds/gong.mp3";
import kaching from "../../sounds/kaching.mp3";
import levelup from "../../sounds/levelup.mp3";
import music from "../../sounds/music/pilgrimage-ancient-mediaeval-harp.mp3";

sound.disableAutoPause = true;

sound.add("click", click).singleInstance = true;
sound.add("beep", beep).singleInstance = true;
sound.add("error", error).singleInstance = true;
sound.add("kaching", kaching).singleInstance = true;
sound.add("levelup", levelup).singleInstance = true;
sound.add("bubble", bubble).singleInstance = true;
sound.add("music", music).singleInstance = true;
sound.add("gong", gong).singleInstance = true;
sound.add("ding", ding).singleInstance = true;

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

export function playGong() {
   if (!getGameOptions().soundEffect) {
      return;
   }
   sound.play("gong");
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
