export default function CaptionArrow() {
  return (
    <div className="flex flex-col items-start gap-2">
      <span className="text-xs md:text-sm text-white/50 italic whitespace-nowrap">
        me, imagined by ai
      </span>

      <svg
        width="140"
        height="90"
        viewBox="0 0 140 90"
        fill="none"
        className="arrow-animate"
      >
        {/* scribble down-right */}
        <path
          d="
            M10 10
            C 30 30,
              60 20,
              80 40
            S 110 70,
              125 78
          "
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* arrow head */}
        <path
          d="M118 70 L126 78 L114 80"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
