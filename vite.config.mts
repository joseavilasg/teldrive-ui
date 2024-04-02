import { existsSync } from "fs"
import { resolve } from "path"
import { faviconsPlugin } from "@darkobits/vite-plugin-favicons"
import { TanStackRouterVite } from "@tanstack/router-vite-plugin"
import react from "@vitejs/plugin-react"
import AdmZip from "adm-zip"
import axios from "feaxios"
import { defineConfig, loadEnv, Plugin } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

function PdfJsPlugin(): Plugin {
  return {
    name: "pdf-js-plugin",
    apply: "build",
    async buildStart() {
      const pdfJsDir = resolve(__dirname, "public", "pdf.js")
      if (existsSync(pdfJsDir)) {
        return
      }
      const response = await axios.get(
        "https://github.com/divyam234/pdf.js/releases/download/latest/pdfjs.zip",
        {
          responseType: "arrayBuffer",
        }
      )

      const zip = new AdmZip(Buffer.from(response.data))

      zip.extractAllTo(pdfJsDir, true)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      TanStackRouterVite(),
      react(),
      tsconfigPaths(),
      PdfJsPlugin(),
      faviconsPlugin({
        icons: {
          favicons: {
            source: `./logos/${env.VITE_DRIVE_PROVIDER}.svg`,
          },
        },
      }),
    ],
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:5000",
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
