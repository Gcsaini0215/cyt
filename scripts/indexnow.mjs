// Tell Bing (and the other IndexNow engines — ChatGPT search leans on Bing's index) which pages
// are new or changed. Usage: node scripts/indexnow.mjs [url ...]   (no urls = every URL in the sitemaps)
const HOST = "www.chooseyourtherapist.in";
const KEY = "3b5d077b3e385f094ec2f2d1d9ef9d9b"; // public/3b5d077b3e385f094ec2f2d1d9ef9d9b.txt holds the same key
const SITEMAPS = ["/sitemap.xml", "/sitemap-static.xml", "/api/sitemap-therapists.xml", "/api/sitemap-blogs.xml"];

async function sitemapUrls() {
  const all = new Set();
  for (const p of SITEMAPS) {
    try {
      const xml = await (await fetch(`https://${HOST}${p}`)).text();
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) if (m[1].includes(HOST) && !/\.xml$/.test(m[1])) all.add(m[1]);
    } catch (e) { console.error("sitemap", p, e.message); }
  }
  return [...all];
}

const urls = process.argv.slice(2).length ? process.argv.slice(2) : await sitemapUrls();
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow: ${urls.length} URLs -> HTTP ${res.status}`);
