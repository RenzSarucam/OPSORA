import Image from "next/image";

const UNIT_WIDTH = 240;
const UNIT_POINTS: [number, number][] = [
  [0, 24],
  [28, 24],
  [38, 6],
  [48, 42],
  [58, 24],
  [120, 24],
  [148, 24],
  [158, 6],
  [168, 42],
  [178, 24],
  [240, 24],
];

function buildSegment(offsetX: number): string {
  return UNIT_POINTS.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x + offsetX},${y}`).join(" ");
}

// Two copies of the same heartbeat unit joined end to end (flat-to-flat), so
// translating the whole thing left by one unit width loops seamlessly.
const EKG_PATH = `${buildSegment(0)} ${buildSegment(UNIT_WIDTH)}`;

export function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="opsora-loading-ring absolute h-16 w-16 rounded-full bg-primary/30" />
        <Image
          src="/opsora-icon.png"
          alt=""
          width={56}
          height={56}
          priority
          className="opsora-loading-icon relative h-14 w-14"
        />
      </div>

      <div className="h-12 w-60 overflow-hidden">
        <svg
          viewBox={`0 0 ${UNIT_WIDTH * 2} 48`}
          className="opsora-loading-ekg h-12 w-[480px] text-primary"
        >
          <path
            d={EKG_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Loading Opsora
      </p>
    </div>
  );
}