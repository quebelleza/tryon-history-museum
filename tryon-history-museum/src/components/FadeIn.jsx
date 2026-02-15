"use client";

import { useRef, useState, useEffect } from "react";

export default function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const el = ref.current;
    if (!el) return;

    if (mq.matches) {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={
        prefersReducedMotion
          ? {}
          : {
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
            }
      }
    >
      {children}
    </div>
  );
}
