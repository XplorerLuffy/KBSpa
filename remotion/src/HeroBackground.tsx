import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Brand palette — mirrors app/globals.css so this matches the live site exactly.
const GOLD = "#d4af37";
const GOLD_SOFT = "#eacd63";
const GOLD_LIGHT = "#f3e29c";
const OLIVE = "#7d8a55";
const OLIVE_DEEP = "#4c5536";
const OLIVE_NIGHT = "#363c2b";
const CREAM = "#faf6ee";
const CHARCOAL = "#1c1a18";

const PARTICLE_COUNT = 32;

function Particle({ index, loopSeconds }: { index: number; loopSeconds: number }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = (frame / fps) % loopSeconds;
  const phase = (t / loopSeconds) * Math.PI * 2;

  const seed = `particle-${index}`;
  const xBase = random(`${seed}-x`) * width;
  const size = 6 + random(`${seed}-size`) * 22;
  const driftX = 40 + random(`${seed}-driftx`) * 90;
  const speed = 0.6 + random(`${seed}-speed`) * 0.9;
  const yOffset = random(`${seed}-y`) * height;
  const isOlive = random(`${seed}-color`) > 0.72;

  // Sine-driven motion over exactly one loop period => seamless loop.
  const y = ((yOffset + phase * speed * (height / (Math.PI * 2))) % (height + 120)) - 60;
  const x = xBase + Math.sin(phase * (1 + random(`${seed}-freq`))) * driftX;
  const opacity = 0.32 + Math.sin(phase * 2 + index) * 0.18 + 0.16;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: isOlive ? OLIVE : GOLD_LIGHT,
        boxShadow: isOlive ? `0 0 ${size}px ${OLIVE}` : `0 0 ${size * 1.4}px ${GOLD}`,
        opacity: Math.max(0.1, opacity),
        filter: `blur(${size / 5}px)`,
      }}
    />
  );
}

function LightRays({ loopSeconds }: { loopSeconds: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame / fps) % loopSeconds;
  // One full slow rotation per loop => the ray sweep returns to its start frame.
  const rotation = (t / loopSeconds) * 360;
  const pulse = 0.5 + Math.sin((t / loopSeconds) * Math.PI * 2) * 0.08;

  return (
    <AbsoluteFill style={{ mixBlendMode: "soft-light" }}>
      <div
        style={{
          position: "absolute",
          inset: "-50%",
          background: `conic-gradient(from ${rotation}deg at 50% 45%, transparent 0deg, ${GOLD}55 12deg, transparent 45deg, transparent 180deg, ${GOLD_SOFT}44 205deg, transparent 240deg, transparent 360deg)`,
          opacity: pulse,
        }}
      />
    </AbsoluteFill>
  );
}

export function HeroBackground() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const loopSeconds = durationInFrames / fps;
  const t = frame / fps;

  // Slow breathing gradient — one full cycle per loop, so it ties off cleanly.
  const cyclePhase = (t / loopSeconds) * Math.PI * 2;
  const gradientShift = 50 + Math.sin(cyclePhase) * 8;

  // Gentle continuous scale/rotate on the watermark logo, exactly one cycle per loop.
  const logoScale = 1 + Math.sin(cyclePhase) * 0.035;
  const logoRotate = Math.sin(cyclePhase) * 2.2;
  const logoOpacity = interpolate(
    frame,
    [0, fps * 1.2, durationInFrames - fps * 1.2, durationInFrames],
    [0, 0.16, 0.16, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(130% 100% at ${gradientShift}% 12%, ${CREAM} 0%, ${GOLD_LIGHT} 24%, ${GOLD_SOFT} 40%, ${OLIVE} 62%, ${OLIVE_DEEP} 82%, ${CHARCOAL} 100%)`,
      }}
    >
      <LightRays loopSeconds={loopSeconds} />

      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle key={i} index={i} loopSeconds={loopSeconds} />
      ))}

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
        }}
      >
        <Img
          src={staticFile("icon-mark.png")}
          style={{ width: 620, height: 620, opacity: logoOpacity }}
        />
      </AbsoluteFill>

      {/* Soft vignette so the edges recede — keeps focus centered under the site's headline overlay. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 100% at 50% 42%, transparent 40%, ${OLIVE_NIGHT}66 75%, ${CHARCOAL}b3 100%)`,
        }}
      />
    </AbsoluteFill>
  );
}
