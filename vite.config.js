import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readFileSync } from 'node:fs';

// Dois alvos de build:
//  npm run build          -> dist/          site estático para o GitHub Pages
//  npm run build:offline  -> dist-offline/  um único index.html autocontido,
//                                           que abre com duplo clique, sem internet
// base './': caminhos relativos; funciona em qualquer subdiretório
// (https://usuario.github.io/repositorio/).
export default defineConfig(({ mode }) => {
  const offline = mode === 'offline';
  return {
    base: './',
    publicDir: offline ? false : 'public',
    plugins: offline ? [
      { name: 'offline-favicon', transformIndexHtml: html => html.replace('./favicon.svg',
        `data:image/svg+xml,${encodeURIComponent(readFileSync(new URL('./public/favicon.svg', import.meta.url), 'utf8'))}`) },
      viteSingleFile({ removeViteModuleLoader: true }),
    ] : [],
    build: {
      outDir: offline ? 'dist-offline' : 'dist',
      assetsInlineLimit: offline ? 100000000 : 0,
      chunkSizeWarningLimit: 900,
    },
  };
});
