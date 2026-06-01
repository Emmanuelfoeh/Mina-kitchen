# Remediation: `dev.db` committed to git history

## Status

- ✅ **Forward fix done** — `dev.db` is no longer tracked (`git rm --cached`) and
  `*.db` / `*.db-journal` are git-ignored, so it can't be re-committed.
- ⚠️ **History still contains it** — `dev.db` was first added in an early
  ancestor commit (`ad0de5e "Task: 2. Database Schema and Data Models"`) and
  persists in the history of `main` (and every branch descended from it). The
  forward fix does NOT remove it from past commits.

## Why this wasn't auto-scrubbed

Rewriting it out requires rewriting the history of `main` — which is published
on `origin` (`github.com:Emmanuelfoeh/Mina-kitchen`) — and a coordinated
force-push. That is destructive to shared history and to any collaborator
clones, so it must be done deliberately, not as part of a routine change.

## Risk

The SQLite file is a dev database. If it ever contained real bcrypt password
hashes or customer PII, those remain retrievable from history by anyone with
repo read access. Assess what was in it; if anything sensitive, **rotate those
credentials** regardless of the history rewrite.

## Procedure (when ready, coordinate with all collaborators first)

1. Ensure everyone has pushed and is prepared to re-clone after the rewrite.
2. Install the tool:
   ```bash
   brew install git-filter-repo   # or: pipx install git-filter-repo
   ```
3. From a fresh clone of the repo:
   ```bash
   git filter-repo --invert-paths --path dev.db
   ```
   (BFG alternative: `bfg --delete-files dev.db`)
4. Re-add the remote (filter-repo drops it) and force-push all refs:
   ```bash
   git remote add origin git@github.com:Emmanuelfoeh/Mina-kitchen.git
   git push --force --all
   git push --force --tags
   ```
5. Every collaborator re-clones (or hard-resets) — old clones still contain the
   file and must be discarded.
6. Rotate any credentials that were present in the file.

Until step 3+ is run, treat anything that was in `dev.db` as exposed.
