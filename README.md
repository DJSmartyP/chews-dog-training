# CHeWs Dog Training prototype v4

GitHub Pages-ready multi-page prototype.

## What changed
- Split the long single page into Home, Classes & Timetable, About, Gallery, Events, and Contact pages.
- Colour-coded the two training venues consistently: St Edmunds = teal; New Road Methodist = amber. Venue names are always shown as well, so colour is never the only cue.
- Added visible embedded venue maps plus Google Maps directions links.
- Added Sarah’s Instagram and Facebook group links to the contact page and footer.
- Gallery images keep their natural aspect ratio and open full-size; no forced centre crop.
- Retained the cleaned CHeWs mark and text treatment.
- Preserved the data-provider architecture so a future Firebase admin panel can replace local JSON without redesigning the public site.

## Run locally
Because content is loaded from JSON, serve the folder rather than double-clicking HTML. For example:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/

## GitHub Pages
Upload the contents of this folder to a repository and enable Pages from the main branch / root. All links are relative and work both under `username.github.io/repository/` and later on a custom domain.

## Future admin
The public pages read these content files through `js/content-provider.js`:
- `data/site.json`
- `data/classes.json`
- `data/team.json`
- `data/gallery.json`
- `data/events.json`

A Firebase implementation can swap the provider methods for Firestore/Storage reads while leaving the page renderers and data shapes intact.
