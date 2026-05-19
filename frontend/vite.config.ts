import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/send-otp": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/verify-email": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/resend-otp": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/register": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/login": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/users": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/manager": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/complaints": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/bills": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/stats": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});