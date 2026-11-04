import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { VoicePlayback } from "./voice-playback";
import { HordeSprites } from "./horde-sprites";
import { PricingData } from "./market-ui/price-watch";
import rogueIcon from "./assets/wow/rogue.jpg" with { type: "file" };
import warriorIcon from "./assets/wow/warrior.jpg" with { type: "file" };
import mageIcon from "./assets/wow/mage.jpg" with { type: "file" };
import paladinIcon from "./assets/wow/paladin.jpg" with { type: "file" };
import shamanIcon from "./assets/wow/shaman.jpg" with { type: "file" };
import warlockIcon from "./assets/wow/warlock.jpg" with { type: "file" };
import priestIcon from "./assets/wow/priest.jpg" with { type: "file" };
import druidIcon from "./assets/wow/druid.jpg" with { type: "file" };
import hunterIcon from "./assets/wow/hunter.jpg" with { type: "file" };

// Classic class colors; game icons sourced from wow.zamimg.com and bundled locally.
const wowClasses = {
  rogue: { label: "Rogue", color: "#FFF569", icon: rogueIcon },
  warrior: { label: "Warrior", color: "#C79C6E", icon: warriorIcon },
  mage: { label: "Mage", color: "#69CCF0", icon: mageIcon },
  paladin: { label: "Paladin", color: "#F58CBA", icon: paladinIcon },
  shaman: { label: "Shaman", color: "#0070DE", icon: shamanIcon },
  warlock: { label: "Warlock", color: "#9482C9", icon: warlockIcon },
  priest: { label: "Priest", color: "#FFFFFF", icon: priestIcon },
  druid: { label: "Druid", color: "#FF7D0A", icon: druidIcon },
  hunter: { label: "Hunter", color: "#ABD473", icon: hunterIcon },
};

// Add one object per person; pair each plain-text name with a reusable class entry.
const reservations: {
  name: string;
  limitedPlaytime?: boolean;
  characters: {
    name?: string;
    wowClass: (typeof wowClasses)[keyof typeof wowClasses];
    featured?: boolean;
  }[];
}[] = [
  {
    name: "Gunnar",
    characters: [
      { name: "Green Archer", wowClass: wowClasses.hunter, featured: true },
      { name: "Green Wizard", wowClass: wowClasses.warlock },
    ],
  },
  {
    name: "Jake",
    characters: [
      { name: "Green Rogue", wowClass: wowClasses.rogue, featured: true },
      { name: "Green Warrior", wowClass: wowClasses.warrior },
      { name: "Green Scout", wowClass: wowClasses.hunter },
    ],
  },
  {
    name: "Josh",
    characters: [
      { name: "Pink Cavalier", wowClass: wowClasses.paladin, featured: true },
      { name: "Blue Defender", wowClass: wowClasses.shaman },
      { name: "Red Mongrel", wowClass: wowClasses.druid },
    ],
  },
  {
    name: "Paul",
    characters: [
      { name: "Apox Apox", wowClass: wowClasses.hunter, featured: true },
      { name: "Apocks Apawks", wowClass: wowClasses.rogue },
      { name: "Aphax Apaewux", wowClass: wowClasses.druid },
    ],
  },
  {
    name: "Dave",
    characters: [
      {
        name: "Trolger Allaboutcrit",
        wowClass: wowClasses.hunter,
        featured: true,
      },
      {
        name: "Excedrine Allaboutcrit",
        wowClass: wowClasses.priest,
        featured: true,
      },
    ],
  },
  {
    name: "Dirk",
    limitedPlaytime: true,
    characters: [{ wowClass: wowClasses.druid, featured: true }],
  },
  {
    name: "Mike",
    limitedPlaytime: true,
    characters: [{ wowClass: wowClasses.mage, featured: true }],
  },
  {
    name: "Chris",
    limitedPlaytime: true,
    characters: [{ wowClass: wowClasses.druid, featured: true }],
  },
  {
    name: "Drew",
    limitedPlaytime: true,
    characters: [{ wowClass: wowClasses.rogue, featured: true }],
  },
  {
    name: "Ben",
    limitedPlaytime: true,
    characters: [{ wowClass: wowClasses.shaman, featured: true }],
  },
  {
    name: "Chris",
    limitedPlaytime: true,
    characters: [{ wowClass: wowClasses.warlock, featured: true }],
  },
  {
    name: "Evan",
    limitedPlaytime: true,
    characters: [{ wowClass: wowClasses.mage, featured: true }],
  },
  {
    name: "Scott",
    limitedPlaytime: true,
    characters: [{ wowClass: wowClasses.mage, featured: true }],
  },
  {
    name: "Az",
    limitedPlaytime: true,
    characters: [{ wowClass: wowClasses.warlock, featured: true }],
  },
];

function ReservationGrid({
  players,
  heading: Heading = "h3",
}: {
  players: typeof reservations;
  heading?: "h3" | "h4";
}) {
  return (
    <div className="reservation-grid">
      {players.map(({ name, characters }) => (
        <article key={name}>
          <Heading>{name}</Heading>
          <ul>
            {characters.map(({ name, wowClass, featured }) => (
              <li
                key={name ?? wowClass.label}
                className={featured ? "reservation-featured" : undefined}
              >
                {name}{" "}
                <span className="wow-class" style={{ color: wowClass.color }}>
                  <img src={wowClass.icon} alt="" width="16" height="16" />
                  {wowClass.label}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

// GitHub mark (Octicons mark-github, 16px grid)
const githubMark =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";

function App() {
  return (
    <main className="soundboard">
      <a
        className="github-link"
        href="https://github.com/jwhiteeagle/needs_food_badly"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View this project on GitHub (opens in a new tab)"
        title="View on GitHub"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d={githubMark} fill="currentColor" />
        </svg>
      </a>
      <VoicePlayback>
        <HordeSprites />
      </VoicePlayback>
      <section className="reservations" aria-labelledby="reservations-heading">
        <header className="section-header reservations-header">
          <h2 id="reservations-heading">Confirmed Character Reservations</h2>
          <p className="section-subheading">
            <strong>Planned Mains in Bold</strong>
          </p>
        </header>
        <div className="reservation-groups">
          <section
            className="reservation-group"
            aria-labelledby="confirmed-characters-heading"
          >
            <h3
              id="confirmed-characters-heading"
              className="section-subheading reservation-subtitle"
            >
              Confirmed characters
            </h3>
            <ReservationGrid
              players={reservations.filter((player) => !player.limitedPlaytime)}
              heading="h4"
            />
          </section>
          <section
            className="reservation-group"
            aria-labelledby="limited-playtime-heading"
          >
            <h3
              id="limited-playtime-heading"
              className="section-subheading reservation-subtitle"
            >
              tirekickers / limited playtime
            </h3>
            <ReservationGrid
              players={reservations.filter((player) => player.limitedPlaytime)}
              heading="h4"
            />
          </section>
        </div>
      </section>
      <PricingData />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
