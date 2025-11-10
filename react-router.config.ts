import { vercelPreset } from '@vercel/react-router/vite';
import type { Config } from "@react-router/dev/config";

declare module "react-router" {
  interface Future {
    unstable_middleware: true; // 👈 Enable middleware types
  }

}

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  future: {
    v8_middleware: true,
    unstable_optimizeDeps: true,
    // unstable_middleware: true, // 👈 Enable middleware
    unstable_viteEnvironmentApi: true,

  },
  presets: [vercelPreset()],
} satisfies Config;
