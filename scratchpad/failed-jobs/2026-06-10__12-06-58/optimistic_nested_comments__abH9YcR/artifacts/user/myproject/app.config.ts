import { defineConfig } from "@tanstack/start/config";

export default defineConfig({
  server: {
    preset: "node-server",
  },
  vite: {
    server: {
      port: 47821,
    },
  },
});
