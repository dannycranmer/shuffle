#!/usr/bin/env bash
set -euo pipefail

# Post top stories to social media after generation.
# Currently supports: Bluesky
#
# Required env vars:
#   BLUESKY_HANDLE   - e.g. shuffle-news.bsky.social
#   BLUESKY_PASSWORD  - app password (not your main password)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TODAY=${SHUFFLE_DATE:-$(date -u +%Y-%m-%d)}
STORIES_FILE="$REPO_DIR/public/content/stories/$TODAY.json"
SITE_URL="https://shuffle-daily-news.netlify.app"
NUM_POSTS=3

log() {
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S')] [social] $*"
}

if [ ! -f "$STORIES_FILE" ]; then
  log "No stories file for $TODAY, skipping social posts"
  exit 0
fi

# Check Bluesky credentials
if [ -z "${BLUESKY_HANDLE:-}" ] || [ -z "${BLUESKY_PASSWORD:-}" ]; then
  log "Bluesky credentials not set, skipping"
  exit 0
fi

# Authenticate with Bluesky
log "Authenticating with Bluesky..."
AUTH_RESPONSE=$(curl -s -X POST "https://bsky.social/xrpc/com.atproto.server.createSession" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\": \"$BLUESKY_HANDLE\", \"password\": \"$BLUESKY_PASSWORD\"}")

ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessJwt'])" 2>/dev/null)
DID=$(echo "$AUTH_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['did'])" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ] || [ -z "$DID" ]; then
  log "ERROR: Failed to authenticate with Bluesky"
  exit 1
fi

log "Authenticated as $BLUESKY_HANDLE"

# Extract top N stories and post them
python3 << PYEOF
import json, subprocess, sys
from datetime import datetime, timezone

with open("$STORIES_FILE") as f:
    data = json.load(f)

stories = data["stories"][:$NUM_POSTS]
site_url = "$SITE_URL"
today = "$TODAY"
access_token = "$ACCESS_TOKEN"
did = "$DID"

for story in stories:
    short_id = story["id"].replace(f"{today}-", "")
    url = f"{site_url}/date/{today}#{short_id}"

    # Build post text: hook + url (max 300 chars for Bluesky)
    text = f"{story['hook']}\n\n{url}"
    if len(text) > 300:
        max_hook = 300 - len(url) - 5  # 5 for \n\n and ...
        text = f"{story['hook'][:max_hook]}...\n\n{url}"

    # Find URL position for facet (makes it a clickable link)
    url_start = text.index(url)
    url_end = url_start + len(url)
    # Convert to byte positions
    url_byte_start = len(text[:url_start].encode('utf-8'))
    url_byte_end = url_byte_start + len(url.encode('utf-8'))

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    post = {
        "repo": did,
        "collection": "app.bsky.feed.post",
        "record": {
            "\$type": "app.bsky.feed.post",
            "text": text,
            "createdAt": now,
            "facets": [
                {
                    "index": {
                        "byteStart": url_byte_start,
                        "byteEnd": url_byte_end
                    },
                    "features": [
                        {
                            "\$type": "app.bsky.richtext.facet#link",
                            "uri": url
                        }
                    ]
                }
            ]
        }
    }

    result = subprocess.run(
        ["curl", "-s", "-X", "POST",
         "https://bsky.social/xrpc/com.atproto.repo.createRecord",
         "-H", f"Authorization: Bearer {access_token}",
         "-H", "Content-Type: application/json",
         "-d", json.dumps(post)],
        capture_output=True, text=True
    )

    if '"uri"' in result.stdout:
        print(f"Posted: {story['headline'][:60]}...")
    else:
        print(f"FAILED: {story['headline'][:60]}... - {result.stdout[:100]}", file=sys.stderr)
PYEOF

log "Social posting complete"
