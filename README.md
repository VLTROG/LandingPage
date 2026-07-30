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
    vendor/normalize.min.css
  js/
    main.js                 # logica globale + form newsletter (Formspree)
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
