#!/usr/bin/env python3
"""Tech Orbit sanity checks — run before every deploy (also used by CI)."""
import sys, json, os
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errs = []

def need(path):
    if not os.path.exists(os.path.join(ROOT, path)):
        errs.append(f"missing file: {path}")

# 1. required files
for f in ["index.html", "404.html", "sw.js", "manifest.webmanifest", "og.png", "icon-192.png", "icon-512.png"]:
    need(f)

# 2. manifest validity
try:
    m = json.load(open(os.path.join(ROOT, "manifest.webmanifest")))
    for k in ["name", "short_name", "start_url", "display", "icons"]:
        if k not in m: errs.append(f"manifest missing key: {k}")
except Exception as e:
    errs.append(f"manifest.webmanifest invalid JSON: {e}")

# 3. index.html required markers
idx = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
for marker in ['og:image', 'manifest.webmanifest', 'serviceWorker', 'id="events"',
               'rel="icon"', 'id="sdlg"', 'id="pwl"', 'id="spotbox"', 'id="lpg"']:
    if marker not in idx:
        errs.append(f"index.html missing marker: {marker}")

# 4. tag balance
class P(HTMLParser):
    VOID = {"area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"}
    def __init__(self):
        super().__init__(convert_charrefs=True); self.stack = []
    def handle_starttag(self, tag, attrs):
        if tag not in self.VOID: self.stack.append(tag)
    def handle_endtag(self, tag):
        if tag in self.VOID: return
        if self.stack and self.stack[-1] == tag: self.stack.pop()
        elif tag in self.stack:
            while self.stack and self.stack[-1] != tag:
                errs.append(f"unclosed tag: <{self.stack.pop()}>")
            if self.stack: self.stack.pop()
        else:
            errs.append(f"stray closing tag: </{tag}>")
p = P()
p.feed(idx)
for t in p.stack:
    if t not in ("html", "body"): errs.append(f"unclosed tag at EOF: <{t}>")

# 5. size sanity (single-file app should be substantial but < 5 MB)
kb = len(idx.encode()) // 1024
if kb < 500 or kb > 5120: errs.append(f"index.html size suspicious: {kb} KB")

if errs:
    print("SITE CHECKS FAILED:")
    [print("  ✗", e) for e in errs]
    sys.exit(1)
print(f"✓ all site checks passed ({kb} KB index)")
