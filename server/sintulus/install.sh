#!/usr/bin/env bash
# Replaces the Sintulus 6 page (/<locale>/sintulus) on the SideForge server with the launch
# layout from this repo: film hero (deep water), table of contents, article with section nav,
# specs, capabilities, roadmap, FAQ, read next. Nav and footer stay the site's own (PublicShell).
#
#   bash install.sh            install (backup → write → build → restart; rolls back if the build fails)
#   bash install.sh --check    only show what would change, touch nothing
#   bash install.sh --rollback [backup-dir]   restore the state before the last install
#
# Env: SF_ROOT=/path/to/next-app   (default: auto-detect, e.g. /home/joel/webserver-sideforge)
#      GITHUB_TOKEN=...            (only needed while the repo is private)
set -euo pipefail

# Pinned to a commit so a cached branch URL can never serve an older file.
RAW="${SF_RAW:-https://raw.githubusercontent.com/sideforge/Sideforge-landing-page-versionen/91a0e297cdfecb2b67eb1718939a01b0172432bd/server/sintulus}"
# Git blob ids (sha1 of "blob <size>\0<content>") of the files at that commit.
SHA_MP4=f1598cceb5254f60008d1a52be67acf6775ee435
SHA_JPG=a4d198f614411d063f69a8b48016db9077f3a732
SHA_TPL=faace7d02c4910cc18af403afca141c77eec9b94
MARK='Vorschau · Modell'   # a string only the shared Venura/Sintulus page component contains

say()  { printf '\033[1m» %s\033[0m\n' "$*"; }
ok()   { printf '\033[32m✓ %s\033[0m\n' "$*"; }
warn() { printf '\033[33m! %s\033[0m\n' "$*"; }
die()  { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }
as_root() { if [ "$(id -u)" = 0 ]; then "$@"; else sudo "$@"; fi; }

MODE=install
case "${1:-}" in
  --check) MODE=check ;;
  --rollback) MODE=rollback ;;
  "" ) ;;
  *) die "Unbekannte Option: $1" ;;
esac
command -v node >/dev/null || die "node fehlt"
command -v curl >/dev/null || die "curl fehlt"

# ---------- find the Next.js app ----------
# source files only: skip dependencies, builds and build backups (.next, .next.prev-*, …)
grep_src() { grep -rls --exclude-dir=node_modules --exclude-dir='.next*' --exclude-dir=.git --exclude-dir=.turbo \
  --exclude-dir=.cache --exclude-dir=out --exclude-dir=dist --exclude-dir='*.sintulus-backup-*' \
  --include='*.tsx' --include='*.jsx' --include='*.ts' "$@"; }
