#!/usr/bin/env python3
"""Lift the drawn panels off notebook photos and re-ink them in the site's burgundy.

For each panel: find the hand-drawn frame near the guessed corners, rectify the quad
to a rectangle (homography), flatten the paper lighting by dividing by a wide blur,
turn "darker than the local paper" into alpha, and colour every pixel with the ink.
Output: transparent PNGs in assets/notes/. The photos themselves stay out of the repo.

    python3 _tools/ink-notebook.py ~/Desktop/notebook
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

INK = (122, 30, 44)
SRC = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else '~/Desktop/notebook')
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'notes')
os.makedirs(OUT, exist_ok=True)

# name, photo, rough corners TL TR BR BL (photo px), output width, options
PANELS = [
    ('s2-generator',    'p1.jpg', [(67,101),(552,98),(549,864),(66,860)],     900, {}),
    ('s2-state-space',  'p1.jpg', [(626,126),(1050,175),(1058,848),(640,856)], 900, {}),
    ('p1-generators',   'p3.jpg', [(60,94),(550,90),(550,855),(51,857)],      900, {'floor': 0.12}),
    ('p1-state-space',  'p3.jpg', [(630,136),(1076,180),(1078,857),(628,855)], 900, {}),
    ('c1-generators',   'p4.jpg', [(46,90),(304,82),(300,487),(39,490)],      900, {}),
    ('c1-state-space',  'p4.jpg', [(345,70),(620,68),(614,493),(342,485)],    900, {}),
    ('su2-generators',  'p4.jpg', [(750,74),(1026,71),(1014,487),(748,485)],  900, {}),
    ('su2-state-space', 'p4.jpg', [(1062,84),(1298,96),(1310,496),(1060,487)], 900, {}),
    ('three-spheres',   'p4.jpg', [(705,774),(1340,774),(1340,1066),(705,1066)], 1400, {'frame': False}),
]

def gray(img):
    return np.asarray(img.convert('L'), dtype=np.float32) / 255.0

def refine_edge(g, p, q, along, search=10, samples=11):
    """Fit a straight line to the darkest pixels near the guessed edge p->q."""
    pts = []
    for s in np.linspace(0.12, 0.88, samples):
        x = p[0] + (q[0] - p[0]) * s; y = p[1] + (q[1] - p[1]) * s
        if along == 'h':   # horizontal edge: search rows
            ys = np.arange(int(y) - search, int(y) + search + 1)
            xs = np.arange(int(x) - 6, int(x) + 7)
            col = g[np.clip(ys, 0, g.shape[0]-1)][:, np.clip(xs, 0, g.shape[1]-1)].mean(axis=1)
            pts.append((x, ys[int(np.argmin(col))]))
        else:
            xs = np.arange(int(x) - search, int(x) + search + 1)
            ys = np.arange(int(y) - 6, int(y) + 7)
            row = g[np.clip(ys, 0, g.shape[0]-1)][:, np.clip(xs, 0, g.shape[1]-1)].mean(axis=0)
            pts.append((xs[int(np.argmin(row))], y))
    pts = np.array(pts)
    # robust line fit: drop the two worst residuals
    def fit(P):
        if along == 'h':
            a, b = np.polyfit(P[:,0], P[:,1], 1); return ('h', a, b)   # y = a x + b
        a, b = np.polyfit(P[:,1], P[:,0], 1); return ('v', a, b)       # x = a y + b
    L = fit(pts)
    res = np.abs(pts[:,1] - (L[1]*pts[:,0] + L[2])) if along == 'h' else np.abs(pts[:,0] - (L[1]*pts[:,1] + L[2]))
    keep = np.argsort(res)[:-2]
    return fit(pts[keep])

def intersect(h, v):
    _, a, b = h; _, c, d = v       # y = a x + b ; x = c y + d
    y = (a * d + b) / (1 - a * c); x = c * y + d
    return (x, y)

def homography(src, dst):
    A = []
    for (x, y), (u, v) in zip(src, dst):
        A.append([x, y, 1, 0, 0, 0, -u*x, -u*y, -u])
        A.append([0, 0, 0, x, y, 1, -v*x, -v*y, -v])
    _, _, V = np.linalg.svd(np.array(A, dtype=np.float64))
    H = V[-1].reshape(3, 3); return H / H[2, 2]

def warp(img, quad, W, H):
    """Map the output rectangle onto the photo quad and sample bilinearly."""
    Hm = homography([(0,0),(W,0),(W,H),(0,H)], quad)
    xs, ys = np.meshgrid(np.arange(W) + 0.5, np.arange(H) + 0.5)
    d = Hm[2,0]*xs + Hm[2,1]*ys + Hm[2,2]
    sx = (Hm[0,0]*xs + Hm[0,1]*ys + Hm[0,2]) / d
    sy = (Hm[1,0]*xs + Hm[1,1]*ys + Hm[1,2]) / d
    a = np.asarray(img.convert('L'), dtype=np.float32) / 255.0
    x0 = np.clip(np.floor(sx).astype(int), 0, a.shape[1]-2); y0 = np.clip(np.floor(sy).astype(int), 0, a.shape[0]-2)
    fx = np.clip(sx - x0, 0, 1); fy = np.clip(sy - y0, 0, 1)
    return (a[y0, x0]*(1-fx)*(1-fy) + a[y0, x0+1]*fx*(1-fy) + a[y0+1, x0]*(1-fx)*fy + a[y0+1, x0+1]*fx*fy)

def ink(L, floor=0.10, soft=0.30, blur=45):
    """Alpha from how much darker each pixel is than the paper around it."""
    im = Image.fromarray((L * 255).astype(np.uint8))
    pad = blur * 2
    big = Image.new('L', (im.width + 2*pad, im.height + 2*pad))
    # mirror-pad so the blur has paper to average at the edges
    arr = np.pad(np.asarray(im), pad, mode='reflect')
    big = Image.fromarray(arr).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(blur))
    B = np.asarray(big, dtype=np.float32)[pad:-pad, pad:-pad] / 255.0
    dark = 1 - np.minimum(1, L / np.maximum(B, 0.05))
    alpha = np.clip((dark - floor) / soft, 0, 1)
    alpha = alpha ** 0.9
    return alpha

for name, photo, guess, W, opt in PANELS:
    img = Image.open(os.path.join(SRC, photo))
    g = gray(img)
    q = [tuple(map(float, c)) for c in guess]
    if opt.get('frame', True):
        top = refine_edge(g, q[0], q[1], 'h'); bot = refine_edge(g, q[3], q[2], 'h')
        left = refine_edge(g, q[0], q[3], 'v'); right = refine_edge(g, q[1], q[2], 'v')
        q = [intersect(top, left), intersect(top, right), intersect(bot, right), intersect(bot, left)]
    # a margin of paper around the frame so the stroke is never cut
    m = opt.get('margin', 14)
    cx = sum(p[0] for p in q) / 4; cy = sum(p[1] for p in q) / 4
    qm = []
    for (x, y) in q:
        dx, dy = x - cx, y - cy; n = (dx*dx + dy*dy) ** 0.5
        qm.append((x + dx / n * m * 1.4, y + dy / n * m * 1.4))
    w_src = ((qm[1][0]-qm[0][0]) + (qm[2][0]-qm[3][0])) / 2
    h_src = ((qm[3][1]-qm[0][1]) + (qm[2][1]-qm[1][1])) / 2
    H = int(round(W * h_src / w_src))
    L = warp(img, qm, W, H)
    scale = W / w_src
    alpha = ink(L, blur=int(45 * scale) if scale < 1 else 45, **{k: v for k, v in opt.items() if k in ('floor', 'soft')})
    if opt.get('frame', True):
        # keep only the inside of her frame plus a sliver of paper, so neighbouring writing never leaks in
        Hinv = np.linalg.inv(homography([(0,0),(W,0),(W,H),(0,H)], qm))
        poly = []
        for (x, y) in q:
            v = Hinv @ np.array([x, y, 1.0]); poly.append((v[0] / v[2], v[1] / v[2]))
        pcx = sum(p[0] for p in poly) / 4; pcy = sum(p[1] for p in poly) / 4
        grow = 3 * scale
        poly = [(x + np.sign(x - pcx) * grow, y + np.sign(y - pcy) * grow) for x, y in poly]
        mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).polygon(poly, fill=255)
        alpha = alpha * (np.asarray(mask, dtype=np.float32) / 255.0)
    idx = (alpha * 255).round().astype(np.uint8)
    out = Image.fromarray(idx, 'P')
    out.putpalette(bytes(INK) * 256)
    out.save(os.path.join(OUT, name + '.png'), optimize=True, transparency=bytes(range(256)))
    print(f"{name:16s} {W}x{H}  scale {scale:.2f}  quad {[(int(x), int(y)) for x, y in q]}")
