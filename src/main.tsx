import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { classes, colors, endings } from "./sounds";

// Extra silence between clips, in milliseconds. Tune here without changing assets.
const CLIP_GAP_MS = 0;

const ICONS: Record<string, string> = {
  sword:
    "M11 1h4v4h-2v2h-2v2H9v2H7v2H5v2H1v-4h2V9h2V7h2V5h2V3h2z M1 5h2v2h2v2h2v2h2v2H7v-2H5V9H3V7H1z",
  shield: "M2 1h12v9h-2v2h-2v2H6v-2H4v-2H2z M7 3v8h2V3z",
  magic: "M7 1h2v2h2v4h2v4h2v3H1v-3h2V7h2V3h2z M5 9v2h6V9z M8 4v2h2V4z",
  bow: "M3 1h4v2h2v2h2v6H9v2H7v2H3v-2h4v-2h2V5H7V3H3z M3 3h2v10H3z M7 7h6V5h2v6h-2V9H7z",
  jester:
    "M1 2h4v2h2V1h2v3h2V2h4v5h-2V5h-2v4h2v4h-2v2H5v-2H3V9h2V5H3v2H1z M5 9v2h2V9z M9 9v2h2V9z",
  beast:
    "M1 1h3v4h8V1h3v8h-2v4h-2v2H5v-2H3V9H1z M4 7v2h2V7z M10 7v2h2V7z M6 11v2h4v-2z",
  food: "M8 1h4v2H9v2h4v2h2v6h-2v2H3v-2H1V7h2V5h4V3h1z M4 7v2h2V7z",
  feast: "M8 1h5v2h2v5h-2v2H8V8H6V6h2z M5 7h2v2l-3 3v2H1v-3h2z",
  skull:
    "M4 1h8v2h2v8h-2v4H4v-4H2V3h2z M4 5v4h3V5z M9 5v4h3V5z M7 10v2h2v-2z M5 13v2h2v-2z M9 13v2h2v-2z",
  play: "M4 1h2v2h2v2h2v2h2v2h-2v2H8v2H6v2H4z",
  stop: "M3 3h10v10H3z",
};

function PixelIcon({ name }: { name: string }) {
  return (
    <svg
      className="pixel-icon"
      viewBox="0 0 16 16"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path d={ICONS[name]} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

type Player = {
  context: AudioContext;
  buffers: Map<string, Promise<AudioBuffer>>;
  sources: AudioBufferSourceNode[];
};

function App() {
  const [colorIndex, setColorIndex] = useState(0);
  const [classIndex, setClassIndex] = useState(0);
  const [endingIndex, setEndingIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState("");
  const audio = useRef<Player | null>(null);
  const color = colors[colorIndex]!;
  const character = classes[classIndex]!;
  const ending = endings[endingIndex]!;
  const phrase = `${color.label} ${character.label} ${ending.label}`;

  useEffect(
    () => () => {
      const player = audio.current;
      audio.current = null;
      if (player) void player.context.close();
    },
    [],
  );

  async function play() {
    if (status === "loading") return;
    if (status === "playing") {
      for (const source of audio.current!.sources) {
        source.stop();
        source.disconnect();
      }
      audio.current!.sources = [];
      setStatus("idle");
      return;
    }

    setError("");
    setStatus("loading");
    try {
      // Create/resume inside the click gesture for mobile autoplay policies.
      const player = (audio.current ??= {
        context: new AudioContext(),
        buffers: new Map(),
        sources: [],
      });
      await player.context.resume();
      const buffers = await Promise.all(
        [color, character, ending].map(({ url }) => {
          let pending = player.buffers.get(url);
          if (!pending) {
            // Cache decoded audio for this page session; failed loads remain retryable.
            pending = fetch(url, { signal: AbortSignal.timeout(15000) })
              .then((response) => {
                if (!response.ok) throw new Error("Sound could not be loaded");
                return response.arrayBuffer();
              })
              .then((bytes) => player.context.decodeAudioData(bytes))
              .catch((error) => {
                player.buffers.delete(url);
                throw error;
              });
            player.buffers.set(url, pending);
          }
          return pending;
        }),
      );
      if (audio.current !== player) return;

      // One audio clock avoids the drift of timers or chaining HTML audio events.
      let when = player.context.currentTime + 0.03;
      player.sources = buffers.map((buffer) => {
        const source = player.context.createBufferSource();
        source.buffer = buffer;
        source.connect(player.context.destination);
        source.addEventListener(
          "ended",
          () => {
            source.disconnect();
            if (player.sources.at(-1) === source && audio.current === player) {
              player.sources = [];
              setStatus("idle");
            }
          },
          { once: true },
        );
        source.start(when);
        when += buffer.duration + CLIP_GAP_MS / 1000;
        return source;
      });
      setStatus("playing");
    } catch {
      setError("Couldn't play that line. Tap play to try again.");
      setStatus("idle");
    }
  }

  return (
    <main className="soundboard">
      <header className="phrase-header">
        <h1 aria-live="polite" aria-atomic="true">
          <span data-color={color.swatch}>{color.label}</span> {character.label}
          <span className="phrase-ending">{"<Needs Food Badly>"}</span>
        </h1>
      </header>

      <fieldset disabled={status !== "idle"}>
        <legend>Color</legend>
        <div className="color-grid">
          {colors.map((choice, index) => (
            <button
              key={choice.label}
              type="button"
              className="choice color-choice"
              data-color={choice.swatch}
              aria-pressed={index === colorIndex}
              onClick={() => setColorIndex(index)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={status !== "idle"}>
        <legend>Class</legend>
        <div className="class-grid">
          {classes.map((choice, index) => (
            <button
              key={choice.label}
              type="button"
              className="choice class-choice"
              aria-pressed={index === classIndex}
              onClick={() => setClassIndex(index)}
            >
              <PixelIcon name={choice.icon} />
              <span>{choice.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={status !== "idle"}>
        <legend>Voice line</legend>
        <div className="ending-grid">
          {endings.map((choice, index) => (
            <button
              key={choice.label}
              type="button"
              className="choice ending-choice"
              aria-pressed={index === endingIndex}
              onClick={() => setEndingIndex(index)}
            >
              <PixelIcon name={choice.icon} />
              <span>{choice.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <footer className="playback">
        {error && (
          <p className="playback-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="play-button"
          type="button"
          disabled={status === "loading"}
          aria-label={status === "playing" ? "Stop playback" : `Play ${phrase}`}
          onClick={() => void play()}
        >
          <PixelIcon name={status === "playing" ? "stop" : "play"} />
          {status === "loading"
            ? "Loading..."
            : status === "playing"
              ? "Stop playback"
              : "Play voice line"}
        </button>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
