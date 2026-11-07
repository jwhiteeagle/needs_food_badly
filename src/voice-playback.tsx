import { type ReactNode, useEffect, useRef, useState } from "react";
import { classes, colors, endings } from "./sounds";
import { DiscordWidget } from "./discord-widget";

// Extra silence between clips, in milliseconds. Tune without changing assets.
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
  gain: GainNode;
  buffers: Map<string, Promise<AudioBuffer>>;
  sources: AudioBufferSourceNode[];
};

function stopSources(player: Player) {
  // Clear first so ended events from stopped clips cannot finish a later playback.
  const sources = player.sources;
  player.sources = [];
  for (const source of sources) {
    source.stop();
    source.disconnect();
  }
}

function PlaybackButton({
  status,
  phrase,
  onPlay,
}: {
  status: "idle" | "loading" | "playing";
  phrase: string;
  onPlay: () => void;
}) {
  return (
    <button
      className="play-button"
      type="button"
      disabled={status === "loading"}
      aria-label={status === "playing" ? "Stop playback" : `Play ${phrase}`}
      onClick={onPlay}
    >
      <PixelIcon name={status === "playing" ? "stop" : "play"} />
      {status === "loading"
        ? "Loading..."
        : status === "playing"
          ? "Stop playback"
          : "Play voice line"}
    </button>
  );
}

