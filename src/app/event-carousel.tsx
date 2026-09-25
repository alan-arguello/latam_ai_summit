"use client";

import Image from "next/image";
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { pastEvents } from "@/lib/summit";

export function EventCarousel() {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className="la-carousel"
      role="region"
      aria-label="Fotos de nuestros eventos anteriores"
    >
      <div
        className="la-carousel-window"
        tabIndex={0}
        aria-label="Galería de eventos"
      >
        <div className="la-carousel-track" data-paused={paused}>
          {[false, true].map((duplicate) => (
            <div
              className="la-carousel-group"
              key={String(duplicate)}
              aria-hidden={duplicate || undefined}
            >
              {pastEvents.map((event) => (
                <div className="la-carousel-photo" key={event.image}>
                  <Image
                    src={event.image}
                    alt={duplicate ? "" : event.alt}
                    fill
                    sizes="(max-width: 600px) 260px, 360px"
                    quality={86}
                    loading="eager"
                    fetchPriority="low"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="la-carousel-controls">
        <button
          type="button"
          className="la-icon-button"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Reanudar carrusel" : "Pausar carrusel"}
          title={paused ? "Reanudar carrusel" : "Pausar carrusel"}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
