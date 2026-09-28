"""
Optional: AI-upscale the phone (portrait) crop with Real-ESRGAN.

A tall phone shows ~20% of the 2.35:1 frame — about 300 source pixels
across — so plain resampling can only get so sharp. Real-ESRGAN recovers
edge detail (tower, windows, cloud edges) that Lanczos cannot.

    python3 -m venv .venv && .venv/bin/pip install torch numpy pillow
    curl -LO https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth
    .venv/bin/python scripts/ai-upscale.py realesr-general-x4v3.pth
    npm run media        # picks up media-src/shanghai-portrait-ai.mp4

Runs on CPU (~5 s per frame on 4 cores, ~20 min for the 10 s clip).
Frames are cached, so an interrupted run resumes where it stopped.
"""
import glob
import os
import subprocess
import sys
import tempfile
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FFMPEG = os.path.join(ROOT, 'node_modules', 'ffmpeg-static', 'ffmpeg')
SOURCE = os.path.join(ROOT, 'media-src', 'shanghai-source.mp4')
OUTPUT = os.path.join(ROOT, 'media-src', 'shanghai-portrait-ai.mp4')
# Must match PORTRAIT's crop in prepare-media.mjs: 3:4, centred 62% across.
CROP = 'fps=24,crop=ih*3/4:ih:iw*0.62-ih*3/8:0'


class SRVGGNetCompact(nn.Module):
    """realesr-general-x4v3: 32 conv + PReLU blocks, pixel-shuffle x4, nearest-neighbour residual."""

    def __init__(self, feat=64, convs=32, scale=4):
        super().__init__()
        self.scale = scale
        body = [nn.Conv2d(3, feat, 3, 1, 1), nn.PReLU(feat)]
        for _ in range(convs):
            body += [nn.Conv2d(feat, feat, 3, 1, 1), nn.PReLU(feat)]
        body += [nn.Conv2d(feat, 3 * scale * scale, 3, 1, 1)]
        self.body = nn.Sequential(*body)
        self.shuffle = nn.PixelShuffle(scale)

    def forward(self, x):
        return self.shuffle(self.body(x)) + F.interpolate(x, scale_factor=self.scale, mode='nearest')


def main(weights):
    work = os.path.join(tempfile.gettempdir(), 'shanghai-ai-upscale')
    frames, upscaled = os.path.join(work, 'in'), os.path.join(work, 'out')
    os.makedirs(frames, exist_ok=True)
    os.makedirs(upscaled, exist_ok=True)

    if not glob.glob(f'{frames}/*.png'):
        subprocess.run([FFMPEG, '-loglevel', 'error', '-i', SOURCE, '-vf', CROP, f'{frames}/%04d.png'], check=True)

    torch.set_num_threads(os.cpu_count())
    net = SRVGGNetCompact()
    state = torch.load(weights, map_location='cpu', weights_only=True)
    net.load_state_dict(state.get('params', state))
    net.eval()

    files = sorted(glob.glob(f'{frames}/*.png'))
    start = time.time()
    with torch.inference_mode():
        for i, path in enumerate(files):
            target = os.path.join(upscaled, os.path.basename(path))
            if os.path.exists(target):
                continue
            x = torch.from_numpy(np.array(Image.open(path).convert('RGB'))).permute(2, 0, 1)[None].float() / 255
            y = net(x).clamp(0, 1)[0].permute(1, 2, 0).mul(255).round().byte().numpy()
            Image.fromarray(y).save(target, compress_level=1)
            print(f'{i + 1}/{len(files)}  {(time.time() - start) / (i + 1):.1f}s/frame', flush=True)

    # Near-lossless intermediate at 1080 × 1440; prepare-media does the web encode.
    subprocess.run([
        FFMPEG, '-loglevel', 'error', '-y', '-framerate', '24', '-i', f'{upscaled}/%04d.png',
        '-vf', 'scale=1080:1440:flags=lanczos', '-c:v', 'libx264', '-crf', '12', '-preset', 'slow',
        '-pix_fmt', 'yuv420p', OUTPUT,
    ], check=True)
    print(f'wrote {OUTPUT}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
