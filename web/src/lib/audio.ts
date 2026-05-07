import { Howl } from "howler";

let engine: Howl | null = null;
let click: Howl | null = null;

export function initAudio() {
  if (typeof window === "undefined") return;
  if (!engine) engine = new Howl({ src: ["/audio/engine-rev.mp3"], loop: true, volume: 0 });
  if (!click) click = new Howl({ src: ["/audio/click-thunk.mp3"], volume: 0.3 });
}

export function setMuted(muted: boolean) {
  initAudio();
  if (!engine) return;
  if (muted) {
    engine.volume(0);
  } else {
    if (!engine.playing()) engine.play();
    engine.fade(0, 0.2, 800);
  }
  localStorage.setItem("speedison-muted", muted ? "1" : "0");
}

export function playClick() {
  initAudio();
  if (localStorage.getItem("speedison-muted") === "1") return;
  click?.play();
}

export function getInitialMuted(): boolean {
  if (typeof localStorage === "undefined") return true;
  const v = localStorage.getItem("speedison-muted");
  return v === null ? true : v === "1";
}
