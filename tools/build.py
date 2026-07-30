#!/usr/bin/env python3
"""
Converte la password page Shopify renderizzata (reference/password-live.html)
in un index.html statico per GitHub Pages.

Uso:  python3 tools/build.py
Input:  reference/password-live.html
Output: index.html (root del repo)
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "reference" / "password-live.html"
OUT = ROOT / "index.html"

# True sul branch experiment/glass-interactions (glassmorphism interattivo)
ENABLE_GLASS_EXPERIMENTS = True

# Dominio definitivo della landing (es. GitHub Pages). Quando è noto,
# inserirlo qui: il build emette <link rel="canonical"> e lo usa nel JSON-LD.
CANONICAL_URL = ""

BRAND_URL = "https://volturia.com"

# Video sotto la fold: poster frame + preload="metadata" (branch experiment)
FOLD_VIDEOS = [
    "mission",
    "bento-1",
    "bento-3",
    "nfc-blockchain",
    "virtual-try-on",
    "benefits",
]

# Alt descrittivi per le icone benefit (branch experiment)
ALT_TEXTS = {
    "eco.png": "Eco-friendly materials icon",
    "italy.png": "Made in Italy icon",
    "sewing-machine.png": "Artisanal craftsmanship icon",
    "group-users.png": "Volturia community icon",
}

# --- Mappa URL CDN Shopify -> path locali ---------------------------------
VIDEO_MAP = {
    "265264e7b35f4d48bcf6153b5bea8388.mp4": "background.mp4",
    "51d2906f7e9941f5907239b510664d5f.webm": "mission.webm",
    "4312e978d2d2462f862ef6b6810de1e6.webm": "bento-1.webm",
    "161f2220ff9c40ac937fa2a69c4a18d5.mp4": "bento-3.mp4",
    "7b6b9b19e7c0405598dd26c10c5ef0fa.mp4": "nfc-blockchain.mp4",
    "8ab2a10af4c84b4c9faa712a75fbd607.webm": "virtual-try-on.webm",
    "fbb97b19028942549ecb0e0a3b8b41d1.mp4": "benefits.mp4",
}

DESCRIPTION = (
    "Discover the latest fashion designs by Volturia. Shop the exclusive "
    "high-end collections and unique pieces for men and women. "
    "Settled in Rome, Italy and Los Angeles, US. Worldwide Shipping."
)

# Form newsletter statico (Formspree). L'endpoint si configura in assets/js/main.js
NEWSLETTER_FORM = """<form method="post" action="https://formspree.io/f/YOUR_FORM_ID" id="newsletter-form" accept-charset="UTF-8" class="contact-form" data-newsletter-form>
<label for="Email-newsletter" class="hidden-label">
      Enter your email
    </label>
    <label for="newsletter-form-submit" class="hidden-label">Subscribe</label>
    <div class="newsletter-form-group">


      <input type="email" value="" placeholder="Enter your e-mail" name="email" id="Email-newsletter" class="newsletter-form-group__input" autocapitalize="off" required>
      <button type="submit" id="newsletter-form-submit" class="newsletter-form-group__submit" title="Subscribe">
        <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-email" viewBox="0 0 64 64"><path d="M63 52H1V12h62zM1 12l25.68 24h9.72L63 12M21.82 31.68L1.56 51.16m60.78.78L41.27 31.68"/></svg>
      </button>
    </div>
    <p class="nl-form-status" data-form-status role="status" aria-live="polite"></p></form>"""

GLASS_CSS_LINK = (
    '\n  <link rel="stylesheet" href="./assets/css/glass-experiments.css">'
    if ENABLE_GLASS_EXPERIMENTS
    else ""
)
GLASS_JS_SCRIPT = (
    '\n  <script src="./assets/js/glass-interactions.js"></script>'
    if ENABLE_GLASS_EXPERIMENTS
    else ""
)
EXPERIMENTS_JS_SCRIPT = (
    '\n  <script src="./assets/js/experiments.js"></script>'
    if ENABLE_GLASS_EXPERIMENTS
    else ""
)

# Head extra del branch experiment: preload Carrie, Lenis, canonical, JSON-LD
def build_experiment_head() -> str:
    if not ENABLE_GLASS_EXPERIMENTS:
        return ""
    parts = [
        '\n  <link rel="preload" as="image" '
        'href="./media/images/carrie_croptop_AIV2_cropped.jpg" fetchpriority="high">',
        '\n  <script src="./assets/js/vendor/lenis.min.js"></script>',
    ]
    if CANONICAL_URL:
        parts.append(f'\n  <link rel="canonical" href="{CANONICAL_URL}">')
    else:
        parts.append(
            "\n  <!-- TODO: imposta CANONICAL_URL in tools/build.py quando il"
            " dominio GitHub Pages e' noto -->"
        )
    json_ld = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Volturia",
        "url": CANONICAL_URL or BRAND_URL,
        "logo": "./media/images/logoV.svg",
        "description": DESCRIPTION,
        "sameAs": [
            "https://instagram.com/volturia_official",
            "https://www.linkedin.com/company/volturia/",
        ],
    }
    parts.append(
        '\n  <script type="application/ld+json">'
        + json.dumps(json_ld, indent=2).replace("\n", "\n  ")
        + "</script>"
    )
    return "".join(parts)

EXPERIMENT_HEAD = build_experiment_head()

HEAD = f"""<!doctype html>
<html class="no-js" lang="en" dir="ltr">
<head>

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#ffffff">

  <title>Volturia</title>
  <meta name="description" content="{DESCRIPTION}">
  <meta property="og:site_name" content="Volturia">
  <meta property="og:title" content="Volturia">
  <meta property="og:type" content="website">
  <meta property="og:description" content="{DESCRIPTION}">
  <meta property="og:image" content="./media/images/volturia_social_web.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="628">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Volturia">
  <meta name="twitter:description" content="{DESCRIPTION}">

  <link rel="icon" href="./media/images/logoV.svg" type="image/svg+xml">

  <link rel="preload" href="./media/fonts/ppneuemontreal-book.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="./media/fonts/ppneuemontreal-regular.woff2" as="font" type="font/woff2" crossorigin>

  <link rel="stylesheet" href="./assets/css/fonts.css">
  <link rel="stylesheet" href="./assets/css/theme.css">
  <link rel="stylesheet" href="./assets/css/site.css">{GLASS_CSS_LINK}

  <script>
    document.documentElement.className = document.documentElement.className.replace('no-js', 'js');
  </script>
  <script src="./assets/js/vendor/gsap.min.js"></script>
  <script src="./assets/js/vendor/ScrollTrigger.min.js"></script>{EXPERIMENT_HEAD}
