import { sound } from "@pixi/sound";
import beep from "../../sounds/beep.mp3";
import click from "../../sounds/click.mp3";
import error from "../../sounds/error.mp3";
import kaching from "../../sounds/kaching.mp3";

sound.add("click", click);
sound.add("beep", beep);
sound.add("error", error);
sound.add("kaching", kaching);

export function playClick() {
   sound.play("click");
}

export function playBeep() {
   sound.play("beep");
}

export function playError() {
   sound.play("error");
}

export function playKaching() {
   sound.play("kaching");
}
