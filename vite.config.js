import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { spaRoutes } from './src/constants/routes.js';

// Render serves /login from dist/login.html and does not apply a redirect
// rule when that file exists. The static site currently 301s missing paths
// to /index.html, which replaces the path React Router needs.
function renderSpaRoutes() {
  let outDir = '';
  return {
    name: 'render-spa-routes',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const indexPath = resolve(outDir, 'index.html');
      for (const route of spaRoutes) {
        const name = route.replace(/^\//, '');
        copyFileSync(indexPath, resolve(outDir, `${name}.html`));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), renderSpaRoutes()],
});