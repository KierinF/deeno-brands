"use client";

interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  duration?: number;
  className?: string;
}

export default function Marquee({
  children,
  direction = "left",
  duration = 30,
  className = "",
}: MarqueeProps) {
  return (
    <div
      className={`marquee-container overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className={
          direction === "left"
            ? "animate-marquee-left"
            : "animate-marquee-right"
        }
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {/* Duplicated twice for seamless loop */}
        <span className="flex items-center">{children}</span>
        <span className="flex items-center">{children}</span>
      </div>
    </div>
  );
}
