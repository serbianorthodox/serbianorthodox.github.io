import sys, os
from pathlib import Path
from PIL import Image, features

def is_already_variant(name: str) -> bool:
    return name.endswith("-600") or name.endswith("-1200")

def save_jpeg(img: Image.Image, path: Path, width: int):
    im = img.copy()
    if width:
        w, h = im.size
        if w > width:
            new_h = int(h * width / w)
            im = im.resize((width, new_h), Image.LANCZOS)
    im = im.convert("RGB")
    im.save(path, format="JPEG", quality=82, optimize=True, progressive=True)

def save_webp(img: Image.Image, path: Path, width: int):
    im = img.copy()
    if width:
        w, h = im.size
        if w > width:
            new_h = int(h * width / w)
            im = im.resize((width, new_h), Image.LANCZOS)
    if not features.check("webp"):
        print(f"[WARN] Pillow lacks WebP support. Skipping {path.name}")
        return
    im.save(path, format="WEBP", quality=82, method=6)

def process_dir(dir_path: Path):
    exts = {".jpg", ".jpeg", ".png", ".webp"}
    for p in sorted(dir_path.iterdir()):
        if p.suffix.lower() not in exts: 
            continue
        stem = p.stem
        if is_already_variant(stem):
            continue
        try:
            with Image.open(p) as img:
                img = ImageOps.exif_transpose(img) if hasattr(Image, "Ops") else img
                base = dir_path / stem

                out_1200_jpg = dir_path / f"{stem}-1200.jpg"
                out_600_jpg  = dir_path / f"{stem}-600.jpg"
                out_1200_webp = dir_path / f"{stem}-1200.webp"
                out_600_webp  = dir_path / f"{stem}-600.webp"

                if not out_1200_jpg.exists(): save_jpeg(img, out_1200_jpg, 1200)
                if not out_600_jpg.exists():  save_jpeg(img, out_600_jpg, 600)
                if not out_1200_webp.exists(): save_webp(img, out_1200_webp, 1200)
                if not out_600_webp.exists():  save_webp(img, out_600_webp, 600)

                print(f"[OK] {p.name} -> -600/-1200 .jpg and .webp")
        except Exception as e:
            print(f"[ERROR] {p.name}: {e}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/gen_gallery_variants.py assets/img/gallery")
        sys.exit(1)
    target = Path(sys.argv[1])
    if not target.is_dir():
        print(f"Not a directory: {target}")
        sys.exit(1)
    process_dir(target)

if __name__ == "__main__":
    from PIL import ImageOps  # ensure import
    main()
