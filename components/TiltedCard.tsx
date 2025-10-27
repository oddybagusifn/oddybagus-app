import type { SpringOptions } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useInView,
} from "motion/react";

interface TiltedCardProps {
  imageSrc: React.ComponentProps<"img">["src"];
  altText?: string;
  captionText?: string;
  containerHeight?: React.CSSProperties["height"];
  containerWidth?: React.CSSProperties["width"];
  imageHeight?: React.CSSProperties["height"];
  imageWidth?: React.CSSProperties["width"];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: React.ReactNode;
  displayOverlayContent?: boolean;
}

const springValues: SpringOptions = { damping: 30, stiffness: 100, mass: 2 };

type ForceMode = "auto" | "open" | "closed";

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { margin: "-10% 0% -10% 0%" });

  // 🔒 Internal controller: "auto" (scroll), "open" (paksa muncul), "closed" (paksa tertutup)
  const [forceMode, setForceMode] = useState<ForceMode>("auto");
  const isVisible = forceMode === "open" ? true : forceMode === "closed" ? false : isInView;

  // Keyboard shortcuts: A=auto, O=open, C=closed
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "a") setForceMode("auto");
      if (e.key.toLowerCase() === "o") setForceMode("open");
      if (e.key.toLowerCase() === "c") setForceMode("closed");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });

  // Dynamic shadow based on tilt
  const shadowX = useTransform(rotateY, (v) => v * 1.2);
  const shadowY = useTransform(rotateX, (v) => -v * 1.2);
  const boxShadow = useMotionTemplate`${shadowX}px ${shadowY}px 40px rgba(0,0,0,0.35)`;

  // Subtle glossy spotlight (sangat tipis) — hanya di area gambar (parent frame)
  const glossySpotlight = useMotionTemplate`radial-gradient(
    180px 120px at ${x}px ${y}px,
    rgba(255,255,255,0.10),
    rgba(255,255,255,0.04) 40%,
    rgba(255,255,255,0.00) 70%
  )`;

  const [lastY, setLastY] = useState(0);

  function handleMouse(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    rotateFigcaption.set(-(offsetY - lastY) * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <motion.figure
      ref={ref}
      className="group relative w-full h-full [perspective:800px] flex flex-col items-center justify-center"
      style={{ height: containerHeight, width: containerWidth }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}         // ✅ muncul & tertutup
      variants={{
        hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" },
      }}
      transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} // default internal timing
    >
      {/* Mini control overlay (internal), muncul saat hover */}
      <div className="absolute top-2 right-2 z-[5] hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setForceMode("auto")}
          className={`px-2 py-1 text-[10px] rounded border ${
            forceMode === "auto" ? "bg-white text-black border-black" : "bg-black/60 text-white border-white/20"
          }`}
          title="Auto (scroll-controlled) — or press A"
        >
          Auto
        </button>
        <button
          onClick={() => setForceMode("open")}
          className={`px-2 py-1 text-[10px] rounded border ${
            forceMode === "open" ? "bg-white text-black border-black" : "bg-black/60 text-white border-white/20"
          }`}
          title="Force Open — or press O"
        >
          Open
        </button>
        <button
          onClick={() => setForceMode("closed")}
          className={`px-2 py-1 text-[10px] rounded border ${
            forceMode === "closed" ? "bg-white text-black border-black" : "bg-black/60 text-white border-white/20"
          }`}
          title="Force Closed — or press C"
        >
          Close
        </button>
      </div>

      {showMobileWarning && (
        <div className="absolute top-4 text-center text-sm block sm:hidden">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      )}

      <motion.div
        className="relative [transform-style:preserve-3d] overflow-hidden rounded-[0px]"
        style={{ width: imageWidth, height: imageHeight, rotateX, rotateY, scale, boxShadow }}
      >
        {/* Spotlight tipis & glossy */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: glossySpotlight,
            opacity,
            mixBlendMode: "screen",
            filter: "blur(10px)",
            transition: "background 0.3s ease-out, opacity 0.3s ease-out",
          }}
        />

        <motion.img
          src={imageSrc}
          alt={altText}
          className="absolute top-0 left-0 object-cover rounded-[0px] z-[0] will-change-transform"
          style={{ width: imageWidth, height: imageHeight }}
        />

        {displayOverlayContent && overlayContent && (
          <motion.div className="absolute top-0 left-0 z-[2] will-change-transform [transform:translateZ(30px)]">
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-[0px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] hidden sm:block"
          style={{ x, y, opacity, rotate: rotateFigcaption }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </motion.figure>
  );
}
