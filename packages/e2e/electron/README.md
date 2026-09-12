# Simple Browser Electron tests

These tests exercise the built-in Simple Browser in a published LVCE desktop app. They complement the component tests in `../src`.

Coverage includes:

- Navigation, redirects, response types, loading, address focus, history, and downloads.
- Tab creation, selection, reordering, duplication, closing, overflow, and background links.
- Full-width layout, resizing, saved layout, address selection, document preservation, and 50 consecutive switches.
- Double-Ctrl from browser controls and embedded pages, disabled gestures, held keys, expired timing, shortcuts, intervening keys, and mouse cancellation.
- Local and remote suggestions, stale requests, provider failure, keyboard and mouse selection, dismissal, and tab changes.
- Light and inherited controls, favicons, hover cards, zoom, and audio controls.
- Native link, image, and editing menus, clipboard actions, Inspect Element, and browser DevTools.

Run from `packages/e2e`:

```sh
npm run e2e:electron
npm run e2e:electron -- --filter=simple-browser.workspace-
```

Each case has a two-minute deadline covering startup, execution, and shutdown. The runner starts a fresh Electron process and isolated XDG profile for each case. Local HTTP fixtures avoid external website dependencies; suggestion tests intercept the provider in Electron. Native menu tests construct the real menu and invoke its captured action without leaving an operating-system popup open. Folder and external-browser actions capture the native shell call and verify its destination.

The default app version is pinned in `electron/run.ts` and CI. Override it with `LVCE_ELECTRON_VERSION` or `--electron-version`. Linux CI runs the Electron suite and runs the audio-indicator case separately with PulseAudio. The Basic Auth case remains explicitly skipped pending its dialog integration.

Shared-fixture cases save Playwright traces under `.test-with-playwright/artifacts`; CI uploads them after a failure. Open a downloaded trace with `npx playwright show-trace <trace.zip>`.
