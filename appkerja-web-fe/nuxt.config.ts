import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
declare const process: { env: Record<string, string | undefined> };

const packageJsonPath = fileURLToPath(new URL("./package.json", import.meta.url));
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as { version: string };

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Enable server-side rendering
  ssr: false,

  // TypeScript configuration
  typescript: {
    shim: false,
  },

  css: ['vuetify/styles'],

  // Vuetify build configuration
  build: {
    transpile: ["vuetify"],
  },

  // Modules
  modules: ["@pinia/nuxt"],

  runtimeConfig: {
    public: {
      graphqlEndpoint: "",
      ssoLoginUrl: "",
      appName: process.env.APP_NAME || "Sipemu",
      appUrl: process.env.APP_URL || "http://localhost:8088",
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || packageJson.version,
      buildCommit:
        process.env.NUXT_PUBLIC_BUILD_COMMIT ||
        process.env.VERCEL_GIT_COMMIT_SHA ||
        "local",
    },
  },

  // Application metadata
  app: {
    head: {
      title: process.env.APP_NAME || "Sipemu",
    },
  },


  // Nitro configuration
  nitro: {
    serveStatic: true,
  },

  // Dev server handlers
  devServerHandlers: [],

  compatibilityDate: "2024-09-06",
});
