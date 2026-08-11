# Adamya Birthday Journey

A single-page interactive birthday website for Adamya, created by Anannya.

## Included
- `index.html` — entry point
- `styles.css` — full scrapbook / mystery styling
- `app.js` — countdown, candle game, navigation, quizzes, localStorage, music, video and final riddle
- `assets/newspaper.png` — supplied newspaper image
- `assets/birthday-video.mp4` — supplied birthday video
- `assets/birthday-song.mp4` — supplied Happy Birthday audio track

## Run locally

Because browsers can restrict some media/iframe behavior from `file://`, serve the folder with a small local HTTP server.

### Python
```bash
python -m http.server 8000
```

Then open:
`http://localhost:8000`

## Testing shortcuts
- `G` while the countdown is visible: bypass countdown and open the candle game.
- `R`: reset saved progress and return to the countdown.

There is intentionally no visible Skip button.

## Notes
- Countdown target is exactly `20 August 2026 00:00` in India (+05:30).
- One persistent `<audio>` element is used for the birthday music. It does not loop and is not recreated during navigation.
- Bouquet is kept in-page with its exact URL and also has a new-tab fallback.
- Card, Group Card and Letters open their exact supplied URLs in a new tab, avoiding embedded external-site errors.
- Bouquet is available immediately from the Main Menu — no Bouquet quiz is required. Opening the Bouquet marks the first surprise as unlocked; the 'I've seen the bouquet →' button leads into the Card quiz. Unlock state is stored in `localStorage`, so unlocked sections remain accessible after navigation and refresh.
