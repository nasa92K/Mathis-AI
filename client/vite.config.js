import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En développement, Vite redirige /api vers le backend Express.
// Le frontend ne connaît donc jamais la clé API.
//
// "vite build --mode hubspot" produit un seul fichier JS et un seul fichier CSS,
// sans hash, directement dans le thème HubSpot (my-cms-theme/app). HubSpot
// renomme et héberge chaque fichier sur son CDN : un découpage en plusieurs
// morceaux ne s'y retrouverait pas, d'où le bundle unique.
export default defineConfig(({ mode }) => {
  const hubspot = mode === 'hubspot';

  return {
    plugins: [react()],
    build: hubspot
      ? {
          outDir: '../my-cms-theme/app',
          emptyOutDir: true,
          copyPublicDir: false,
          cssCodeSplit: false,
          assetsInlineLimit: 100_000_000,
          chunkSizeWarningLimit: 2000,
          rollupOptions: {
            input: 'src/main.jsx',
            output: {
              codeSplitting: false,
              entryFileNames: 'mathis-ai.js',
              assetFileNames: 'mathis-ai.[ext]',
            },
          },
        }
      : {
          chunkSizeWarningLimit: 700,
        },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
