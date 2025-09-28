import { defineManifest } from '@crxjs/vite-plugin';

declare const process: { env?: Record<string, string | undefined> };

const hostPermissions = ['https://*.vusercontent.net/*'];

if (process.env?.NODE_ENV === 'development') {
  hostPermissions.push('http://localhost:*/*');
}

export default defineManifest({
  manifest_version: 3,
  name: 'v0 Preview/Demo URL Opener',
  version: '0.1.0',
  description: 'Extract and open preview/demo URLs from v0.app chat.',
  icons: {
    16: 'icons/icon-16.png',
    32: 'icons/icon-32.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
    256: 'icons/icon-256.png',
    512: 'icons/icon-512.png'
  },
  permissions: ['storage', 'tabs'],
  // Narrow host permissions (only need vusercontent assets; localhost added dynamically during dev)
  host_permissions: hostPermissions,
  action: {
    default_popup: 'popup.html',
    default_title: 'Open Preview/Demo URLs',
    default_icon: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png'
    }
  },
  background: {
    service_worker: 'src/background/serviceWorker.ts',
    type: 'module'
  },
  content_scripts: [
    {
      matches: ['https://v0.app/*'],
      js: ['src/content/extractPreview.ts'],
      run_at: 'document_idle'
    }
  ],
  options_page: 'options.html',
  commands: {
    'open-latest-preview': {
      description: 'Open the latest preview/demo URL'
    }
  }
});
