"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef } from "react";

export default function GlobalLoader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });

      // Pulse effect
      tl.to(iconRef.current, {
        scale: 1.2,
        duration: 0.8,
        ease: "power2.inOut",
        opacity: 0.8,
      }).to(iconRef.current, {
        scale: 1,
        duration: 0.8,
        ease: "power2.inOut",
        opacity: 1,
      });

      // Subtle rotation
      gsap.to(iconRef.current, {
        rotation: 360,
        duration: 10,
        repeat: -1,
        ease: "linear",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />

        <Image
          ref={iconRef}
          src="/icon.svg"
          alt="Loading..."
          width={64}
          height={64}
          className="relative z-10"
          priority
        />
      </div>
      <p className="mt-4 text-muted-foreground text-sm font-medium animate-pulse">
        Loading...
      </p>
    </div>
  );
}