const styles = `
.voice-lines {
  position: relative;
  min-height: 7rem;
  padding: 1rem 1.25rem 1.2rem;
  border: 1px solid rgb(198 216 146 / 0.35);
  background: rgb(236 236 229 / 0.025);
  display: grid;
  gap: 0.3rem;
  align-items: center;
  text-align: center;
  box-shadow:
    inset 0 0 0 4px var(--background),
    inset 0 0 0 5px rgb(198 216 146 / 0.12),
    0 4px 0 #0b0d0e;
}
.voice-lines .title-crest {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}
.voice-lines .title-crest::before,
.voice-lines .title-crest::after {
  content: "";
  width: clamp(2.5rem, 8vw, 6rem);
  border-top: 2px solid rgb(198 216 146 / 0.3);
}
.voice-lines .title-crest .pixel-icon {
  width: 1.8rem;
  height: 1.8rem;
  filter: drop-shadow(2px 2px 0 #0b0d0e);
}
.voice-lines::before,
.voice-lines::after {
  content: "";
  position: absolute;
  width: 0.85rem;
  height: 0.85rem;
  border-style: solid;
  border-color: var(--selected);
  pointer-events: none;
}
.voice-lines::before {
  top: 0.35rem;
  left: 0.35rem;
  border-width: 3px 0 0 3px;
}
.voice-lines::after {
  bottom: 0.35rem;
  right: 0.35rem;
  border-width: 0 3px 3px 0;
}
.voice-lines h1 {
  margin: 0;
  font-family: "VT323", ui-monospace, monospace;
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: 0.025em;
  text-shadow: 3px 3px 0 #0b0d0e;
  text-wrap: balance;
}
.voice-lines .phrase-ending {
  display: block;
  margin-top: 0.45rem;
  font-size: clamp(1.25rem, 3vw, 1.8rem);
  line-height: 1.1;
  letter-spacing: 0.06em;
  color: var(--muted);
}
.voice-lines .title-crest[data-color="red"],
.voice-lines h1 [data-color="red"] {
  color: #ff938d;
}
.voice-lines .title-crest[data-color="yellow"],
.voice-lines h1 [data-color="yellow"] {
  color: #ead078;
}
.voice-lines .title-crest[data-color="blue"],
.voice-lines h1 [data-color="blue"] {
  color: #8fbef3;
}
.voice-lines .title-crest[data-color="green"],
.voice-lines h1 [data-color="green"] {
  color: #91d8ac;
}

.voice-lines fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.voice-lines legend {
  padding: 0;
  margin-bottom: 0.35rem;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.voice-lines .color-grid,
.voice-lines .class-grid,
.voice-lines .ending-grid {
  display: grid;
  gap: 0.4rem;
}
.voice-lines .color-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.voice-lines .class-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (min-width: 48rem) {
  .voice-lines .class-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
.voice-lines .ending-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.voice-lines .choice {
  position: relative;
  min-width: 0;
  min-height: 2.75rem;
  border: 2px solid #3f4649;
  border-radius: 0;
  background: var(--card);
  color: var(--foreground);
  box-shadow: 0 3px 0 #0b0d0e;
  font-size: 0.95rem;
  font-weight: 650;
}
.voice-lines .choice[aria-pressed="true"] {
  border-color: var(--selected);
  box-shadow:
    inset 0 0 0 1px var(--background),
    0 3px 0 #0b0d0e;
}
.voice-lines .choice[aria-pressed="true"]::after {
  content: "";
  position: absolute;
  top: 4px;
  right: 4px;
  width: 5px;
  height: 5px;
  background: var(--selected);
  box-shadow: 0 0 0 1px var(--background);
}
.voice-lines .choice:active:not(:disabled),
.voice-lines .play-button:active {
  transform: translateY(2px);
}
@media (hover: hover) {
  .voice-lines .choice:hover:not(:disabled) {
    border-color: var(--muted);
  }
  .voice-lines .choice[aria-pressed="true"]:hover:not(:disabled) {
    border-color: var(--selected);
  }
}
.voice-lines .color-choice[data-color="red"] {
  background: var(--red);
}
.voice-lines .color-choice[data-color="yellow"] {
  background: var(--yellow);
  color: #201b09;
}
.voice-lines .color-choice[data-color="blue"] {
  background: var(--blue);
}
.voice-lines .color-choice[data-color="green"] {
  background: var(--green);
}
.voice-lines .class-choice,
.voice-lines .ending-choice {
  padding: 0.45rem 0.25rem;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 0.2rem;
  line-height: 1.1;
}
.voice-lines .class-choice .pixel-icon {
  color: #d8c99f;
}
.voice-lines .choice[aria-pressed="true"] .pixel-icon {
  color: var(--selected);
}
.voice-lines .pixel-icon {
  width: 1.65rem;
  height: 1.65rem;
  flex-shrink: 0;
}
.voice-lines .ending-choice {
  min-height: 4.5rem;
  font-size: 0.83rem;
}
.voice-lines .ending-choice .pixel-icon {
  color: #d8c99f;
}
.voice-lines .ending-choice span {
  max-width: 10ch;
}

.voice-lines .voice-controls-divider {
  width: 100%;
  margin: 0.9rem 0 0.2rem;
  border: 0;
  border-top: 1px solid rgb(198 216 146 / 0.25);
}
.voice-lines .voice-tagline-divider {
  width: min(85%, 30rem);
  margin: 0.15rem auto 0.45rem;
  border: 0;
  border-top: 1px solid rgb(198 216 146 / 0.25);
}
.voice-lines .voice-controls {
  display: grid;
  justify-items: center;
  gap: 0.2rem;
  margin: 0.2rem 0 0;
}
.voice-lines .voice-tagline {
  display: grid;
  gap: 0.15rem;
  padding-block: 0.3rem;
  margin-bottom: 0.35rem;
  color: var(--foreground);
  text-wrap: balance;
}
.voice-lines .voice-tagline h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 650;
  line-height: 1.25;
}
.voice-lines .voice-tagline p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.3;
}
/* Play stays in the middle track; links fill tracks either side, so uneven flank counts cannot shift it */
.voice-lines .voice-action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) minmax(0, 2.25fr) repeat(2, minmax(0, 1fr));
  align-items: center;
  justify-items: center;
  gap: clamp(0.35rem, 1.5vw, 0.75rem);
  width: min(100%, 52rem);
}
@media (max-width: 36rem) {
  .voice-lines .voice-action-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .voice-lines .voice-action-row .play-button {
    grid-column: 1 / -1;
    order: -1;
  }
}
.voice-lines .widget-jump {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  /* Two text lines (2 x 1.15em) plus padding and border, so one-line labels match wrapped ones */
  min-height: calc(2.3em + 0.6rem + 2px);
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--foreground);
  font-size: 0.85rem;
  font-weight: 650;
  line-height: 1.15;
  text-decoration: none;
}
.voice-lines .widget-jump:hover {
  border-color: var(--selected);
  color: var(--selected);
}
.voice-lines .play-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: min(100%, 16rem);
  min-height: 3rem;
  padding: 0.55rem 1.1rem;
  border: 2px solid var(--selected);
  background: var(--selected);
  color: #192013;
  box-shadow: 0 4px 0 #66764a;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.15;
}
.voice-lines .voice-action-row .play-button {
  width: 100%;
  padding-inline: 0.5rem;
}
.voice-lines .play-button:disabled,
.voice-lines fieldset:disabled {
  opacity: 0.65;
}
.voice-lines .customize-button,
.voice-lines .settings-done {
  min-height: 2.5rem;
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--foreground);
}
.voice-lines .customize-button {
  min-height: 1.6rem;
  padding-block: 0.1rem;
  border-color: transparent;
  background: transparent;
  color: var(--muted);
  font-size: 0.85rem;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
.voice-lines .customize-button:hover {
  color: var(--foreground);
}
.voice-lines .voice-volume {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 3.5ch;
  align-items: center;
  gap: 0.55rem;
  width: min(100%, 20rem);
  margin: 0.1rem 0;
  color: var(--muted);
  font-size: 0.85rem;
}
.voice-lines .voice-volume input {
  width: 100%;
  min-width: 0;
  height: 1.5rem;
  margin: 0;
  accent-color: var(--selected);
  cursor: pointer;
}
.voice-lines .voice-volume-value {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.voice-lines .playback-error {
  margin: 0;
  color: #ffaaa8;
  text-align: center;
}
.voice-settings {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100dvh;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: clamp(0.75rem, 3vw, 2rem);
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
  border: 0;
  background: var(--background);
  color: var(--foreground);
  overflow: hidden;
}
.voice-settings::backdrop {
  background: rgb(0 0 0 / 0.8);
}
.voice-lines .voice-settings__panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: min(100%, 60rem);
  height: 100%;
  margin-inline: auto;
}
.voice-lines .voice-settings__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.voice-lines .voice-settings__header h2 {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 700;
  text-align: left;
}
.voice-lines .voice-preview {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 650;
  text-wrap: balance;
}
.voice-lines .voice-options {
  flex: 1;
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 1.25rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.3rem 0.4rem 0.65rem;
}
.voice-lines .voice-settings__footer {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  padding-bottom: 0.35rem;
}
@media (max-width: 359px) {
  .voice-lines .ending-choice {
    font-size: 0.75rem;
  }
}
`;

