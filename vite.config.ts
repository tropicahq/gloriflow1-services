import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild }) => {
  console.log(`Is SSR build: ${isSsrBuild}`)
  return {
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    build: {
      // rollupOptions: {
      //   input: './server/app.ts',
      // },
      ssr: true,
      rollupOptions: isSsrBuild
        ? {
          input: './server/app.ts',
        }
        : undefined,
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
