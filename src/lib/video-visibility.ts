import type Player from "@vimeo/player";

/** Pause offscreen/hidden video; returning to the page never starts playback. */
export function watchVideoVisibility(
  player: Pick<Player, "pause" | "on" | "off">,
  container: HTMLElement,
) {
  const doc = container.ownerDocument;
  const win = doc.defaultView;
  if (!win) return () => {};
  let playing = false;
  let fullscreen = false;
  let pausing = false;
  let visible = false;

  function reconcile() {
    if (playing && !pausing && (doc.hidden || (!visible && !fullscreen))) {
      pausing = true;
      void player
        .pause()
        .catch(() => {})
        .finally(() => {
          pausing = false;
        });
    }
  }
  function measure() {
    const rect = container.getBoundingClientRect();
    const width = Math.max(
      0,
      Math.min(rect.right, win!.innerWidth) - Math.max(rect.left, 0),
    );
    const height = Math.max(
      0,
      Math.min(rect.bottom, win!.innerHeight) - Math.max(rect.top, 0),
    );
    visible =
      rect.width > 0 &&
      rect.height > 0 &&
      (width * height) / (rect.width * rect.height) >= 0.25;
    reconcile();
  }
  const onPlay = () => {
    playing = true;
    reconcile();
  };
  const onPause = () => {
    playing = false;
  };
  const onFullscreen = (event: { fullscreen: boolean }) => {
    fullscreen = event.fullscreen;
    reconcile();
  };
  const onPageHide = () => {
    if (playing) void player.pause().catch(() => {});
  };
  const observer = win.IntersectionObserver
    ? new win.IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
          reconcile();
        },
        { threshold: [0, 0.25] },
      )
    : null;

  measure();
  observer?.observe(container);
  if (!observer) {
    win.addEventListener("scroll", measure, { passive: true });
    win.addEventListener("resize", measure);
  }
  player.on("play", onPlay);
  player.on("pause", onPause);
  player.on("ended", onPause);
  player.on("fullscreenchange", onFullscreen);
  doc.addEventListener("visibilitychange", reconcile);
  win.addEventListener("pagehide", onPageHide);
  return () => {
    observer?.disconnect();
    win.removeEventListener("scroll", measure);
    win.removeEventListener("resize", measure);
    doc.removeEventListener("visibilitychange", reconcile);
    win.removeEventListener("pagehide", onPageHide);
    player.off("play", onPlay);
    player.off("pause", onPause);
    player.off("ended", onPause);
    player.off("fullscreenchange", onFullscreen);
  };
}