</head>

"""


def add_experiment_enhancements(html: str) -> str:
    # Poster frame su tutti i video; preload="metadata" solo sotto la fold
    def posterize(match: re.Match) -> str:
        tag_start, name = match.group(1), match.group(2)
        extra = f' poster="./media/images/posters/{name}.jpg"'
        if name in FOLD_VIDEOS:
            extra += ' preload="metadata"'
        return tag_start + extra

    html = re.sub(
        r'(<video\b[^>]*?src="\./media/videos/'
        r"(background|mission|bento-1|bento-3|nfc-blockchain|virtual-try-on|benefits)"
        r'\.(?:mp4|webm)")',
        posterize,
        html,
    )

    for filename, alt in ALT_TEXTS.items():
        html = html.replace(
            f'src="./media/images/{filename}" alt="Benefit icon"',
            f'src="./media/images/{filename}" alt="{alt}"',
        )

    return html


def replace_media_urls(html: str) -> str:
    # Video Shopify CDN -> ./media/videos/
    for cdn_name, local_name in VIDEO_MAP.items():
        html = html.replace(
            f"https://cdn.shopify.com/videos/c/o/v/{cdn_name}",
            f"./media/videos/{local_name}",
        )

    # Immagini shop files (con query string ?v=...&width=...) -> ./media/images/
    html = re.sub(
        r"//volturia\.com/cdn/shop/files/([A-Za-z0-9_\-]+\.(?:png|jpg|jpeg|webp|gif|svg))[^\"')\s]*",
        r"./media/images/\1",
        html,
    )

    # Icone social del tema -> ./assets/icons/
    html = re.sub(
        r"//volturia\.com/cdn/shop/t/\d+/assets/([a-z]+icon\.svg)\?[^\"')\s]*",
        r"./assets/icons/\1",
        html,
    )

    # CSS titolo animato -> copia locale con font locali
    html = html.replace(
        "https://cdn.shopify.com/s/files/1/0234/8777/4816/files/movingtext.css?v=1679846472",
        "./assets/css/volturia-title.css",
    )

    # normalize.css -> vendor locale
    html = html.replace(
        "https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css",
        "./assets/css/vendor/normalize.min.css",
    )

    # GSAP -> vendor locale (fallback loader dentro gli script inline delle sezioni)
    html = html.replace(
        "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",
        "./assets/js/vendor/gsap.min.js",
    )
    html = html.replace(
        "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js",
        "./assets/js/vendor/ScrollTrigger.min.js",
    )
    return html


def main() -> None:
    html = SRC.read_text(encoding="utf-8")

    # --- Estrai il body renderizzato ---
    m = re.search(r"<body[^>]*>", html)
    if not m:
        raise SystemExit("body non trovato nel reference HTML")
    body_tag = m.group(0)
    body_tag = re.sub(
        r'data-animate_images="true"',
        'data-animate_images="false"',
        body_tag,
    )

    body = html[m.end():]

    # Taglia tutto dopo la fine di PageContainer:
    # LoginModal, newsletter-popup, VideoModal, photoswipe, script Shopify finali
    cut = body.find('<div id="LoginModal"')
    if cut == -1:
        raise SystemExit("LoginModal non trovato: impossibile delimitare la fine del contenuto")
    body = body[:cut]

    # Rimuovi splash screen (gestita da theme.js su Shopify, qui non serve)
    body = re.sub(
        r'<div class="splash-screen">.*?</div>',
        "",
        body,
        count=1,
        flags=re.DOTALL,
    )

    # Sostituisci il form newsletter Shopify con quello statico
    body, n = re.subn(
        r'<form method="post" action="/contact[^>]*>.*?</form>',
        NEWSLETTER_FORM,
        body,
        count=1,
        flags=re.DOTALL,
    )
    if n != 1:
        raise SystemExit("form newsletter non trovato nel body")

    body = replace_media_urls(body)

    if ENABLE_GLASS_EXPERIMENTS:
        body = add_experiment_enhancements(body)

    OUT.write_text(
        HEAD + body_tag + "\n" + body
        + '\n  <script src="./assets/js/main.js"></script>'
        + GLASS_JS_SCRIPT
        + EXPERIMENTS_JS_SCRIPT
        + "\n</body>\n</html>\n",
        encoding="utf-8",
    )

    # Report rapido su URL esterni rimasti
    leftovers = re.findall(
        r"(?:volturia\.com/cdn|cdn\.shopify\.com)[^\"'\s)]*",
        OUT.read_text(encoding="utf-8"),
    )
    print(f"OK: scritto {OUT.relative_to(ROOT)}")
    if leftovers:
        print("ATTENZIONE, URL Shopify residui:")
        for url in sorted(set(leftovers)):
            print("  -", url)
    else:
        print("OK: nessun URL Shopify residuo")


if __name__ == "__main__":
    main()
