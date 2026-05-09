import { useEffect, useRef, useState } from "react";

/**
 * YWEE Branded Page Loader
 *
 * Strategy:
 * 1. Tracks real asset loading via Promise.allSettled on a curated list of
 *    critical resources (hero image, hero video poster, fonts, first-fold
 *    product images).
 * 2. Shows a smooth animated progress bar that advances in two phases:
 *    - Phase A (0–85%): simulated incremental ticks while assets load
 *    - Phase B (85–100%): rapid fill once all assets resolve
 * 3. Displays an elapsed timer in ms / s so the user can see load speed.
 * 4. Fades out gracefully after a minimum display time of 600ms.
 */

// Critical above-the-fold assets to track
const CRITICAL_ASSETS = [
  // Hero video poster / keyframe
  "/manus-storage/ywee-hero-keyframe1.png",
  // Hero video itself (just check metadata, not full download)
  "/manus-storage/ywee-hero-video.mp4",
  // Collection banners (first fold)
  "/manus-storage/ywee-collection-banner1.png",
  "/manus-storage/ywee-collection-banner2.png",
  "/manus-storage/ywee-collection-banner3.png",
  // Category images
  "/manus-storage/ywee-enhanced-floral-dark.png",
  "/manus-storage/ywee-enhanced-light-blue.png",
  "/manus-storage/ywee-enhanced-black-love.png",
  "/manus-storage/ywee-enhanced-dark-solid.png",
];

const MIN_DISPLAY_MS = 700;
const TICK_INTERVAL_MS = 80;
const TICK_INCREMENT_MAX = 4; // max % per tick during phase A

function loadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // always resolve — don't block on 404
    img.src = src;
  });
}

function loadVideo(src: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve();
    video.onerror = () => resolve();
    video.src = src;
  });
}

function loadFonts(): Promise<void> {
  if (typeof document.fonts?.ready === "undefined") return Promise.resolve();
  return document.fonts.ready.then(() => undefined).catch(() => undefined);
}

interface PageLoaderProps {
  onComplete: () => void;
}

export default function PageLoader({ onComplete }: PageLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [exiting, setExiting] = useState(false);
  const startTime = useRef(Date.now());
  const assetsLoaded = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const start = Date.now();
    startTime.current = start;

    // Elapsed timer — updates every 100ms
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 100);

    // Phase A: incremental ticks up to 85%
    tickRef.current = setInterval(() => {
      if (assetsLoaded.current) return;
      const increment = Math.random() * TICK_INCREMENT_MAX + 0.5;
      progressRef.current = Math.min(progressRef.current + increment, 85);
      setProgress(progressRef.current);
    }, TICK_INTERVAL_MS);

    // Load all critical assets
    const imageAssets = CRITICAL_ASSETS.filter(
      (a) => !a.endsWith(".mp4") && !a.endsWith(".webm")
    ).map(loadImage);
    const videoAssets = CRITICAL_ASSETS.filter(
      (a) => a.endsWith(".mp4") || a.endsWith(".webm")
    ).map(loadVideo);
    const fontAsset = loadFonts();

    const allAssets = Promise.allSettled([
      ...imageAssets,
      ...videoAssets,
      fontAsset,
    ]);

    const minDelay = new Promise<void>((resolve) =>
      setTimeout(resolve, MIN_DISPLAY_MS)
    );

    Promise.all([allAssets, minDelay]).then(() => {
      assetsLoaded.current = true;

      // Clear phase A tick
      if (tickRef.current) clearInterval(tickRef.current);

      // Phase B: rapid fill to 100%
      const fill = setInterval(() => {
        progressRef.current = Math.min(progressRef.current + 8, 100);
        setProgress(progressRef.current);
        if (progressRef.current >= 100) {
          clearInterval(fill);
          // Short pause at 100% before exit
          setTimeout(() => {
            setExiting(true);
            setTimeout(() => {
              if (timerRef.current) clearInterval(timerRef.current);
              onComplete();
            }, 550);
          }, 200);
        }
      }, 30);
    });

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onComplete]);

  const formattedTime =
    elapsed < 1000
      ? `${elapsed}ms`
      : `${(elapsed / 1000).toFixed(1)}s`;

  return (
    <div
      className="page-loader"
      style={{
        opacity: exiting ? 0 : 1,
        pointerEvents: exiting ? "none" : "all",
      }}
    >
      {/* Background */}
      <div className="page-loader__bg" />

      {/* Center content */}
      <div className="page-loader__content">
        {/* Logo */}
        <div className="page-loader__logo">
          <span className="page-loader__logo-text">ywee</span>
          <span className="page-loader__logo-plus">+</span>
        </div>

        {/* Tagline */}
        <p className="page-loader__tagline">
          Bold denim for bold girls
        </p>

        {/* Progress bar */}
        <div className="page-loader__bar-track">
          <div
            className="page-loader__bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stats row */}
        <div className="page-loader__stats">
          <span className="page-loader__pct">
            {Math.round(progress)}%
          </span>
          <span className="page-loader__dot">·</span>
          <span className="page-loader__timer">{formattedTime}</span>
        </div>
      </div>

      {/* Decorative floating leaves */}
      <div className="page-loader__leaf page-loader__leaf--1" aria-hidden>
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
          <path
            d="M16 2 C16 2 30 14 30 24 C30 34 24 38 16 38 C8 38 2 34 2 24 C2 14 16 2 16 2Z"
            fill="currentColor"
          />
          <line x1="16" y1="6" x2="16" y2="36" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
        </svg>
      </div>
      <div className="page-loader__leaf page-loader__leaf--2" aria-hidden>
        <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
          <path
            d="M10 2 C10 2 18 9 18 15 C18 21 14 24 10 24 C6 24 2 21 2 15 C2 9 10 2 10 2Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="page-loader__leaf page-loader__leaf--3" aria-hidden>
        <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
          <path
            d="M12 2 C12 2 22 11 22 18 C22 25 17 28 12 28 C7 28 2 25 2 18 C2 11 12 2 12 2Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
