import { TanStackRouterVite } from "@tanstack/router-vite-plugin"
import react from "@vitejs/plugin-react"
import Icons from "unplugin-icons/vite"
import { defineConfig, loadEnv } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      TanStackRouterVite(),
      react(),
      tsconfigPaths(),
      Icons({
        compiler: "jsx",
        jsx: "react",
        iconCustomizer(_1, _2, props) {
          props.width = "1.5rem"
          props.height = "1.5rem"
        },
      }),
    ],

    server: {
      proxy: {
        "/api": {
          target: "http://127.0.0.1:5000",
          ws: true,
        },
      },
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      },
    },
  }
})
