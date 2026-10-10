import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";

test("Hero cover starts the unlisted Vimeo video with sound only after a click", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    pretendToBeVisual: true,
    url: "https://chemizen.example",
  });
  const originals = [
    "window",
    "document",
    "HTMLElement",
    "IS_REACT_ACT_ENVIRONMENT",
  ].map(
    (key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const,
  );
  for (const [key, value] of Object.entries({
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  const root = createRoot(dom.window.document.getElementById("root")!);
  try {
    const { HeroVideo } = await import("../src/components/HeroVideo");
    await act(async () => {
      root.render(createElement(HeroVideo));
    });
    let iframe: HTMLIFrameElement | null = null;
    for (let attempt = 0; attempt < 50 && !iframe; attempt++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
      iframe = dom.window.document.querySelector("iframe");
    }
    assert.ok(iframe, "Vimeo iframe should load behind the cover");
    const url = new URL(iframe.src);
    assert.equal(url.origin, "https://player.vimeo.com");
    assert.equal(url.pathname, "/video/1234626254");
    assert.equal(url.searchParams.get("h"), "a918409b88");
    assert.equal(url.searchParams.get("autoplay"), "0");
    assert.equal(url.searchParams.get("muted"), "0");
    assert.equal(iframe.tabIndex, -1);
    const frame =
      dom.window.document.querySelector<HTMLElement>(".hero-video-frame")!;
    let visible = true;
    frame.getBoundingClientRect = () => ({
      x: 10,
      y: 10,
      top: visible ? 10 : -400,
      left: 10,
      right: 330,
      bottom: visible ? 330 : -80,
      width: 320,
      height: 320,
      toJSON() {},
    });
    dom.window.dispatchEvent(new dom.window.Event("resize"));
    const commands: { method: string; value?: unknown }[] = [];
    const respond = (data: unknown) =>
      dom.window.dispatchEvent(
        new dom.window.MessageEvent("message", {
          origin: "https://player.vimeo.com",
          source: iframe!.contentWindow!,
          data,
        }),
      );
    iframe.contentWindow!.postMessage = ((message: {
      method: string;
      value?: unknown;
    }) => {
      commands.push(message);
      queueMicrotask(() =>
        respond({ method: message.method, value: message.value ?? null }),
      );
    }) as Window["postMessage"];
    await act(async () => {
      respond({ event: "ready" });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    assert.equal(
      commands.some((message) => message.method === "play"),
      false,
    );
    const button =
      dom.window.document.querySelector<HTMLButtonElement>(
        ".hero-video-cover",
      )!;
    assert.equal(button.disabled, false);
    assert.doesNotMatch(button.textContent!, /Inside Chemizen Labs/);
    assert.equal(
      button.querySelector<HTMLImageElement>(".hero-video-logo")?.alt,
      "Chemizen Labs",
    );
    assert.match(
      button.textContent!,
      /Practical training in computational drug discovery/,
    );
    await act(async () => {
      button.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    assert.ok(
      commands.some(
        (message) => message.method === "setMuted" && message.value === false,
      ),
    );
    assert.ok(
      commands.some(
        (message) => message.method === "setVolume" && message.value === 1,
      ),
    );
    assert.ok(commands.some((message) => message.method === "play"));
    assert.equal(dom.window.document.querySelector(".hero-video-cover"), null);
    assert.equal(iframe.tabIndex, 0);
    assert.equal(iframe.parentElement?.getAttribute("aria-hidden"), "false");
    await act(async () => {
      respond({
        event: "play",
        data: { seconds: 1, duration: 60, percent: 1 / 60 },
      });
      visible = false;
      dom.window.dispatchEvent(new dom.window.Event("scroll"));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    assert.ok(commands.some((message) => message.method === "pause"));
    const playCount = commands.filter(
      (message) => message.method === "play",
    ).length;
    visible = true;
    dom.window.dispatchEvent(new dom.window.Event("scroll"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(
      commands.filter((message) => message.method === "play").length,
      playCount,
    );
    await act(async () => {
      root.unmount();
    });
    assert.equal(dom.window.document.querySelector("iframe"), null);
  } finally {
    await act(async () => {
      root.unmount();
    });
    dom.window.close();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