is_app() { [ -f "$1/package.json" ] && grep -q '"next"' "$1/package.json" && [ -n "$(grep_src -F "$MARK" "$1" 2>/dev/null | head -1)" ]; }
ROOT=""
for d in "${SF_ROOT:-}" "$PWD" /home/joel/webserver-sideforge /home/*/webserver-sideforge* /home/*/* /var/www/* /srv/* /opt/*; do
  [ -n "$d" ] && [ -d "$d" ] || continue
  case "$d" in *.sintulus-backup-*) continue ;; esac
  if is_app "$d"; then ROOT="$(cd "$d" && pwd)"; break; fi
done
[ -n "$ROOT" ] || die "Next.js-App mit der Sintulus-Seite nicht gefunden. Starte mit SF_ROOT=/pfad/zur/app bash install.sh"
OWNER="$(stat -c %U "$ROOT")"; GROUP="$(stat -c %G "$ROOT")"
run_as() { if [ "$(id -un)" = "$1" ]; then bash -lc "$2"; elif [ "$(id -u)" = 0 ]; then runuser -u "$1" -- bash -lc "$2"; else sudo -u "$1" -H bash -lc "$2"; fi; }
as_owner() { run_as "$OWNER" "$1"; }
own() { [ "$(id -u)" = 0 ] && chown "$OWNER:$GROUP" "$@" || true; }
ok "App: $ROOT (Besitzer $OWNER)"

restart_app() {
  local unit
  unit="$(grep -ls "WorkingDirectory=$ROOT/\?\s*$" /etc/systemd/system/*.service /lib/systemd/system/*.service 2>/dev/null | head -1 || true)"
  if [ -n "$unit" ]; then
    unit="$(basename "$unit")"; say "Starte $unit neu"; as_root systemctl restart "$unit"; return
  fi
  if command -v pm2 >/dev/null; then
    local names
    for who in "$OWNER" root; do
      names="$(run_as "$who" 'pm2 jlist' 2>/dev/null \
        | ROOT="$ROOT" node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const a=JSON.parse(s.slice(s.indexOf("[")));console.log(a.filter(p=>(p.pm2_env.pm_cwd||"").replace(/\/$/,"")===process.env.ROOT).map(p=>p.name).join(" "))}catch{}})' || true)"
      if [ -n "$names" ]; then
        for n in $names; do say "pm2 restart $n ($who)"; run_as "$who" "pm2 restart '$n'" >/dev/null; done
        return
      fi
    done
  fi
  warn "Keinen systemd-Dienst / pm2-Prozess für $ROOT gefunden — bitte den Next-Server selbst neu starten."
}

build_app() { say "npm run build (Log: $1)"; as_owner "cd '$ROOT' && npm run build" >"$1" 2>&1; }

# ---------- rollback ----------
if [ "$MODE" = rollback ]; then
  BK="${2:-$(ls -d "$ROOT".sintulus-backup-* 2>/dev/null | sort | tail -1)}"
  [ -n "$BK" ] && [ -f "$BK/manifest" ] || die "Kein Backup gefunden"
  say "Stelle $BK wieder her"
  while IFS=$'\t' read -r kind rel; do
    if [ "$kind" = new ]; then rm -f "$ROOT/$rel"; else cp -a "$BK/files/$rel" "$ROOT/$rel"; fi
  done < "$BK/manifest"
  build_app "$BK/rollback-build.log" || { tail -30 "$BK/rollback-build.log"; die "Build nach Rollback fehlgeschlagen"; }
  own -R "$ROOT/.next"; restart_app; ok "Rollback fertig"; exit 0
fi

# ---------- locate the files ----------
mapfile -t FS < <(grep_src -F "$MARK" "$ROOT")
[ "${#FS[@]}" = 1 ] || die "Erwartet genau eine Modell-Seiten-Komponente mit „$MARK“, gefunden: ${#FS[@]} ${FS[*]:-}"
F="${FS[0]}"
OUT="$(dirname "$F")/SintulusLaunch.tsx"
mapfile -t PS < <(grep_src -E "model=\{?\s*[\"']sintulus[\"']" "$ROOT" | grep -E '/page\.(t|j)sx?$' || true)
if [ "${#PS[@]}" = 0 ]; then mapfile -t PS < <(grep_src -F "<SintulusLaunch" "$ROOT" | grep -E '/page\.(t|j)sx?$' || true); fi
[ "${#PS[@]}" = 1 ] || die "Erwartet genau eine Sintulus-Route (page.tsx mit model=\"sintulus\"), gefunden: ${#PS[@]} ${PS[*]:-}"
P="${PS[0]}"
ok "Komponente: ${F#$ROOT/}"
ok "Route:      ${P#$ROOT/}"

# ---------- download ----------
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
fetch() {
  local auth=(); [ -n "${GITHUB_TOKEN:-}" ] && auth=(-H "Authorization: token $GITHUB_TOKEN")
  curl -fsSL "${auth[@]}" "$RAW/$1" -o "$TMP/$1" || die "Download $RAW/$1 fehlgeschlagen (Repo privat? → kurz öffentlich machen oder GITHUB_TOKEN=… setzen)"
  [ "$(blob_id "$TMP/$1")" = "$2" ] || die "Prüfsumme von $1 stimmt nicht"
}
blob_id() { { printf 'blob %s\0' "$(stat -c %s "$1")"; cat "$1"; } | sha1sum | cut -d' ' -f1; }
say "Lade Dateien"
fetch SintulusLaunch.tsx.tpl "$SHA_TPL"; fetch sintulus-sea.mp4 "$SHA_MP4"; fetch sintulus-sea.jpg "$SHA_JPG"
ok "Dateien geladen und geprüft"

# ---------- generate component + patch route (in TMP first) ----------
cp "$P" "$TMP/page.new"
F="$F" P="$P" OUT="$OUT" TPL="$TMP/SintulusLaunch.tsx.tpl" PNEW="$TMP/page.new" CNEW="$TMP/component.new" node <<'NODE'
const fs = require("fs"), path = require("path");
const { F, P, OUT, TPL, PNEW, CNEW } = process.env;
const fail = (m) => { console.error("✗ " + m); process.exit(1); };
const src = fs.readFileSync(F, "utf8");
const imports = [...src.matchAll(/import\s+(?!type\s)([\s\S]*?)\s+from\s+["']([^"']+)["']/g)];
function importFor(name) {
  for (const [, clause, spec] of imports) {
    const named = clause.match(/\{([\s\S]*)\}/);
    if (named) for (const part of named[1].split(",")) {
      const [orig, alias] = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/);
      if ((alias || orig) === name) return `import { ${orig === name ? name : `${orig} as ${name}`} } from "${spec}";`;
    }
    if (clause.replace(/\{[\s\S]*\}/, "").replace(/,\s*$/, "").trim() === name) return `import ${name} from "${spec}";`;
  }
  fail(`Import von ${name} in ${F} nicht gefunden`);
}
const imp = ["PublicShell", "makeT", "localeHref"].map(importFor).join("\n");
fs.writeFileSync(CNEW, fs.readFileSync(TPL, "utf8").replace("/*__SF_IMPORTS__*/", imp));
console.log("  Imports:\n    " + imp.split("\n").join("\n    "));

