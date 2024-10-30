import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), TanStackRouterVite()],
    clearScreen: false,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "process.env.VITE_PUBLIC_JAVA_BACKEND_URL": JSON.stringify(
        env.PUBLIC_JAVA_BACKEND_URL,
      ),
    },
  };
});
