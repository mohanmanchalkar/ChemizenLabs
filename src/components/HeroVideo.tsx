"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle, Play, RotateCcw } from "lucide-react";
import type Player from "@vimeo/player";
import { watchVideoVisibility } from "@/lib/video-visibility";

const VIMEO_URL = "https://player.vimeo.com/video/1234626254?h=a918409b88";

export function HeroVideo() {
  const frame = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<Player | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const container = host.current;
    const surface = frame.current;
    if (!container || !surface) return;
    let disposed = false;
    let instance: Player | undefined;
    let unwatch = () => {};
    let unavailableAlready = false;
    const unavailable = () => {
      if (disposed || unavailableAlready) return;
      unavailableAlready = true;
      const iframe = container.querySelector("iframe");
      if (iframe) iframe.tabIndex = -1;
      if (instance) void instance.pause().catch(() => {});
      setFailed(true);
      setReady(false);
      setRevealed(false);
      setNotice("The video couldn’t load. Try again or open it on Vimeo.");
    };
    const timeout = window.setTimeout(unavailable, 20000);
    void import("@vimeo/player")
      .then(({ default: VimeoPlayer }) => {
        if (disposed) return;
        // The SDK owns this iframe, so its cleanup never removes React-owned DOM.
        const iframe = document.createElement("iframe");
        iframe.src = `${VIMEO_URL}&autoplay=0&muted=0&playsinline=1&title=0&byline=0&portrait=0&dnt=1`;
        iframe.title = "Chemizen Labs — introduction video";
        iframe.allow =
          "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.tabIndex = -1;
        container.appendChild(iframe);
        instance = new VimeoPlayer(iframe);
        player.current = instance;
        unwatch = watchVideoVisibility(instance, surface);
        instance.on("error", (error) => {
          if (
            !error.method ||
            error.name === "PrivacyError" ||
            error.name === "PasswordError"
          )
            unavailable();
        });
        instance.on("play", () => {
          if (!disposed) setNotice("");
        });
        return instance.ready().then(() => {
          if (disposed) return;
          window.clearTimeout(timeout);
          unavailableAlready = false;
          setFailed(false);
          setNotice("");
          setReady(true);
        });
      })
      .catch(unavailable);
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      unwatch();
      player.current = null;
      if (instance) void instance.destroy().catch(() => {});
      container.replaceChildren();
    };
  }, [attempt]);

  function play() {
    if (failed) {
      setFailed(false);
      setReady(false);
      setNotice("");
      setAttempt((value) => value + 1);
      return;
    }
    const video = player.current;
    if (!ready || !video) return;
    setRevealed(true);
    setNotice("");
    const iframe = host.current?.querySelector("iframe");
    if (iframe) {
      iframe.tabIndex = 0;
      iframe.focus({ preventScroll: true });
    }
    // Keep play in the click handler rather than awaiting an effect or SDK load.
    void video.setMuted(false).catch(() => {});
    void video.setVolume(1).catch(() => {});
    void video.play().catch(() => {
      setNotice("Press play in the video player to start with sound.");
    });
  }

  return (
    <div
      className="hero-video"
      role="group"
      aria-label="Chemizen Labs introduction video"
    >
      <div className="video-placeholder hero-video-frame" ref={frame}>
        <div
          className="hero-video-player"
          ref={host}
          aria-hidden={!revealed}
          data-visible={revealed}
        />
        {!revealed && (
          <button
            type="button"
            className="hero-video-cover"
            onClick={play}
            disabled={!ready && !failed}
            aria-label={
              failed
                ? "Retry loading the introduction video"
                : ready
                  ? "Play the Chemizen Labs introduction with sound"
                  : "Loading introduction video"
            }
          >
            <Image
              className="hero-video-dna"
              src="/assets/GlossyDNAnobg.png"
              alt=""
              fill
              sizes="(max-width: 760px) 70vw, 340px"
            />
            <span className="hero-video-cover-copy">
              <span className="hero-video-brand">
                <Image
                  className="hero-video-symbol"
                  src="/assets/chemizen-logo-gold.png"
                  alt=""
                  width={34}
                  height={34}
                />
                <Image
                  className="hero-video-logo"
                  src="/assets/logo-text-white.png"
                  alt="Chemizen Labs"
                  width={130}
                  height={43}
                />
              </span>
              <span className="hero-video-heading">
                Structured Training and Certification
              </span>
              <span className="hero-video-description">
                Practical training in computational drug discovery
              </span>
            </span>
            <span className="hero-video-play">
              <span className="hero-video-play-icon" aria-hidden="true">
                {failed ? (
                  <RotateCcw size={20} />
                ) : ready ? (
                  <Play size={20} fill="currentColor" />
                ) : (
                  <LoaderCircle size={20} className="hero-video-loading" />
                )}
              </span>
              <span className="hero-video-play-label">
                {failed ? "Try again" : ready ? "Play film" : "Loading video…"}
              </span>
            </span>
          </button>
        )}
      </div>
      {notice && (
        <p className="hero-video-notice" role="status">
          {notice}
        </p>
      )}
      {failed && (
        <a
          className="hero-video-fallback"
          href={VIMEO_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Watch on Vimeo <ArrowUpRight size={15} />
        </a>
      )}
      <noscript>
        <a href={VIMEO_URL}>Watch the Chemizen Labs introduction on Vimeo</a>
      </noscript>
    </div>
  );
}
