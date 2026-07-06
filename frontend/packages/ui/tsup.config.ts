import { defineConfig } from "tsup";

// Bundles the presentation library into a single ESM module + type declarations.
// All framework/UI peers stay external so the consuming app (and the design-sync
// bundler) provide them once, keeping dist lean. No "use client" directive is
// emitted: the library is always consumed inside the app's client-component
// wrappers (and Next.js transpilePackages), which establish the client boundary.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2020",
  external: [
    "react",
    "react-dom",
    /^react\//,
    /^react-dom\//,
    /^@mui\//,
    /^@emotion\//,
    /^@blocknote\//,
  ],
});
