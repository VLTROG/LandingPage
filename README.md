# Volturia — Landing Page (statica)

Versione statica della landing page Volturia, originariamente la **password page** dello
store Shopify (`volturia.com`). Convertita da Liquid a HTML/CSS/JS puro, deployabile
su **GitHub Pages**. Nessuna funzionalità commerce: solo presentazione + form newsletter.

## Struttura

```
index.html                  # pagina unica (generata — non modificare a mano)
assets/
  css/
    fonts.css               # @font-face locali (PPNeueMontreal, VOLTURIARegular)
    theme.css               # CSS del tema Streamline (copia da theme export)
    volturia-title.css      # animazione titolo VOLTURIA (font localizzati)
    site.css                # override versione statica + stato form newsletter
    glass-experiments.css   # (solo branch experiment) sheen + tilt glassmorphism
    vendor/normalize.min.css
  js/
    main.js                 # logica globale + form newsletter (Formspree)
    glass-interactions.js   # (solo branch experiment) sheen, tilt, magnetico CTA
    vendor/                 # gsap.min.js, ScrollTrigger.min.js (3.12.5)
  icons/                    # SVG social + ico-select
media/
  videos/                   # background, mission, bento, nfc, try-on, benefits
  images/                   # hero newsletter, icone benefit, logo, og-image
  fonts/                    # woff2/ttf locali
tools/
  build.py                  # rigenera index.html da reference/password-live.html
reference/password-live.html  # HTML renderizzato dalla pagina Shopify (sorgente)
theme_export__.../            # export completo del tema Shopify (riferimento)
```

## Modifiche rispetto alla versione Shopify

- Rimossi: modal password, form `storefront_password`, modali video/photoswipe,
  script checkout/cart/analytics Shopify, app embed (Clarity, AZ Fonts, cookie booster).
- URL CDN Shopify sostituiti con path locali `./media/...` e `./assets/...`.
- Font PPNeueMontreal / VOLTURIARegular serviti da `media/fonts/`.
- GSAP + ScrollTrigger serviti localmente (animazioni blur-to-focus invariate).
- Form newsletter Shopify (`{% form 'customer' %}`) sostituito con form statico
  gestito via fetch da `assets/js/main.js`.

## Configurare la newsletter

Il form usa [Formspree](https://formspree.io) (o qualunque endpoint che accetti
`POST` con campo `email`):

1. Crea un form su Formspree e copia l'endpoint (es. `https://formspree.io/f/abcdwxyz`).
2. In `index.html` sostituisci `https://formspree.io/f/YOUR_FORM_ID` nell'`action` del
   form `data-newsletter-form` (oppure aggiorna `NEWSLETTER_FORM` in `tools/build.py`
   e rigenera).
3. I messaggi di stato si personalizzano in `assets/js/main.js` (`MESSAGES`).

Alternative: Mailchimp/Brevo — basta puntare il fetch di `main.js` al loro endpoint.

## Sviluppo locale

```bash
python3 -m http.server 8000
# apri http://localhost:8000
```

## Rigenerare index.html

Se aggiorni il reference HTML esportato da Shopify:

```bash
python3 tools/build.py
```

Lo script rimappa automaticamente gli URL CDN sui path locali e sostituisce il form.
Gli asset in `assets/` e `media/` non vengono toccati.

Su `main`, lascia `ENABLE_GLASS_EXPERIMENTS = False` in `tools/build.py`.
Sul branch sperimentale è `True` e include CSS/JS glass in output.

## Branch sperimentale: `experiment/glass-interactions`

Branch dedicato a provare **glassmorphism interattivo** senza toccare la versione stabile su `main`.

| Branch | Contenuto |
|--------|-----------|
| `main` | Landing statica pronta per GitHub Pages |
| `experiment/glass-interactions` | Stessa base + glassmorphism interattivo e migliorie premium |

**Cosa aggiunge il branch experiment:**

- *Glassmorphism interattivo*: sheen al cursore su bento-box, FAQ, finestra social
  e CTA; tilt 3D sui bento (desktop); effetto magnetico su CTA e icone social;
  cursore glass (anello + dot) che reagisce agli elementi interattivi.
- *Lenis smooth scroll* integrato con ScrollTrigger (`assets/js/vendor/lenis.min.js`).
- *Parallax leggero* sul video background e *titolo VOLTURIA* che si dissolve
  nei primi 100vh (scrub ScrollTrigger).
- *Performance*: poster frame per tutti i 7 video (`media/images/posters/`),
  `preload="metadata"` sotto la fold, video compressi
  (`bash tools/optimize-videos.sh`, ~19.5MB → ~15MB), background ridotto a 1280px,
  preload `fetchpriority="high"` della foto Carrie.
- *Fruibilità*: stato "success" del form newsletter con micro-animazione GSAP,
  `alt` descrittivi sulle icone benefit, JSON-LD `Organization` + segnaposto
  canonical (`CANONICAL_URL` in `tools/build.py`).
- *Robustezza*: fallback che ripristina la pagina statica se GSAP non carica,
  `ScrollTrigger.config({ ignoreMobileResize: true })`.

**File aggiuntivi sul branch experiment:**

- `assets/css/glass-experiments.css` — stili sheen, perspective, cursore, stati hover
- `assets/js/glass-interactions.js` — sheen, tilt, magnetico, cursore
  (disattivato con `prefers-reduced-motion` o su touch)
- `assets/js/experiments.js` — Lenis, parallax, titolo allo scroll, fallback GSAP
- `tools/optimize-videos.sh` — rigenera poster e comprime i video (richiede ffmpeg)

**Per provare in locale:**

```bash
git checkout experiment/glass-interactions
python3 -m http.server 8000
# apri http://localhost:8000 — passa il mouse su bento-box e sul bottone newsletter
```

**Per tornare alla versione stabile:**

```bash
git checkout main
```

Le interazioni richiedono desktop con mouse (≥769px per il tilt bento). Su mobile/touch resta la versione statica senza effetti aggiuntivi.

## Deploy su GitHub Pages

Tutto il necessario è nella root del repo (sito statico, nessun build step).

1. Push del repo su GitHub.
2. **Settings → Pages → Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main`, cartella **`/ (root)`**
3. Il sito sarà su `https://<utente>.github.io/<repo>/` — i path relativi `./`
   funzionano anche nel sottopercorso.

Il file `.nojekyll` è già presente (evita l'elaborazione Jekyll).

Per un dominio custom (es. `volturia.com`): aggiungi un file `CNAME` con il dominio
e configura i DNS secondo la
[documentazione GitHub](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
