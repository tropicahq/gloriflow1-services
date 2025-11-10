import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { cloudflare } from "@cloudflare/vite-plugin";
import netlifyReactRouter from "@netlify/vite-plugin-react-router";

import netlify from "@netlify/vite-plugin";

export default defineConfig(({ isSsrBuild }) => {
  console.log(`Is SSR build: ${isSsrBuild}`)
  return {
    plugins: [
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tailwindcss(), reactRouter(), tsconfigPaths()],
    build: {
      ssr: true,
      // rollupOptions: isSsrBuild
      //   ? {
      //     input: './server/app.ts',
      //   }
      //   : undefined,
    },
    server: {
      allowedHosts: ['retinued-twirly-nahla.ngrok-free.dev', "www.gloriflow1-services.space"]
    },
    // ssr: {
    //   target: "node",
    //
    // }
  }
}
);
