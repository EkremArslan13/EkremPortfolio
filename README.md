# Ekrem Arslan - Portfolio

Personal portfolio of Ekrem Arslan, a third-year Industrial Engineering student at
Mehmet Akif Ersoy University working across software development (C#, .NET,
ASP.NET Core), AI, cloud computing (Azure) and data analytics.

Plain HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies.

## Structure

```
index.html                              Single-page site (all content lives here)
404.html                                GitHub Pages "not found" page
assets/css/styles.css                   Design tokens, layout, components, responsive rules
assets/js/main.js                       Menu, active nav, reveals, Fig. 01 route demo, copy email
assets/img/ekrem-arslan-portrait.jpg    Black-and-white portrait (About section)
assets/img/rotiva-interface.png         Rotiva web interface preview
assets/img/real-estate-dashboard.png    Real estate data mining dashboard preview
assets/img/favicon.svg                  Monogram favicon
assets/img/og-image.png                 Social sharing preview
.nojekyll                               Serve files as-is on GitHub Pages
```

## Run locally

Any static file server works, for example:

```
npx serve .
# or
python -m http.server 8000
```

Then open http://localhost:8000 (or the port shown). Opening `index.html`
directly in a browser also works.

## Deploy to GitHub Pages (free)

1. Create a repository, e.g. `EkremArslan13.github.io` (served at the root) or any
   other name (served at `/repo-name/`).
2. Push these files to the `main` branch.
3. In the repository: Settings -> Pages -> Source: "Deploy from a branch",
   Branch: `main`, folder `/ (root)`.
4. After a minute the site is live. All paths are relative, so both URL styles work.

Optional: once the final URL is known, change `og:image` in `index.html` to an
absolute URL (e.g. `https://ekremarslan13.github.io/assets/img/og-image.png`) so
link previews work on every platform.

## Editing content

- Text: edit `index.html`; every section is marked with a comment banner.
- Colours and fonts: edit the custom properties at the top of `styles.css`.
- Projects: each project is an `<article class="project ...">`. Add a repository
  or demo link inside `.project__content` when one is available.

## Design notes

- Concept: an "engineering notebook" with editorial typography (Geist, Geist Mono,
  Instrument Serif), numbered sections, figure captions and crop marks.
- Fig. 01 in the hero is a live demo: random points, a nearest-neighbour tour
  (dashed) improved by 2-opt (solid). The numbers it shows are computed in the browser.
- Rotiva and Real Estate Data Mining use real interface screenshots; Trendyol Review
  Analysis uses a clearly labelled conceptual process diagram.
- Respects `prefers-reduced-motion`, has a skip link, keyboard-accessible menu
  and visible focus states.
