"use client";

import React, { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SlideInOnScrollProps {
  children: ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
}

const SlideInOnScroll: React.FC<SlideInOnScrollProps> = ({
  children,
  delay = 0,
  distance = 100,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // mulai dari turun + sedikit transparan
    gsap.set(el, { y: distance, opacity: 0.2 });

    const animateIn = () => {
      gsap.to(el, {
        y: 0,
        opacity: 1, // fade in lembut
        duration: 1.6,
        ease: "elastic.out(0.8, 0.7)", // bounce naik
        delay,
      });
    };

    const animateOut = () => {
      gsap.to(el, {
        y: distance,
        opacity: 0.2, // fade out halus
        duration: 1.4,
        ease: "elastic.in(0.7, 0.7)", // bounce turun
      });
    };

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      end: "bottom 20%",
      onEnter: animateIn,
      onEnterBack: animateIn,
      onLeaveBack: animateOut,
    });

    return () => trigger.kill();
  }, [delay, distance]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default SlideInOnScroll;
