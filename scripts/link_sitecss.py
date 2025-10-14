from pathlib import Path
import re, shutil

root = Path(".").resolve()
skip = {".git", ".github", "node_modules", "assets", "partials"}
needle = '/assets/css/site.css'
link_tag = '    <link rel="stylesheet" href="/assets/css/site.css">'

changed = []

for p in root.rglob("*.html"):
    if any(part in skip for part in p.parts):
        continue
    text = p.read_text(encoding="utf-8")
    if needle in text:
        continue

    new = text
    m = re.search(r'(<link[^>]+bootstrap[^>]*>)', text, flags=re.I)
    if m:
        i = m.end()
        new = text[:i] + "\n" + link_tag + text[i:]
    else:
        new = re.sub(r'</head>', link_tag + "\n</head>", new, flags=re.I)

    if new != text:
        shutil.copy2(p, str(p) + ".bak")
        p.write_text(new, encoding="utf-8")
        changed.append(str(p))

print("Inserted into", len(changed), "files")
for f in changed:
    print(" -", f)
