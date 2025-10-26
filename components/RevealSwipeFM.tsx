"use client";
import { motion } from "framer-motion";
import React from "react";

export default function RevealSwipeFM({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  once = true,
  margin = "-10% 0px",
}: {
  children: React.ReactNode;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  once?: boolean;
  margin?: string;
}) {
  const fromY = direction === "down" ? -30 : 30;
  return (
    <motion.div
      initial={{ opacity: 0, y: fromY, clipPath: direction === "down" ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(0 0 0 0)" }}
      transition={{ duration, delay, ease: [0.22, 0.8, 0.24, 1] }}
      viewport={{ once, margin }}
    >
      {children}
    </motion.div>
  );
}
