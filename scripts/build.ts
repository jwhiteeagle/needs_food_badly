import tailwind from "bun-plugin-tailwind";
import { rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(import.meta.dir, "..");
const outdir = resolve(projectRoot, "dist");
if (process.cwd() !== projectRoot || dirname(outdir) !== projectRoot) {
  throw new Error(
    "Run builds from the project root; output must stay inside it.",
  );
}
await rm(outdir, { recursive: true, force: true });
const result = await Bun.build({
  entrypoints: ["src/index.html"],
  target: "browser",
  outdir,
  // Relative assets work at both an account root and a Pages repository prefix.
  publicPath: "./",
  plugins: [tailwind],
  minify: true,
  sourcemap: "none",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
console.log(`Built ${result.outputs.length} files into ${outdir}`);
