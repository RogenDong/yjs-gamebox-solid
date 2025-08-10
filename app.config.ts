import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  ssr: false,
  middleware: "./src/middleware.ts",
  server: {},
  vite: {
    plugins: [tailwindcss()],
    envPrefix: "YJS",
  },
}).addRouter({
  name: "ws",
  type: "http",
  handler: "./src/ws.ts",
  target: "server",
  base: "/ws/1",
});