// Children place the sprite widget beneath playback without coupling their state.
export function VoicePlayback({ children }: { children: ReactNode }) {
  const [colorIndex, setColorIndex] = useState(0);
  const [classIndex, setClassIndex] = useState(0);
  const [endingIndex, setEndingIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState("");
  const [customizing, setCustomizing] = useState(false);
  const [volume, setVolume] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const audio = useRef<Player | null>(null);
  const color = colors[colorIndex]!;
  const character = classes[classIndex]!;
  const ending = endings[endingIndex]!;
  const phrase = `${color.label} ${character.label} ${ending.label}`;

  useEffect(
    () => () => {
      const player = audio.current;
      audio.current = null;
      if (player) {
        stopSources(player);
        void player.context.close();
      }
    },
    [],
  );

  // Native modal behavior supplies focus containment, Escape and focus restoration.
  useEffect(() => {
    if (!customizing) return;
    const settings = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    settings.showModal();
    return () => {
      settings.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [customizing]);

  async function play() {
    if (status === "loading") return;
    if (status === "playing") {
      if (audio.current) stopSources(audio.current);
      setStatus("idle");
      return;
    }

    setError("");
    setStatus("loading");
    let attemptedPlayer: Player | null = null;
    try {
      // Create/resume inside the click gesture for mobile autoplay policies.
      if (!audio.current) {
        const context = new AudioContext();
        const gain = context.createGain();
        gain.gain.value = volume;
        gain.connect(context.destination);
        audio.current = { context, gain, buffers: new Map(), sources: [] };
      }
      const player = audio.current;
      attemptedPlayer = player;
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
        source.connect(player.gain);
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
      if (audio.current !== attemptedPlayer) return;
      if (attemptedPlayer) stopSources(attemptedPlayer);
      setError("Couldn't play that line. Tap play to try again.");
      setStatus("idle");
    }
  }

  return (
    <header className="voice-lines">
      <style>{styles}</style>
      <div className="title-crest" data-color={color.swatch} aria-hidden="true">
        <PixelIcon name={character.icon} />
      </div>
      <h1 aria-live="polite" aria-atomic="true">
        <span data-color={color.swatch}>{color.label}</span> {character.label}
        <span className="phrase-ending">{"<Needs Food Badly>"}</span>
      </h1>

      <hr className="voice-controls-divider" />
      <div
        className="voice-controls"
        role="group"
        aria-label="Page shortcuts and voice playback"
      >
        <div className="voice-tagline">
          <h2>Social WoW Forever Guild - PvP Horde</h2>
        </div>
        <hr className="voice-tagline-divider" />
        <div className="voice-action-row">
          <a
            className="widget-jump"
            href="#sprite-browser"
            aria-label="Jump to the sprite browser"
          >
            Sprite Browser
          </a>
          <a
            className="widget-jump"
            href="#main-characters-heading"
            aria-label="Jump to character reservations"
          >
            Roster
          </a>
          <PlaybackButton
            status={status}
            phrase={phrase}
            onPlay={() => void play()}
          />
          <a
            className="widget-jump"
            href="#gathering-heading"
            aria-label="Jump to auction house crafting data"
          >
            AH Crafting Data
          </a>
          <a
            className="widget-jump"
            href="#gathering-prices-heading"
            aria-label="Jump to the gathering watchlist"
          >
            Gathering Watchlist
          </a>
        </div>
        <button
          className="customize-button"
          type="button"
          aria-haspopup="dialog"
          aria-controls="voice-settings"
          onClick={() => setCustomizing(true)}
        >
          Guild name themed from the arcade standup announcer in Gauntlet
          telling you how much you suck.
          <br />
          Button above plays voice line, click here to customize
        </button>
        <label className="voice-volume">
          <span>Volume</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(volume * 100)}
            aria-label="Voice line volume"
            aria-valuetext={`${Math.round(volume * 100)} percent`}
            onChange={(event) => {
              const nextVolume = event.currentTarget.valueAsNumber / 100;
              setVolume(nextVolume);
              const player = audio.current;
              if (player) {
                // Short gain transitions avoid clicks while adjusting an active voice line
                player.gain.gain.setTargetAtTime(
                  nextVolume,
                  player.context.currentTime,
                  0.015,
                );
              }
            }}
          />
          <span className="voice-volume-value" aria-hidden="true">
            {Math.round(volume * 100)}%
          </span>
        </label>
        {!customizing && error && (
          <p className="playback-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <DiscordWidget />
      {children}
      <dialog
        ref={dialog}
        id="voice-settings"
        className="voice-settings"
        aria-labelledby="voice-settings-heading"
        onClose={() => setCustomizing(false)}
      >
        <div className="voice-settings__panel">
          <header className="voice-settings__header">
            <h2 id="voice-settings-heading">Customize playback</h2>
            <button
              className="settings-done"
              type="button"
              autoFocus
              onClick={() => setCustomizing(false)}
            >
              Done
            </button>
          </header>
          <p className="voice-preview" aria-live="polite" aria-atomic="true">
            &quot;{phrase}&quot;
          </p>
          <div className="voice-options">
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
          </div>
          <footer className="voice-settings__footer">
            {error && (
              <p className="playback-error" role="alert">
                {error}
              </p>
            )}
            <PlaybackButton
              status={status}
              phrase={phrase}
              onPlay={() => void play()}
            />
          </footer>
        </div>
      </dialog>
    </header>
  );
}
