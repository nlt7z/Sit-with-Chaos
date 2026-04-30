"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type SVGProps } from "react";

export type VisualWorkSlideImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

function ChevronLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="m15 6-8 8 8 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <path d="m9 6 8 8-8 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type VisualWorksCarouselProps = {
  images: readonly VisualWorkSlideImage[];
  /** e.g. `rounded-xl` from playground tokens */
  mediaRoundClass?: string;
};

export function VisualWorksCarousel({
  images,
  mediaRoundClass = "rounded-xl",
}: VisualWorksCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const [slideIndex, setSlideIndex] = useState(0);
  const thumbBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const slideCount = images.length;
  const canPrev = slideIndex > 0;
  const canNext = slideIndex < slideCount - 1;

  const goPrev = useCallback(() => {
    setSlideIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setSlideIndex((i) => Math.min(slideCount - 1, i + 1));
  }, [slideCount]);

  const goToSlide = useCallback((i: number) => {
    setSlideIndex(Math.min(Math.max(0, i), slideCount - 1));
  }, [slideCount]);

  /** Scroll active thumbnail into view in the rail */
  useEffect(() => {
    const el = thumbBtnRefs.current[slideIndex];
    el?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [slideIndex, prefersReducedMotion]);

  /** Keyboard (← / →) on focus within gallery */
  const onGalleryKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    },
    [goPrev, goNext],
  );

  const transitionMs = prefersReducedMotion ? 0 : 440;

  return (
    <div
      className="w-full outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Visual works gallery"
      onKeyDown={onGalleryKeyDown}
    >
      <span className="sr-only">{`Image ${slideIndex + 1} of ${slideCount}. Use arrows or thumbnails to browse.`}</span>

      <div className="relative">
        {/* Main track */}
        <div className="overflow-hidden bg-transparent">
          <div
            className="flex ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
            style={{
              transform: `translate3d(${-slideIndex * 100}%, 0, 0)`,
              transitionDuration: `${transitionMs}ms`,
              transitionProperty: "transform",
            }}
          >
            {images.map((image, slideI) => (
              <div
                key={image.src}
                aria-hidden={slideIndex !== slideI}
                className="flex min-h-[min(52vh,360px)] w-full shrink-0 min-w-full items-center justify-center px-4 py-8 sm:px-6 md:min-h-[min(56vh,420px)] md:py-10"
              >
                <figure
                  className={`mx-auto flex w-full max-w-[min(92vw,460px)] justify-center bg-transparent ${mediaRoundClass} overflow-hidden`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(max-width: 639px) 46vw, (max-width: 1024px) 38vw, 460px"
                    className="mx-auto h-auto max-h-[min(70vh,620px)] w-auto max-w-full object-contain"
                  />
                </figure>
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        <button
          type="button"
          aria-label="Previous image"
          disabled={!canPrev}
          onClick={goPrev}
          className={`absolute left-1 top-1/2 z-[1] -translate-y-1/2 rounded-full border border-black/[0.08] bg-white/92 p-2 text-textPrimary shadow-sm backdrop-blur-sm transition-opacity duration-200 md:left-2 md:p-2.5 ${canPrev ? "opacity-95 hover:bg-white hover:opacity-100" : "cursor-not-allowed opacity-35"}`}
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button
          type="button"
          aria-label="Next image"
          disabled={!canNext}
          onClick={goNext}
          className={`absolute right-1 top-1/2 z-[1] -translate-y-1/2 rounded-full border border-black/[0.08] bg-white/92 p-2 text-textPrimary shadow-sm backdrop-blur-sm transition-opacity duration-200 md:right-2 md:p-2.5 ${canNext ? "opacity-95 hover:bg-white hover:opacity-100" : "cursor-not-allowed opacity-35"}`}
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>

      {/* Slide index + thumbnails */}
      <div className="mt-5 md:mt-6">
        <div className="mb-3 flex justify-center">
          <p className="font-mono text-[11px] tracking-[0.22em] text-textSecondary tabular-nums">
            <span aria-hidden>
              {slideIndex + 1} / {slideCount}
            </span>
          </p>
        </div>
        <div
          className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 pt-0.5 [scrollbar-width:thin]"
          aria-label="Gallery thumbnail previews"
        >
          {images.map((image, thumbI) => {
            const isActiveThumb = thumbI === slideIndex;
            return (
              <button
                key={image.src}
                type="button"
                ref={(node) => {
                  thumbBtnRefs.current[thumbI] = node;
                }}
                aria-label={`Show image ${thumbI + 1}: ${image.alt}`}
                title={image.alt}
                onClick={() => goToSlide(thumbI)}
                className={`relative block h-14 w-[4.05rem] shrink-0 overflow-hidden bg-transparent outline-none ring-0 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-black/35 sm:h-[3.85rem] sm:w-[4.95rem] ${mediaRoundClass} ${
                  isActiveThumb
                    ? "opacity-100 ring-2 ring-black/40 ring-offset-2 ring-offset-transparent"
                    : "opacity-60 hover:opacity-90"
                }`}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="92px"
                  className="object-cover"
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
