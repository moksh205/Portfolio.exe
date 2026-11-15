// Takes a screenshot of every live project site and saves it to public/projects/<repo>.jpg
// Run: npm run shots   (re-run after you deploy a new project)
import { access, mkdir, writeFile } from "node:fs/promises";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const FORCE = process.argv.includes("--force"); // re-take shots that already exist

const USER = "moksh205";
const OUT = new URL("../public/projects/", import.meta.url);

function liveUrl(r) {
  const home = (r.homepage || "").trim();
  if (home) return /^https?:\/\//.test(home) ? home : `https://${home}`;
  if (r.has_pages) return `https://${USER.toLowerCase()}.github.io/${r.name}/`;
  return null;
}

export const shotUrl = (site) =>
  "https://api.microlink.io/?" +
  new URLSearchParams({
    url: site,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
    "viewport.width": "1280",
    "viewport.height": "800",
    "viewport.deviceScaleFactor": "0.5",
    "screenshot.type": "jpeg",
    waitForTimeout: "1500",
  });

const repos = await (await fetch(`https://api.github.com/users/${USER}/repos?per_page=100`)).json();
const live = repos
  .filter((r) => !r.fork && r.name.toLowerCase() !== USER.toLowerCase())
  .map((r) => ({ name: r.name, site: liveUrl(r) }))
  .filter((r) => r.site);

await mkdir(OUT, { recursive: true });
for (const { name, site } of live) {
  process.stdout.write(`${name.padEnd(40)} `);
  const file = new URL(`${name}.jpg`, OUT);
  if (!FORCE && (await access(file).then(() => true, () => false))) {
    console.log("already have it");
    continue;
  }
  try {
    let res;
    // the free API allows a few calls at a time: back off and retry when it says "too many"
    for (let attempt = 0; attempt < 5; attempt++) {
      res = await fetch(shotUrl(site));
      if (res.status !== 429) break;
      const pause = (Number(res.headers.get("retry-after")) || 15 * (attempt + 1)) * 1000;
      process.stdout.write(`(busy, waiting ${pause / 1000}s) `);
      await wait(pause);
    }
    if (!res.ok || !(res.headers.get("content-type") || "").startsWith("image/")) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(file, buf);
    console.log(`ok (${Math.round(buf.length / 1024)} KB)`);
  } catch (e) {
    console.log(`failed: ${e.message}`);
  }
  await wait(4000);
}
