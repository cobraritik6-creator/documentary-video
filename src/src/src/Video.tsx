import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {loadFont} from "@remotion/google-fonts/Montserrat";

const {fontFamily} = loadFont("normal", {
  weights: ["600", "800", "900"],
  subsets: ["latin", "latin-ext"],
});
const FONT = `${fontFamily}, "Helvetica Neue", Arial, sans-serif`;

const FPS = 30;
const OV = 10;
const sec = (s: number) => Math.round(s * FPS);
export const DURATION = sec(60);

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const C = {
  bg: "#06070A",
  amber: "#FFB224",
  red: "#FF3B30",
  ice: "#6FD3FF",
  violet: "#C58BFF",
  white: "#F6F3EC",
  dim: "rgba(246,243,236,0.55)",
};

const project = (lon: number, lat: number): [number, number] => [
  (lon - 67.5) * 27.9 + 110,
  (38 - lat) * 30 + 20,
];

const INDIA_LONLAT: [number, number][] = [
  [74.3, 34.8], [75.8, 36.7], [77.8, 35.5], [79.0, 34.2], [78.5, 32.6],
  [79.0, 31.0], [80.2, 30.5], [81.0, 30.1], [80.1, 28.8], [81.9, 27.9],
  [84.0, 27.3], [86.0, 26.6], [88.15, 26.5], [88.2, 27.1], [88.0, 27.9],
  [88.9, 27.3], [89.0, 26.9], [89.8, 26.8], [91.6, 26.8], [92.1, 27.8],
  [93.5, 28.0], [95.2, 29.2], [96.5, 29.3], [97.3, 28.2], [96.2, 27.3],
  [95.1, 26.2], [94.7, 25.0], [94.2, 23.9], [93.3, 22.9], [93.0, 22.0],
  [92.4, 22.7], [92.3, 23.7], [91.4, 23.0], [91.2, 24.3], [90.2, 25.1],
  [89.8, 25.3], [89.8, 26.0], [89.0, 26.2], [88.4, 26.2], [88.3, 25.4],
  [88.1, 24.7], [88.8, 23.5], [89.0, 22.2], [88.4, 21.7], [87.0, 21.5],
  [86.7, 20.2], [85.0, 19.3], [84.0, 18.3], [82.3, 16.7], [80.9, 15.8],
  [80.2, 13.5], [79.8, 11.8], [79.3, 10.3], [78.2, 8.9], [77.5, 8.1],
  [76.5, 8.9], [75.8, 11.0], [74.8, 12.9], [74.1, 14.8], [73.3, 16.5],
  [72.8, 18.9], [72.7, 20.9], [72.5, 22.3], [70.8, 20.8], [69.0, 22.2],
  [68.2, 23.6], [68.8, 24.3], [70.0, 24.2], [71.0, 24.4], [70.2, 26.0],
  [70.5, 27.8], [71.9, 27.9], [73.0, 29.2], [74.5, 31.0], [74.0, 32.2],
  [73.9, 33.8],
];

const INDIA: [number, number][] = INDIA_LONLAT.map(([lo, la]) => project(lo, la));
const INDIA_PATH =
  "M" + INDIA.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L") + "Z";

