import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import type Player from "@vimeo/player";
import { watchVideoVisibility } from "../src/lib/video-visibility";

function fixture(withObserver = true) {
  const dom = new JSDOM('<div id="video"></div>', { pretendToBeVisual: true });
  const container = dom.window.document.getElementById("video")!;
  let top = 10;
  container.getBoundingClientRect = () => ({
    x: 10,
    y: top,
    top,
    left: 10,
    right: 330,
    bottom: top + 320,
    width: 320,
    height: 320,
    toJSON() {},
  });
  let deliver = (_ratio: number) => {};
  let disconnected = false;
  if (withObserver) {
    Object.defineProperty(dom.window, "IntersectionObserver", {
      value: class {
        constructor(callback: (entries: unknown[]) => void) {
          deliver = (ratio) =>
            callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]);
        }
        observe() {}
        disconnect() {
          disconnected = true;
        }
      },
    });
  }
  const handlers = new Map<string, Set<(event?: unknown) => void>>();
  let pauses = 0;
  let plays = 0;
  let rejectPause = false;
  const fakePlayer = {
    pause() {
      pauses++;
      emit("pause");
      return rejectPause
        ? Promise.reject(new Error("Player unavailable"))
        : Promise.resolve();
    },
    play() {
      plays++;
      return Promise.resolve();
    },
    on(name: string, handler: (event?: unknown) => void) {
      if (!handlers.has(name)) handlers.set(name, new Set());
      handlers.get(name)!.add(handler);
    },
    off(name: string, handler: (event?: unknown) => void) {
      handlers.get(name)?.delete(handler);
    },
  };
  function emit(name: string, event?: unknown) {
    handlers.get(name)?.forEach((handler) => handler(event));
  }
  const cleanup = watchVideoVisibility(
    fakePlayer as unknown as Player,
    container,
  );
  return {
    dom,
    cleanup,
    emit,
    deliver: (ratio: number) => deliver(ratio),
    setTop: (value: number) => {
      top = value;
    },
    setReject: () => {
      rejectPause = true;
    },
    get pauses() {
      return pauses;
    },
    get plays() {
      return plays;
    },
    get disconnected() {
      return disconnected;
    },
    get subscriptions() {
      return [...handlers.values()].reduce((n, set) => n + set.size, 0);
    },
  };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

test("Vimeo pauses when mostly scrolled away, never auto-resumes, and handles delayed playback", async () => {
  const f = fixture();
  try {
    f.deliver(1);
    f.emit("play");
    assert.equal(f.pauses, 0);
    f.deliver(0.2);
    await settle();
    assert.equal(f.pauses, 1);
    f.deliver(1);
    assert.equal(f.plays, 0);
    f.deliver(0);
    f.emit("play"); // A delayed play response must not start audio offscreen.
    await settle();
    assert.equal(f.pauses, 2);
    f.cleanup();
    assert.equal(f.disconnected, true);
    assert.equal(f.subscriptions, 0);
    f.dom.window.dispatchEvent(new f.dom.window.Event("pagehide"));
    assert.equal(f.pauses, 2);
  } finally {
    f.cleanup();
    f.dom.window.close();
  }
});

test("Fullscreen playback is preserved, but hidden tabs pause and do not resume", async () => {
  const f = fixture();
  try {
    f.deliver(1);
    f.emit("play");
    f.emit("fullscreenchange", { fullscreen: true });
    f.deliver(0);
    assert.equal(f.pauses, 0);
    Object.defineProperty(f.dom.window.document, "hidden", {
      value: true,
      configurable: true,
    });
    f.dom.window.document.dispatchEvent(
      new f.dom.window.Event("visibilitychange"),
    );
    await settle();
    assert.equal(f.pauses, 1);
    Object.defineProperty(f.dom.window.document, "hidden", {
      value: false,
      configurable: true,
    });
    f.dom.window.document.dispatchEvent(
      new f.dom.window.Event("visibilitychange"),
    );
    assert.equal(f.plays, 0);
    f.emit("play");
    f.emit("fullscreenchange", { fullscreen: false });
    await settle();
    assert.equal(f.pauses, 2);
  } finally {
    f.cleanup();
    f.dom.window.close();
  }
});

test("Scroll fallback and cleanup work without IntersectionObserver, including player errors", async () => {
  const f = fixture(false);
  try {
    f.emit("play");
    f.setTop(-300);
    f.setReject();
    f.dom.window.dispatchEvent(new f.dom.window.Event("scroll"));
    await settle();
    assert.equal(f.pauses, 1);
    f.cleanup();
    f.dom.window.dispatchEvent(new f.dom.window.Event("scroll"));
    assert.equal(f.pauses, 1);
    assert.equal(f.subscriptions, 0);
  } finally {
    f.cleanup();
    f.dom.window.close();
  }
});
