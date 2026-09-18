#!/usr/bin/env python3
import struct, zlib, pathlib

def chunk(tag, data):
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)

def write_png(path, w, h, rgb):
    r, g, b = rgb
    raw = b"".join(b"\x00" + bytes([r, g, b]) * w for _ in range(h))
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    pathlib.Path(path).write_bytes(png)

pathlib.Path("assets").mkdir(exist_ok=True)
write_png("assets/icon.png", 1024, 1024, (255, 138, 61))
write_png("assets/splash-icon.png", 512, 512, (5, 11, 20))
write_png("assets/favicon.png", 48, 48, (255, 138, 61))
write_png("assets/android-icon-foreground.png", 432, 432, (255, 138, 61))
write_png("assets/android-icon-background.png", 432, 432, (5, 11, 20))
write_png("assets/android-icon-monochrome.png", 432, 432, (255, 255, 255))
print("assets ready")
