#!/usr/bin/env python3
"""Stamp the stylesheet link on every page with a hash of its content, so a changed stylesheet is a
new URL and no browser can pair a new page with an old cached site.css (GitHub Pages caches assets
for ten minutes). Run before committing a stylesheet change:

    python3 _tools/stamp.py
"""
import hashlib, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PAGES = ['index.html', 'contact.html', 'projects.html', 'notes/index.html', 'notes/what-is-a-qubit.html']
css = open(os.path.join(ROOT, 'css', 'site.css'), 'rb').read()
v = hashlib.sha1(css).hexdigest()[:8]
changed = 0
for page in PAGES:
    path = os.path.join(ROOT, page)
    if not os.path.exists(path): continue
    s = open(path, encoding='utf-8').read()
    t = re.sub(r'href="/css/site\.css(?:\?v=[0-9a-f]+)?"', f'href="/css/site.css?v={v}"', s)
    if t != s:
        open(path, 'w', encoding='utf-8').write(t); changed += 1
print(f'site.css v={v}; {changed} page(s) updated')
