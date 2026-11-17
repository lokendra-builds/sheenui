#!/usr/bin/env bash
# Installs the secret-scanning pre-commit hook into this clone's .git/hooks.
#
#   bash scripts/install-git-hooks.sh
#
# .git/hooks is local to each clone and never pushed, so run this once after `git init` or
# `git clone`. The hook needs python3 (any 3.8+). It blocks commits that contain .env files,
# keys, databases or key-like values (see scripts/pre-commit-secret-scan).
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not a git repository yet. Run 'git init' in $root first, then run this script again." >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required by the secret-scan hook. Install it, then run this script again." >&2
  exit 1
fi

src="scripts/pre-commit-secret-scan"
hooks_dir="$(git rev-parse --git-path hooks)"
dest="$hooks_dir/pre-commit"

chmod +x "$src"
python3 "$src" --self-test

mkdir -p "$hooks_dir"
if [ -e "$dest" ] && ! cmp -s "$src" "$dest"; then
  backup="$dest.bak.$(date +%Y%m%d%H%M%S)"
  mv "$dest" "$backup"
  echo "Existing pre-commit hook kept as $backup"
fi

cp "$src" "$dest"
chmod +x "$dest"
echo "Installed secret-scan hook: $dest"
echo "Check the whole working tree any time with: python3 $src --all"
