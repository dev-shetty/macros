import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "node:path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      macros: path.resolve(__dirname, "../../../packages/macros/dist"),
    },
  },
  optimizeDeps: {
    exclude: ["macros"], // so Vite doesn’t try prebundle it
  },
})
