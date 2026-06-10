// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import viteTsconfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  vite: {
    plugins: [viteTsconfigPaths()]
  },
  server: {
    preset: "node-server"
  }
});
export {
  app_config_default as default
};
