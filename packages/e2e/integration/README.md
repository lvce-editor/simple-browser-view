# Simple Browser application integration

These scenarios were migrated from `lvce-editor/lvce-editor/scripts/test-simple-browser-*.mjs`. The application-integration workflow runs the tests from this repository against a pinned LVCE source fixture (v0.115.13, including the browser navigation and reload-focus fixes). The fixture supplies the renderer implementation, Electron and build dependencies. CI builds this repository’s current revision and installs its worker bundle into the fixture before testing.

Tab overflow and new-tab suggestions run on Linux, macOS and Windows. Native ownership, visibility, restoration, suggestions, themes, workflows and workspace transitions run under Xvfb on Linux. Each native scenario owns all four XDG directories and a Chromium profile. Original scenario assertions are retained, including a complete Electron restart and native compositor visibility checks.

To run locally, install a checkout of the pinned application revision, set `LVCE_SOURCE_ROOT` to its absolute directory, run `npm ci`, `npm run build` and `node packages/e2e/integration/install-fixture.mjs`, then run `xvfb-run -a node packages/e2e/integration/test-simple-browser-address.mjs` (substitute another scenario as needed). Run sequentially because source-mode scenarios temporarily bundle the fixture's renderer entry.

Keep feature regressions here or in the existing `electron/src` suite. The application repository should retain packaging and cross-feature orchestration checks, rather than duplicate these scenarios.
