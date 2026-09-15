#!/usr/bin/env python3
"""Local preview that resolves URLs the way GitHub Pages does: /contact serves contact.html,
/notes/ serves notes/index.html. Links on the site have no .html.

    python3 _tools/serve.py            # http://127.0.0.1:8765
"""
import os, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)
    def translate_path(self, path):
        full = super().translate_path(path)
        bare = full.split('?', 1)[0].rstrip('/')
        if not os.path.exists(full) and os.path.isfile(bare + '.html'):
            return bare + '.html'
        return full
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, fmt, *args):
        sys.stderr.write('%s %s\n' % (self.log_date_time_string(), fmt % args))

if __name__ == '__main__':
    with ThreadingHTTPServer(('127.0.0.1', PORT), Handler) as httpd:
        print(f'serving {ROOT} at http://127.0.0.1:{PORT} (extensionless URLs resolve like GitHub Pages)', flush=True)
        httpd.serve_forever()
