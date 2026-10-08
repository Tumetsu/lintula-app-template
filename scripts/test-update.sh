#!/usr/bin/env bash
# Check that a project generated from the previous release updates cleanly to
# the current commit: `copier update` must apply without conflicts.
#
# Usage: scripts/test-update.sh <ui> [workdir]
#
# Skips when the template has no release tag yet.
set -euo pipefail

ui=${1:?usage: test-update.sh <mui|shadcn> [workdir]}
workdir=${2:-$(mktemp -d)}
template=$(cd "$(dirname "$0")/.." && pwd)

# The newest tag before HEAD: when HEAD is itself a release, that release is
# what is being tested, so updating to it from itself would prove nothing.
previous=$(git -C "$template" describe --tags --abbrev=0 HEAD^ 2>/dev/null || true)
if [[ -z "$previous" ]]; then
  echo "No release tag yet; nothing to update from."
  exit 0
fi

project="$workdir/update-$ui"
rm -rf "$project"

echo "Rendering $previous ..."
uvx copier copy --trust --defaults --vcs-ref "$previous" \
  --data project_name="Update Check" --data ui="$ui" "$template" "$project"
git -C "$project" add -A
git -C "$project" -c user.name=ci -c user.email=ci@example.com commit -qm "Generate from $previous"

echo "Updating to HEAD ..."
(cd "$project" && uvx copier update --trust --defaults --vcs-ref HEAD --conflict rej)

conflicts=$(cd "$project" && find . -name '*.rej' -not -path './node_modules/*')
if [[ -n "$conflicts" ]]; then
  echo "Update produced conflicts:" >&2
  echo "$conflicts" >&2
  exit 1
fi
echo "Updated $previous -> HEAD without conflicts."
