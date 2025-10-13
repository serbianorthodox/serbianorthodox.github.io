from pathlib import Path
import re

p = Path("gallery.html")
html = p.read_text(encoding="utf-8")

# Ensure aria-label on the anchor and alt="" on the img
def fix_block(m):
    block = m.group(0)
    # add/replace aria-label on <a>
    block = re.sub(r'(<a\b[^>]*)(>)', lambda x: (
        re.sub(r'\saria-label="[^"]*"', '', x.group(1)) + ' aria-label="Visa större bild"' + x.group(2)
    ), block, count=1, flags=re.I)
    # set alt=""
    block = re.sub(r'\balt="[^"]*"', 'alt=""', block)
    return block

pattern = re.compile(r'<div class="col-12[^>]*>.*?<a\b.*?</a>\s*</div>', re.S|re.I)
new = pattern.sub(fix_block, html)

if new != html:
    Path("gallery.html").write_text(new, encoding="utf-8")
    print("Updated gallery.html: set alt=\"\" and aria-label on tiles.")
else:
    print("No changes made; pattern not found. Check your gallery HTML structure.")
