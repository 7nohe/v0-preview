# v0 Preview/Demo URL Opener (Extension)

Early scaffolding. Implementation will follow TDD per `specs/001-v0-app-chat/tasks.md`.

## Scripts
- `dev`: run Vite dev + CRX
- `build`: production bundle
- `lint`: ESLint
- `test`: Vitest run all tests
- `icons`: resize the base icon into the Chrome extension sizes
- `release:bundle`: rebuilds assets and produces a zip in `release/` for GitHub releases
- `release:prepare`: update `package.json` version, refresh lockfile, commit, and create a git tag

## Architecture (planned)
- content script extracts preview iframe origins
- background manages list & messaging
- popup displays list & allows open

## Next
1. Write failing tests (Phase 3.2)
2. Implement core modules to satisfy tests

## Assets
- `icon.png`: high-resolution source
- `icons/`: generated Chrome extension icons (run `npm run icons` to refresh)

## Release

### Preparation
1. Run `npm run release:prepare -- <new-version>` to update the `package.json` version, commit, and automatically create a tag (`v<version>`).
2. Optionally, run checks such as `npm test` to verify the project state.

### GitHub Release (Recommended Flow)
1. Push the newly created tag to GitHub (`git push origin main --tags`).
2. Create a new release on GitHub, specifying the tag name in the `vX.Y.Z` format (e.g., `v0.2.0`).
3. The tag must match the `version` field in `package.json`. If they do not match, the workflow will fail.
4. Upon publishing the release, `.github/workflows/release-package.yml` will run, build `release/v0-preview-extension-<tag>.zip`, and automatically attach it as a release asset.
5. Confirm that the zip file is attached on the release page and provide instructions to users.

### Manual Upload (Backup Flow)
1. In the `extension/` directory, run `npm run release:bundle`. If needed, specify the `RELEASE_VERSION` environment variable in the `vX.Y.Z` format.
2. A file named `v0-preview-extension-v<version>.zip` will be generated in the `release/` directory. Upload this as a GitHub release asset.
3. You may delete the generated files in the `release/` directory when no longer needed (they are git-ignored).

## Install from GitHub Release

### Download
1. Go to the latest release page and download the attached `v0-preview-extension-vX.Y.Z.zip` file.
2. Extract the downloaded zip file. You will get a built folder containing `manifest.json` (note the extraction path).

### Load into Chrome
1. Open Chrome and navigate to `chrome://extensions/` in the address bar.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the folder you just extracted.
4. The extension will appear in the list. To update, extract the new zip and overwrite the folder, or use **Load unpacked** again to reload.
