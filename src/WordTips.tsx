import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {loadFont} from "@remotion/google-fonts/Inter";

const {fontFamily} = loadFont("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin"],
});

const BLUE = "#185abd";
const SELECT = "#a8c8f5";

const TEXT =
  "Dulu aku selalu block teks pakai drag mouse pelan-pelan, sampai jari pegal dan hasilnya sering meleset. Ternyata ada cara yang jauh lebih cepat dan nggak ribet sama sekali.";
const WORDS = TEXT.split(" ").map((w) => w + " ");
const TARGET = WORDS.findIndex((w) => w.trim() === "cepat");

// Timeline klik (frame @30fps)
const CLICKS = [
  {f: 100, n: 1},
  {f: 108, n: 2}, // double click -> 1 kata
  {f: 160, n: 1},
  {f: 168, n: 2},
  {f: 176, n: 3}, // triple click -> 1 paragraf
];

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

// ---------- Header per fase ----------
const Header: React.FC<{start: number; small: string; big: string; sub?: string}> = ({
  start,
  small,
  big,
  sub,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - start, fps, config: {damping: 14}});
  return (
    <div
      style={{
        position: "absolute",
        top: 150,
        left: 60,
        right: 60,
        textAlign: "center",
        color: "white",
        opacity: Math.min(1, s * 2),
        transform: `translateY(${(1 - s) * 60}px)`,
      }}
    >
      <div style={{fontSize: 38, fontWeight: 600, opacity: 0.8, letterSpacing: 2}}>
        {small}
      </div>
      <div style={{fontSize: 118, fontWeight: 800, lineHeight: 1.05, marginTop: 18}}>
        {big}
      </div>
      {sub ? (
        <div style={{fontSize: 70, fontWeight: 800, marginTop: 22, color: "#ffd84d"}}>
          {sub}
        </div>
      ) : null}
    </div>
  );
};

// ---------- Kursor + ripple ----------
const Cursor: React.FC<{frame: number}> = ({frame}) => {
  const move = interpolate(frame, [40, 95], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const x = (1 - move) * 260;
  const y = (1 - move) * 520;
  const appear = interpolate(frame, [40, 55], [0, 1], clamp);
  const fade = interpolate(frame, [235, 250], [1, 0], clamp);
  const pressed = CLICKS.some((c) => frame >= c.f && frame < c.f + 4);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "60%",
        transform: `translate(${x}px, ${y}px)`,
        opacity: appear * fade,
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      {CLICKS.map((c) => {
        const p = (frame - c.f) / 14;
        if (p < 0 || p > 1) return null;
        const size = 20 + p * 110;
        return (
          <div
            key={c.f}
            style={{
              position: "absolute",
              left: 5 - size / 2,
              top: 3 - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              border: `5px solid ${BLUE}`,
              opacity: 1 - p,
            }}
          />
        );
      })}
      <svg
        width={78}
        height={78}
        viewBox="0 0 30 36"
        style={{
          transform: `scale(${pressed ? 0.85 : 1})`,
          transformOrigin: "5px 3px",
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.35))",
        }}
      >
        <path
          d="M5 3 L5 27 L11 21 L16 33 L20 31 L15 20 L23 20 Z"
          fill="white"
          stroke="black"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// ---------- Badge hitungan klik ----------
const ClickBadge: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const last = [...CLICKS].reverse().find((c) => frame >= c.f);
  const visible = interpolate(frame, [100, 108, 232, 245], [0, 1, 1, 0], clamp);
  if (!last) return null;
  const pop = spring({frame: frame - last.f, fps, config: {damping: 8, stiffness: 200}});
  const isTriple = frame >= 150;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 150,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: visible,
      }}
    >
      <div style={{display: "flex", justifyContent: "center", gap: 30}}>
        {[1, 2, 3].map((i) => {
          const active = i <= last.n;
          const scale = i === last.n ? 0.7 + pop * 0.3 : 1;
          return (
            <div
              key={i}
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: active ? "#ffd84d" : "rgba(255,255,255,0.18)",
                border: "4px solid rgba(255,255,255,0.6)",
                transform: `scale(${scale})`,
                opacity: !isTriple && i === 3 ? 0.25 : 1,
              }}
            />
          );
        })}
      </div>
      <div style={{fontSize: 46, fontWeight: 800, color: "white", marginTop: 28}}>
        {isTriple ? "TRIPLE CLICK = PARAGRAF" : "DOUBLE CLICK = KATA"}
      </div>
    </div>
  );
};

