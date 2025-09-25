import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'v0 Preview/Demo URL Opener',
  version: '0.1.0',
  description: 'Extract and open preview/demo URLs from v0.app chat.',
  permissions: ['storage', 'tabs'],
  // Narrow host permissions (only need vusercontent assets; can refine further later)
  host_permissions: ['https://*.vusercontent.net/*'],
  action: {
    default_popup: 'popup.html',
    default_title: 'Open Preview/Demo URLs'
  },
  background: {
    service_worker: 'background.js',
    type: 'module'
  },
  content_scripts: [
    {
      matches: ['https://v0.app/*'],
      js: ['content.js'],
      run_at: 'document_idle'
    }
  ],
  icons: {
    '16': 'icons/icon16.png',
    '32': 'icons/icon32.png',
    '128': 'icons/icon128.png'
  },
  options_page: 'options.html',
  commands: {
    'open-latest-preview': {
      description: 'Open the latest preview/demo URL'
    }
  }
});
