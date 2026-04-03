import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react';
          }
          if (id.includes('node_modules/@codemirror/') || id.includes('node_modules/@mavnn/codemirror-lang-ink') || id.includes('node_modules/@uiw/react-codemirror')) {
            return 'codemirror';
          }
          if (id.includes('node_modules/inkjs')) {
            return 'ink';
          }
        },
      },
    },
  },
});