// ---------- Window Word palsu ----------
const WordWindow: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - 5, fps, config: {damping: 15}});
  const outro = interpolate(frame, [240, 270], [1, 0.94], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 600,
        width: 960,
        transform: `translateY(${(1 - enter) * 900}px) scale(${outro})`,
        transformOrigin: "center top",
        borderRadius: 24,
        boxShadow: "0 40px 90px rgba(0,0,0,0.45)",
        background: "#e9e9e9",
      }}
    >
      {/* title bar */}
      <div
        style={{
          background: BLUE,
          color: "white",
          height: 78,
          borderRadius: "24px 24px 0 0",
          display: "flex",
          alignItems: "center",
          padding: "0 30px",
          fontSize: 30,
          fontWeight: 600,
          gap: 18,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            background: "white",
            color: BLUE,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
          }}
        >
          W
        </div>
        Dokumen1 - Word
      </div>
      {/* tabs */}
      <div
        style={{
          background: "#f7f7f7",
          display: "flex",
          gap: 34,
          padding: "16px 30px",
          fontSize: 27,
          color: "#444",
          fontWeight: 600,
        }}
      >
        {["File", "Beranda", "Sisipkan", "Desain", "Tata Letak"].map((t, i) => (
          <span key={t} style={{color: i === 1 ? BLUE : "#444"}}>
            {t}
          </span>
        ))}
      </div>
      {/* toolbar */}
      <div
        style={{
          background: "#fbfbfb",
          borderBottom: "2px solid #ddd",
          display: "flex",
          gap: 16,
          padding: "16px 30px",
        }}
      >
        {[120, 70, 50, 50, 50, 90, 60, 60].map((w, i) => (
          <div key={i} style={{width: w, height: 34, borderRadius: 8, background: "#e2e2e2"}} />
        ))}
      </div>
      {/* page */}
      <div style={{padding: "36px 40px 60px"}}>
        <div
          style={{
            background: "white",
            padding: "60px 54px",
            minHeight: 640,
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            fontSize: 42,
            lineHeight: 1.55,
            color: "#222",
          }}
        >
          {WORDS.map((w, i) => {
            const sweepStart = 176 + i * 0.6;
            const sweep = interpolate(frame, [sweepStart, sweepStart + 8], [0, 1], clamp);
            const wordStart = frame >= 168 ? 168 : 108;
            const wordP =
              i === TARGET ? interpolate(frame, [wordStart, wordStart + 5], [0, 1], clamp) : 0;
            const p = Math.max(sweep, wordP);
            const isTarget = i === TARGET;

            return (
              <span
                key={i}
                style={{
                  display: isTarget ? "inline-block" : "inline",
                  position: isTarget ? "relative" : "static",
                  whiteSpace: "pre-wrap",
                  backgroundImage: `linear-gradient(${SELECT}, ${SELECT})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: `${p * 100}% 100%`,
                }}
              >
                {w}
                {isTarget ? <Cursor frame={frame} /> : null}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------- Komposisi utama ----------
export const WordTips: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const bgShift = interpolate(frame, [0, 300], [0, 40]);
  const ctaPop = spring({frame: frame - 245, fps, config: {damping: 10}});

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        background: `linear-gradient(${160 + bgShift / 4}deg, #0a1730 0%, #123c85 60%, ${BLUE} 100%)`,
      }}
    >
      {/* dekorasi */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          top: -200,
          right: -250,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(255,216,77,0.07)",
          bottom: -150,
          left: -180,
        }}
      />

      {frame < 60 && (
        <Header start={0} small="PENGGUNA WORD, WAJIB TAU!" big="Masih block teks pakai drag mouse? 🖱️" />
      )}
      {frame >= 60 && frame < 150 && (
        <Header start={60} small="CARA CEPAT BLOCK TEKS" big="Klik 2x" sub="= block 1 KATA" />
      )}
      {frame >= 150 && frame < 240 && (
        <Header start={150} small="NAH, YANG INI LEBIH GILA" big="Klik 3x" sub="= block 1 PARAGRAF" />
      )}
      {frame >= 240 && (
        <Header start={240} small="HEMAT WAKTU BANGET" big="Baru tau? 🤯" sub="Tag temen kamu!" />
      )}

      <WordWindow frame={frame} />
      <ClickBadge frame={frame} />

      {/* CTA akhir */}
      {frame >= 245 && (
        <div
          style={{
            position: "absolute",
            bottom: 150,
            left: 0,
            right: 0,
            textAlign: "center",
            transform: `scale(${ctaPop})`,
          }}
        >
          <span
            style={{
              background: "#ffd84d",
              color: "#0a1730",
              fontSize: 52,
              fontWeight: 800,
              padding: "26px 56px",
              borderRadius: 999,
            }}
          >
            Share ke yang masih drag-drag 🔁
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
