import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { dirname, resolve } from "path";
import postcsspxconversion from "postcss-px-conversion";


export default ({ mode }) => {
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), "");
  return defineConfig({
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    css: {
      postcss: {
        plugins: [
          postcsspxconversion({
            unitType: "px", // 要从哪种单位转换（默认为'px'）
            viewportWidth: 1920,
            enablePerFileConfig: true, // 启用per-file配置
            viewportWidthComment: "viewport-width", // 用于指定视口宽度的注释
            selectorBlacklist: [
              "Component-HeaderBar",
              ".Component-SiderBar",
              "layout-height",
            ], // 要忽略的选择器（字符串或正则表达式）
          }),
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
