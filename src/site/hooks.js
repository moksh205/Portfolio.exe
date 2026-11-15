import { useEffect, useRef, useState } from "react";
import { SECTION_IDS } from "./sections";

// Which section is in the middle of the screen (nav + side dots highlight)
export function useActiveSection() {
  const [active, setActive] = useState("hero");
  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.45;
      let cur = "hero";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) cur = id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return active;
}

// true once the element has scrolled into view (stays true)
export function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), options);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  return [ref, inView];
}

// Soft glow that follows the cursor over any element with class "spot"
export function useSpotlight() {
  useEffect(() => {
    const onMove = (e) => {
      const el = e.target.closest?.(".spot");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
}
