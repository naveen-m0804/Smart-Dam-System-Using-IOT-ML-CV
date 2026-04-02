import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Proxy /api requests to the local Flask backend during development.
    // This avoids CORS issues entirely when running both frontend & backend locally.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Only proxy in dev when no VITE_API_URL override is set
        bypass(req) {
          if (process.env.VITE_API_URL) return req.url;
          return undefined;
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
