import { useEffect, useRef, useState } from "react";

export const AHLEDGER_KEY_STORAGE = "needs-food-badly:ahledger-key:v1";
const apiOrigin = "https://api.ahledger.com";

function readKey() {
  try {
    return { key: localStorage.getItem(AHLEDGER_KEY_STORAGE) ?? "", error: "" };
  } catch {
    return {
      key: "",
      error: "Browser storage is unavailable. Public access still works.",
    };
  }
}

// Only AH Ledger receives the saved key; redirects cannot forward it elsewhere
export function ahLedgerFetch(url: string, options: RequestInit = {}) {
  if (new URL(url).origin !== apiOrigin) {
    throw new Error("AH Ledger requests must use the API origin");
  }
  const headers = new Headers(options.headers);
  const { key } = readKey();
  if (key) headers.set("Authorization", `Bearer ${key}`);
  return fetch(url, { ...options, headers, redirect: "error" });
}

const styles = `
.ahl-key { text-align: center; margin-top: .35rem; }
.ahl-key__trigger { color: var(--muted); font-size: .8rem; text-decoration: underline; text-underline-offset: .2em; }
.ahl-key__trigger:hover { color: var(--foreground); }
.ahl-key__dialog { margin: auto; width: min(34rem, calc(100% - 2rem)); max-height: calc(100dvh - 2rem); overflow-y: auto; padding: 1.25rem; border: 1px solid var(--border); background: var(--card); color: var(--foreground); text-align: center; }
.ahl-key__dialog::backdrop { background: rgb(0 0 0 / .75); }
.ahl-key__dialog h2 { margin: 0 0 .65rem; font-size: 1.25rem; font-weight: 650; }
.ahl-key__dialog h3 { margin: .85rem 0 .3rem; font-size: 1rem; font-weight: 650; }
.ahl-key__dialog p, .ahl-key__dialog ul { font-size: .875rem; color: var(--muted); line-height: 1.4; }
.ahl-key__dialog ul { list-style-position: inside; padding: 0; margin: .4rem 0; }
.ahl-key__dialog li { margin: .2rem 0; }
.ahl-key__dialog a { text-decoration: underline; }
.ahl-key__get-key { width: min(100%, 22rem); margin: .85rem auto; padding-block: .7rem; border-block: 1px solid var(--border); }
.ahl-key__dialog form { display: grid; gap: .65rem; margin-top: 1rem; }
.ahl-key__dialog input { width: 100%; min-width: 0; padding: .5rem; text-align: center; background: var(--background); border: 1px solid var(--border); color: var(--foreground); }
.ahl-key__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; }
.ahl-key__actions button { padding: .35rem .75rem; border: 1px solid var(--border); background: var(--background); }
.ahl-key__actions button:hover { border-color: var(--selected); }
.ahl-key__actions button:disabled { opacity: .5; }
.ahl-key__dialog .ahl-key__status { min-height: 1.3em; margin: 0; }
`;

// Browser-only opt-in storage; the local .env file is never read by this component
export function AhLedgerSettings() {
  const [saved, setSaved] = useState(readKey);
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  // Native dialog handles focus containment, Escape and return focus
  useEffect(() => {
    if (!open) return;
    const modal = dialog.current!;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.showModal();
    return () => {
      modal.close();
      document.body.style.overflow = overflow;
    };
  }, [open]);

  function showSettings() {
    const current = readKey();
    setSaved(current);
    setDraft(current.key);
    setRevealed(false);
    setMessage(current.error);
    setOpen(true);
  }

  function closeSettings() {
    setOpen(false);
    setRevealed(false);
    setDraft("");
  }

  function saveKey() {
    const key = draft.trim();
    if (!key || /\s/.test(key)) {
      setMessage("Paste one API key without spaces.");
      return;
    }
    try {
      localStorage.setItem(AHLEDGER_KEY_STORAGE, key);
      setSaved({ key, error: "" });
      setDraft(key);
      setRevealed(false);
      setMessage("Saved in this browser. Future requests will use this key.");
    } catch {
      setMessage("Couldn't save the key. Check your browser storage settings.");
    }
  }

  function removeKey() {
    try {
      localStorage.removeItem(AHLEDGER_KEY_STORAGE);
      setSaved({ key: "", error: "" });
      setDraft("");
      setRevealed(false);
      setMessage("Key removed. Future requests will use public access.");
    } catch {
      setMessage(
        "Couldn't remove the key. Check your browser storage settings.",
      );
    }
  }

  return (
    <div className="ahl-key">
      <style>{styles}</style>
      <button type="button" className="ahl-key__trigger" onClick={showSettings}>
        Use an AHledger API key if you hit fetch limits
      </button>
      {open && (
        <dialog
          ref={dialog}
          className="ahl-key__dialog"
          aria-labelledby="ahl-key-heading"
          onCancel={closeSettings}
        >
          <h2 id="ahl-key-heading">Optional AHledger key</h2>
          <ul>
            <li>300 requests/min allowed by AHLedger</li>
            <li>Down to 30/min on Dec 10th, 2026</li>
            <li>If you aren't hitting limits, you don't need to get a key.</li>
          </ul>
          <p className="ahl-key__get-key">
            <a
              href="https://ahledger.com/account"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get a free AHledger API key
            </a>
          </p>
          <p>
            Your key is saved in this browser's local storage and sent only to
            AHledger. It stays until removed or browser data is cleared; scripts
            on this site can access it.
          </p>
          <h3>Current Requests</h3>
          <p>
            Auto-refreshes every 10 minutes.
            <br />
            {/* Seven profession feeds, up to seven icon lookups, one gathering batch */}
            Up to 15 fetches per refresh, before favorites.
          </p>
          <p>Navigating or refreshing may trigger additional requests.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveKey();
            }}
          >
            <label htmlFor="ahl-api-key">
              {saved.key ? "Saved API key" : "API key"}
            </label>
            <input
              id="ahl-api-key"
              type={revealed ? "text" : "password"}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
            <div className="ahl-key__actions">
              <button
                type="button"
                aria-controls="ahl-api-key"
                aria-pressed={revealed}
                onClick={() => setRevealed((value) => !value)}
              >
                {revealed ? "Hide key" : "Reveal key"}
              </button>
              <button type="submit" disabled={!draft.trim()}>
                Save key
              </button>
              {saved.key && (
                <button type="button" onClick={removeKey}>
                  Remove key
                </button>
              )}
            </div>
            <p className="ahl-key__status" role="status">
              {message}
            </p>
          </form>
          <div className="ahl-key__actions">
            <button type="button" onClick={closeSettings}>
              Close
            </button>
          </div>
          <p>
            <a
              href="https://ahledger.com/developers#access-and-licences"
              target="_blank"
              rel="noopener noreferrer"
            >
              AHledger limits and access
            </a>
          </p>
        </dialog>
      )}
    </div>
  );
}
