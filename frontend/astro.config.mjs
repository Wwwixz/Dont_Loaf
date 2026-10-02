// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        // В dev запросы /api уходят на локальный FastAPI (uvicorn app.main:app --port 8000)
        '/api': 'http://localhost:8000'
      }
    }
  }
});