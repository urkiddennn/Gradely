import fs from "node:fs";
import path from "node:path";

const DEFAULT_SITE = "https://gradelyclass.space";

function loadEnvFile(file = ".env") {
  if (!fs.existsSync(file)) return;
  const contents = fs.readFileSync(file, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile();

const siteUrl = (process.env.VITE_SITE_URL || DEFAULT_SITE).replace(/\/+$/, "");
const dist = path.resolve("dist");

if (!fs.existsSync(dist)) {
  console.error("dist/ does not exist. Run `vite build` first.");
  process.exit(1);
}

fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *
Allow: /
Disallow: /app
Disallow: /app/
Disallow: /auth

Sitemap: ${siteUrl}/sitemap.xml
`,
);

fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
);

const indexFile = path.join(dist, "index.html");
if (fs.existsSync(indexFile)) {
  const html = fs.readFileSync(indexFile, "utf8");
  fs.writeFileSync(
    indexFile,
    html
      .replaceAll("%VITE_SITE_URL%", siteUrl)
      .replaceAll(
        "%VITE_SUPABASE_URL%",
        process.env.VITE_SUPABASE_URL || "https://your-project-ref.supabase.co",
      ),
  );
}

console.log(`SEO files generated for ${siteUrl}`);
