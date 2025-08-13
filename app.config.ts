import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  ssr: false,
  middleware: "./src/middleware.ts",
  server: {
    experimental: {
      websocket: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    envPrefix: "YJS",
    optimizeDeps: {
      include: ["solid-markdown > micromark", "solid-markdown > unified"],
    },
  },
}).addRouter({
  name: "ws",
  type: "http",
  handler: "./src/ws.ts",
  target: "server",
  base: "/ws",
});
