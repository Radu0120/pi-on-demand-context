# On-Demand Context Extension

Loads `CLAUDE.md` and `AGENTS.md` context files when the model navigates directories using bash `cd`.

## How it works

- pi auto-loads context files for the launch dir + parents at startup (unchanged)
- Model runs `cd some/dir && pwd` to go deeper — no special tool needed
- Extension detects the directory change and injects context from the new dir
- Files pi already loaded (or a shared parent already injected) are **not** re-sent
- Multiple directories can be visited — context accumulates across the session

## Setup

Just register the extension in `~/.pi/agent/settings.json`:

```json
{
  "extensions": ["~/.pi/agent/extensions/on-demand-context"]
}
```

No `--no-context-files` / `noContextFiles` needed — the extension complements
pi's default loader instead of replacing it, deduping against what pi already
injected via `systemPromptOptions.contextFiles`.

After modifying `index.ts`, run `/reload`.

## Usage

### For the model

```bash
cd some/dir          # plain cd works — new dir is resolved from the path
cd some/dir && pwd   # recommended — pwd gives the exact dir, no guessing
```

A plain `cd <path>` is enough for ordinary relative/absolute paths; the new
directory is resolved against the last known one. Append `&& pwd` when the path
can't be computed from the string alone — `cd -`, `cd ~user`, `cd $VAR`, or
`cd $(...)` — so `pwd` reports the real directory. Either way context files are
injected before the next turn; no special tool needed.

### For the user

- `/list-context` — show all loaded context files
- Context resets on `/new`, `/resume`, `/fork`

## Notes

- Context files are loaded from the target directory **and all parent directories**
- Files are not re-loaded if you `cd` back to a visited directory
- Uses `&& pwd` (or `; pwd`) to reliably detect the actual new working directory
- Works on Windows (WSL/bash) and Unix systems