let page = fs.readFileSync(P, "utf8");
if (page.includes("<SintulusLaunch")) { console.log("  Route nutzt SintulusLaunch schon — nur Komponente/Video werden aktualisiert"); process.exit(0); }
const re = /<([A-Z][\w.]*)(\s[^<>]*?\bmodel=(?:"sintulus"|'sintulus'|\{\s*["']sintulus["']\s*\})[^<>]*?)\/>/g;
const hits = page.match(re) || [];
if (hits.length !== 1) fail(`In ${P} ${hits.length} passende Elemente statt 1`);
page = page.replace(re, "<SintulusLaunch$2/>");
let rel = path.relative(path.dirname(P), OUT).replace(/\.tsx$/, "").split(path.sep).join("/");
if (!rel.startsWith(".")) rel = "./" + rel;
const importLine = `import SintulusLaunch from "${rel}";`;
const all = [...page.matchAll(/^import[\s\S]*?from\s+["'][^"']+["'];?[ \t]*$/gm)];
const at = all.length ? all[all.length - 1].index + all[all.length - 1][0].length : 0;
page = page.slice(0, at) + (at ? "\n" : "") + importLine + (at ? "" : "\n") + page.slice(at);
fs.writeFileSync(PNEW, page);
console.log("  Route: " + hits[0].replace(/\s+/g, " ") + "  →  <SintulusLaunch …/>");
NODE

say "Änderung an ${P#$ROOT/}:"
diff -u "$P" "$TMP/page.new" | sed 's/^/    /' || true
[ "$MODE" = check ] && { ok "Nur geprüft (--check) — nichts geändert"; exit 0; }

# ---------- backup ----------
BK="$ROOT.sintulus-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BK/files"; : > "$BK/manifest"
backup() { local rel="${1#$ROOT/}"
  if [ -e "$1" ]; then mkdir -p "$BK/files/$(dirname "$rel")"; cp -a "$1" "$BK/files/$rel"; printf 'file\t%s\n' "$rel" >> "$BK/manifest"
  else printf 'new\t%s\n' "$rel" >> "$BK/manifest"; fi; }
backup "$P"; backup "$OUT"; backup "$ROOT/public/media/sintulus-sea.mp4"; backup "$ROOT/public/media/sintulus-sea.jpg"
HAVE_NEXT=0
if [ -d "$ROOT/.next" ]; then
  need=$(du -sk "$ROOT/.next" | cut -f1); free=$(df -Pk "$(dirname "$ROOT")" | awk 'NR==2{print $4}')
  if [ "$free" -gt $((need + 200000)) ]; then cp -a "$ROOT/.next" "$BK/.next" && HAVE_NEXT=1
  else warn "Zu wenig Platz für eine Kopie von .next — bei einem Fehler wird der alte Stand neu gebaut"; fi
fi
ok "Backup: $BK"

restore_after_fail() {
  warn "Build fehlgeschlagen — stelle alten Stand wieder her"
  tail -40 "$BK/build.log" | sed 's/^/    /'
  while IFS=$'\t' read -r kind rel; do
    if [ "$kind" = new ]; then rm -f "$ROOT/$rel"; else cp -a "$BK/files/$rel" "$ROOT/$rel"; fi
  done < "$BK/manifest"
  if [ "$HAVE_NEXT" = 1 ]; then rm -rf "$ROOT/.next"; cp -a "$BK/.next" "$ROOT/.next"
  else build_app "$BK/rollback-build.log" || warn "Auch der alte Stand baut nicht — siehe $BK/rollback-build.log"; fi
  own -R "$ROOT/.next"; restart_app
  die "Nichts geändert (alter Stand läuft). Schick mir die Ausgabe oben."
}

# ---------- write ----------
mkdir -p "$ROOT/public/media"
cp "$TMP/component.new" "$OUT"
cat "$TMP/page.new" > "$P"
cp "$TMP/sintulus-sea.mp4" "$TMP/sintulus-sea.jpg" "$ROOT/public/media/"
own "$OUT" "$ROOT/public/media" "$ROOT/public/media/sintulus-sea.mp4" "$ROOT/public/media/sintulus-sea.jpg"
ok "Dateien geschrieben"

build_app "$BK/build.log" || restore_after_fail
own -R "$ROOT/.next"
ok "Build erfolgreich"
restart_app

# ---------- verify ----------
URL="${SF_URL:-https://sideforge.ch}"
for i in $(seq 1 20); do
  body="$(curl -fsSL "$URL/en/sintulus" 2>/dev/null || true)"
  if printf '%s' "$body" | grep -q 'sintulus-sea.mp4'; then
    code="$(curl -s -o /dev/null -w '%{http_code}' "$URL/media/sintulus-sea.mp4")"
    ok "Live: $URL/en/sintulus (Video: HTTP $code)"
    echo; echo "Rückgängig machen:  bash install.sh --rollback $BK"; exit 0
  fi
  sleep 3
done
warn "Neue Seite unter $URL/en/sintulus noch nicht sichtbar (Cache/CDN?). Bitte im Browser prüfen."
echo "Rückgängig machen:  bash install.sh --rollback $BK"
