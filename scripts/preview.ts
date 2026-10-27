import { resolve } from "node:path";

// Local preview and smoke checks serve only built files, never source or an API.
export async function preview(port = 3030, basePath = "/") {
  const outdir = resolve(import.meta.dir, "../dist");
  const routes: Record<string, Response> = {};
  for await (const name of new Bun.Glob("**/*").scan(outdir)) {
    routes[`${basePath}${name.replaceAll("\\", "/")}`] = new Response(
      Bun.file(resolve(outdir, name)),
    );
  }
  const index = routes[`${basePath}index.html`];
  if (!index) throw new Error("Run bun run build before previewing.");
  routes[basePath] = index;
  return Bun.serve({
    hostname: "127.0.0.1",
    port,
    development: false,
    routes,
    fetch: () => new Response("Not found", { status: 404 }),
  });
}

if (import.meta.main) {
  const server = await preview(Number(process.env.PORT ?? 3030));
  console.log(`Preview: ${server.url}`);
}
