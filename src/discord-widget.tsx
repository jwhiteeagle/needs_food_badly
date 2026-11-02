import serverIcon from "./assets/discord-server.webp" with { type: "file" };

// Local invite card keeps the header compact without Discord embeds or live data
const inviteUrl = "https://discord.gg/XhHsw7SYcv";
// Server 1566922561021939763; icon copied from Discord's media proxy for local serving
// https://media.discordapp.net/icons/1566922561021939763/3dd41ef4907039db55178b46e9f3999e.png?size=128

const styles = `
  .discord-widget {
    display: grid;
    justify-items: center;
    width: 100%;
    margin: 0;
  }
  .discord-widget__invite {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: clamp(0.5rem, 2vw, 1rem);
    width: min(100%, 34rem);
    padding: 0.45rem clamp(0.6rem, 2vw, 1rem);
    border: 1px solid rgb(130 140 255 / 0.45);
    border-radius: 0.6rem;
    background: linear-gradient(110deg, #24283e, #1c1f2b 70%);
    color: var(--foreground);
    text-align: left;
    text-decoration: none;
    box-shadow: inset 3px 0 #5865f2, 0 3px 0 #0b0d0e;
  }
  .discord-widget__invite:hover {
    border-color: #a6aeff;
    background: linear-gradient(110deg, #2c3250, #222638 70%);
  }
  .discord-widget__icon {
    width: clamp(2.5rem, 8vw, 3.5rem);
    height: auto;
    image-rendering: pixelated;
  }
  .discord-widget__copy {
    display: grid;
    min-width: 0;
    gap: 0.1rem;
    line-height: 1.2;
  }
  .discord-widget__label {
    color: #b7beff;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .discord-widget__name {
    font-size: clamp(0.95rem, 2.5vw, 1.15rem);
    font-weight: 700;
  }
  .discord-widget__detail {
    color: var(--muted);
    font-size: 0.8rem;
  }
  .discord-widget__join {
    border-radius: 0.35rem;
    padding: 0.5rem 0.85rem;
    background: #5865f2;
    color: white;
    font-size: 0.9rem;
    font-weight: 700;
    white-space: nowrap;
  }
  .discord-widget__invite:hover .discord-widget__join {
    background: #4752c4;
  }
`;

export function DiscordWidget() {
  return (
    <div className="discord-widget">
      <style>{styles}</style>
      <a
        className="discord-widget__invite"
        href={inviteUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join Needs Food Badly on Discord (opens in a new tab)"
      >
        <img
          className="discord-widget__icon"
          src={serverIcon}
          alt=""
          width="128"
          height="128"
        />
        <span className="discord-widget__copy">
          <span className="discord-widget__label">Discord</span>
          <span className="discord-widget__name">Needs Food Badly</span>
          <span className="discord-widget__detail">WoW Forever · Horde</span>
        </span>
        <span className="discord-widget__join">Join</span>
      </a>
    </div>
  );
}
