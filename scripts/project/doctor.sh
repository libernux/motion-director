#!/usr/bin/env bash
# Check the prerequisites of the motion-director workflow and print one ok/missing/warn line per item, with
# the fix. Run it from a project folder to also check the project's ffmpeg and its HyperFrames pin.
# Exits 1 when a hard requirement is missing (bun, the HyperFrames skills, a working ffmpeg in a project).
# usage: bash <skill>/scripts/project/doctor.sh
set -euo pipefail
export LC_ALL=C
FAIL=0
ok() { echo "ok       $*"; }
miss() { echo "missing  $1"; echo "         fix: $2"; FAIL=1; }
warn() { echo "warn     $1"; echo "         fix: $2"; }

PROJECT=0
if [ -f .hf-version ] || { [ -f package.json ] && grep -q hyperframes package.json; }; then PROJECT=1; fi

# bun
if command -v bun >/dev/null 2>&1; then
  ok "bun $(bun --version)"
else
  miss "bun" "install it from https://bun.sh (the skill's scripts never use npm or npx)"
fi

# ffmpeg: the first candidate that actually runs wins
FF=""
BROKEN=""
for c in ${FFMPEG:+"$FFMPEG"} "$PWD/.bin/ffmpeg" "$PWD/node_modules/ffmpeg-static/ffmpeg" ffmpeg; do
  if "$c" -version >/dev/null 2>&1; then FF="$c"; break; fi
  if [ -e "$c" ] || command -v "$c" >/dev/null 2>&1; then BROKEN="$BROKEN $c"; fi
done
[ -z "$BROKEN" ] || echo "note     present but does not run:$BROKEN"
if [ -n "$FF" ]; then
  ok "ffmpeg $("$FF" -version | head -1 | cut -d' ' -f3) ($FF)"
elif [ "$PROJECT" = 1 ]; then
  miss "a working ffmpeg" "bun install, then bash scripts/hf.sh --version (links .bin/ffmpeg from ffmpeg-static)"
else
  warn "no working ffmpeg outside a project" "fine: setup.sh gives each project its own ffmpeg; run doctor there"
fi

# HyperFrames skills (skills CLI or Claude Code plugin)
HF="$({ find ./.claude/skills ~/.claude/skills ~/.agents/skills -maxdepth 1 -name 'hyperframes*' 2>/dev/null
  find ~/.claude/plugins/cache -maxdepth 5 -type d -path '*/skills/hyperframes*' 2>/dev/null; } | head -1 || true)"
if [ -n "$HF" ]; then
  ok "HyperFrames skills ($HF)"
else
  miss "the HyperFrames skills (/hyperframes and its domain skills)" \
    "bun x skills add heygen-com/hyperframes   (or: claude plugin install hyperframes@hyperframes), then start a new session"
fi

# project pin
if [ "$PROJECT" = 1 ]; then
  if [ -f .hf-version ]; then
    ok "HyperFrames CLI pinned to $(cat .hf-version) (.hf-version)"
  else
    warn "no .hf-version: scripts/hf.sh falls back to its default pin" "bash <skill>/scripts/project/setup.sh . <pin>"
  fi
fi

exit "$FAIL"
