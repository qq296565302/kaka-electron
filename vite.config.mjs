import { defineConfig, loadEnv } from "vite";
import { dirname, resolve } from "path";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default ({ mode }) => {
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), "");
  return defineConfig({
    plugins: [
      vue(),
      AutoImport({  
        imports: ["vue", "vue-router", "pinia"],
      }),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "stores": resolve(__dirname, "./src/stores"),
        "utils": resolve(__dirname, "./src/utils"),
      },
    },
    css: {
      postcss: {
        plugins: [
        ],
      },
      // css预处理器
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
    server: {
      port: 8769,
      proxy: {
        "/api": {
          target: env.VITE_BASE_SERVICE,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  });
};
