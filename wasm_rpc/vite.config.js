// vite.config.js
import dotenv from 'dotenv';
import { defineConfig } from 'vite';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  server: {
    port: parseInt(process.env.VITE_WEB_PORT) || 3000,
    strictPort: true,
  },
});