const inside = (x: number, y: number, poly: [number, number][]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

const MUMBAI = project(72.85, 19.05);
const KOLKATA = project(88.36, 22.57);

type Dot = {x: number; y: number; dA: number; dB: number; ph: number};

const DOTS: Dot[] = (() => {
  const out: Dot[] = [];
  const step = 15;
  for (let y = 20; y <= 950; y += step) {
    const row = Math.round((y - 20) / step);
    for (let x = 100; x <= 1000; x += step) {
      const px = x + (row % 2) * (step / 2);
      if (inside(px, y, INDIA)) {
        out.push({
          x: px,
          y,
          dA: Math.hypot(px - MUMBAI[0], y - MUMBAI[1]),
          dB: Math.hypot(px - KOLKATA[0], y - KOLKATA[1]),
          ph: px * 0.013 + y * 0.017,
        });
      }
    }
  }
  return out;
})();

type Anim = "slideUp" | "slideLeft" | "slideRight" | "zoom" | "fade" | "blurIn";

interface Line {
  from: number;
  to: number;
  lines: string[];
  anim: Anim;
  size?: number;
  y?: number;
  highlight?: string[];
  hlColor?: string;
  color?: string;
}

const LINES: Line[] = [
  {from: 0, to: 1.6, lines: ["Parle-G ke wrapper wali", "bacchi ko poora India", "dhoondhta raha…"], anim: "slideUp", size: 66, highlight: ["parleg"]},
  {from: 1.6, to: 3, lines: ["par wo kabhi thi", "hi nahi."], anim: "zoom", size: 98, highlight: ["nahi"], hlColor: C.red},

  {from: 3, to: 6.6, lines: ["1939 me Parle ne India ka", "apna glucose biscuit banaya…"], anim: "slideUp", size: 66, highlight: ["1939"]},
  {from: 6.6, to: 9.6, lines: ["Parle Gluco."], anim: "zoom", size: 128, y: 300, highlight: ["parle", "gluco"]},
  {from: 9.6, to: 11.9, lines: ["Maksad simple tha:"], anim: "slideRight", size: 78},
  {from: 11.9, to: 15, lines: ["Indian pockets ke", "liye sasta biscuit."], anim: "slideUp", size: 72, highlight: ["indian", "sasta"]},

  {from: 15, to: 17.8, lines: ["Phir Britannia jaise", "competitors aaye."], anim: "slideRight", size: 72, highlight: ["britannia"], hlColor: C.ice},
  {from: 17.8, to: 21.5, lines: ["Log sirf 'glucose biscuit'", "maangte the, aur brands", "ki line blur ho gayi."], anim: "blurIn", size: 62, highlight: ["glucose", "biscuit", "blur"], hlColor: C.violet},
  {from: 21.5, to: 22.9, lines: ["1980s me naam badla:"], anim: "slideUp", size: 70, highlight: ["1980s"]},
  {from: 22.9, to: 24.3, lines: ["Parle-G."], anim: "zoom", size: 150, y: 300, highlight: ["parleg"]},
  {from: 24.3, to: 26.4, lines: ["Yahan 'G' ka matlab tha", "Glucose, Genius nahi."], anim: "slideUp", size: 66, highlight: ["glucose"]},
  {from: 26.4, to: 28.4, lines: ["Genius to baad ki", "marketing thi."], anim: "fade", size: 66, highlight: ["marketing"], hlColor: C.red},

  {from: 28, to: 30.5, lines: ["Aur wo bacchi?"], anim: "zoom", size: 112, y: 300, highlight: ["bacchi"]},
  {from: 38, to: 39.6, lines: ["Sach?"], anim: "zoom", size: 190, y: 330, color: C.red},
  {from: 39.6, to: 45, lines: ["Wo 1960s me artist", "Maganlal Dahiya ki banayi", "hui sirf ek drawing hai."], anim: "slideUp", size: 60, highlight: ["1960s", "maganlal", "dahiya", "drawing"]},

  {from: 45, to: 48.6, lines: ["Aaj ye brand duniya ka", "best-selling biscuit", "mana jata hai,"], anim: "slideUp", size: 68, highlight: ["bestselling"]},
  {from: 48.6, to: 52.6, lines: ["aur 2013 me ₹5,000 crore ki", "retail sales paar kar gaya."], anim: "slideLeft", size: 58, highlight: ["5000", "crore"]},
  {from: 52.6, to: 57, lines: ["Wo bhi ek aisi bacchi ke saath", "jo kabhi existed hi nahi."], anim: "blurIn", size: 64, highlight: ["existed", "nahi"], hlColor: C.red},

  {from: 57, to: 60, lines: ["Aapko kya lagta tha,", "wo kaun hai?", "Comment me batao."], anim: "slideUp", size: 74, highlight: ["kaun", "comment"]},
];

const NAMES: {from: number; to: number; caption: string; name: [string, string]}[] = [
  {from: 30.5, to: 33, caption: "90s me kaha gaya wo…", name: ["NEERU", "DESHPANDE"]},
  {from: 33, to: 35.5, caption: "kisi ne kaha…", name: ["SUDHA", "MURTY"]},
  {from: 35.5, to: 38, caption: "kisi ne kaha…", name: ["GUNJAN", "GUNDANIYA"]},
];

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9₹]/g, "");

const KineticText: React.FC<{
  lines: string[];
  anim: Anim;
  size?: number;
  highlight?: string[];
  hlColor?: string;
  color?: string;
  stagger?: number;
}> = ({lines, anim, size = 68, highlight = [], hlColor = C.amber, color = C.white, stagger = 3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  let idx = 0;

  return (
    <div
      style={{
        textAlign: "center",
        fontSize: size,
        fontWeight: 800,
        lineHeight: 1.14,
        letterSpacing: -1.5,
        color,
        textShadow: "0 6px 40px rgba(0,0,0,0.85)",
      }}
    >
      {lines.map((line, li) => (
        <div
          key={li}
          style={{display: "flex", justifyContent: "center", flexWrap: "wrap", gap: size * 0.26}}
        >
          {line.split(" ").map((word, wi) => {
            const i = idx++;
            const p = spring({
              frame: frame - i * stagger,
              fps,
              config:
                anim === "zoom"
                  ? {damping: 11, stiffness: 140, mass: 0.6}
                  : {damping: 22, stiffness: 150, mass: 0.7},
            });
            const opacity = clamp01(p * 1.5);
            let transform = "none";
            let filter = "none";
            switch (anim) {
              case "slideUp":
                transform = `translateY(${(1 - p) * 80}px)`;
                break;
              case "slideLeft":
                transform = `translateX(${(1 - p) * 160}px)`;
                break;
              case "slideRight":
                transform = `translateX(${-(1 - p) * 160}px)`;
                break;
              case "zoom":
                transform = `scale(${interpolate(p, [0, 1], [2.2, 1])})`;
                break;
              case "blurIn":
                transform = `scale(${1.15 - 0.15 * p})`;
                filter = `blur(${Math.max(0, (1 - p) * 18)}px)`;
                break;
              case "fade":
              default:
                break;
            }
            const hl = highlight.includes(norm(word));
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  opacity,
                  transform,
                  filter,
                  color: hl ? hlColor : undefined,
                  textShadow: hl
                    ? `0 0 36px ${hlColor}88, 0 6px 40px rgba(0,0,0,0.85)`
                    : undefined,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const LineScene: React.FC<{line: Line; dur: number; isLast: boolean}> = ({line, dur, isLast}) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, dur], [1, 1.045], clamp);
  const exitOpacity = isLast ? 1 : interpolate(frame, [dur - OV, dur], [1, 0], clamp);
  const exitY = isLast
    ? 0
    : interpolate(frame, [dur - OV, dur], [0, -26], {...clamp, easing: Easing.in(Easing.quad)});

  return (
    <AbsoluteFill style={{opacity: exitOpacity, transform: `translateY(${exitY}px)`}}>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: line.y ?? 250,
          transform: `scale(${drift})`,
          transformOrigin: "center top",
        }}
      >
        <KineticText
          lines={line.lines}
          anim={line.anim}
          size={line.size}
          highlight={line.highlight}
          hlColor={line.hlColor}
          color={line.color}
        />
      </div>
    </AbsoluteFill>
  );
};
