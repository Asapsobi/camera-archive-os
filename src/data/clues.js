// Central registry of ARG / mystery-layer content. Keeping it in one file
// means the hidden layer can be extended without touching UI components.

export const clues = {
  "restored-0017": {
    title: "RECOVERED FRAGMENT — CAM-0017",
    body: `File recovery partially successful. 41% of sectors unreadable.

...the previous owner logged every photo by hand, in a notebook, next to
the camera. dates, locations, who was in frame. we found the notebook.
we did not find why she stopped on page 114...

...the last entry just says "it's not the camera. it never was."

...serial JP04-771A-0017 does not match any unit Sony shipped through
retail channels in that batch. we are still trying to find out where it
actually came from.`,
    unlockHint: "A deleted file rarely stays gone. Someone chose not to finish the job.",
  },
  "classified-ls633": {
    title: "SEALED RECORD — ADMIN NOTE",
    body: `This record was sealed by a previous archive administrator, not by us.

Everything past the serial number has been redacted. We left the
redaction in place. Some doors in this archive are shut for a reason
we've decided not to argue with.

If you find a way to open it anyway, that's on you.`,
    unlockHint: "Some doors were never meant to open from this side.",
  },
  "restored-4900": {
    title: "RECOVERED FRAGMENT — CAM-0000",
    body: `Earliest surviving entry in the whole database. Zero megapixel-era
bridge camera, serial ending in -0001.

Every other camera in this archive has a purchase record. This one
doesn't. It was already here when the current archivist inherited the
machine.

Nobody remembers plugging it in. It just appeared in the index one day.`,
    unlockHint: "First isn't always oldest. Sometimes it's just first to be noticed.",
  },
  "recycle-bin-note": {
    title: "RECYCLE_BIN\\readme_before_you_empty_this.txt",
    body: `Whoever is reading this: do not empty the recycle bin.

I know it looks like junk. Three broken cameras and a corrupted thumbnail
cache. But every camera in here was pulled from the storefront for a
reason, and every reason is written down somewhere in this archive if
you look closely enough.

Restoring a file doesn't put it back on sale. It just lets you read it.

— the last archivist`,
  },
  "terminal-secret": {
    title: "root access — session log",
    body: `You found the hidden command. Most people don't bother typing into a
DOS prompt on a shopping website.

There's nothing dangerous back here. Just a leftover diagnostic tool and
a folder called OLD_INDEX that predates the current catalog by about
three years. Type "dir old_index" if you want to keep going.`,
  },
  "error-404": {
    title: "404 — SECTOR NOT FOUND",
    body: `The page you're looking for was either moved, deleted, or was never
indexed by this machine in the first place.

If you got here by clicking something you weren't supposed to click —
good. That's the point.`,
  },
};

export function getClue(id) {
  return clues[id] ?? null;
}
