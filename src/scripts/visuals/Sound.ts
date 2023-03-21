import { sound } from "@pixi/sound";
import beep from "../../sounds/beep.mp3";
import click from "../../sounds/click.mp3";

sound.add("click", click);
sound.add("beep", beep);

export function playClick() {
   sound.play("click");
}

export function playBeep() {
   sound.play("beep");
}
