// Builds _site/llms.txt and _site/llms-full.txt after every Eleventy build.
// Page list = every <loc> in the built sitemap.xml (same filter as the sitemap).
// Hand-written intros live in scripts/llms-intro.txt and llms-full-intro.txt.
const fs = require("fs");
const path = require("path");

const ORIGIN = "https://quickler.co";
const MAX_BODY = 20000; // characters per page, keeps llms-full.txt well under 5 MB

const decode = (s) => s
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&pound;/g, "£")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const clean = (s) => decode(s).replace(/\s+/g, " ").trim();
const dash = (s) => s.replace(/\s*[—–]\s*/g, ", ");

function fileFor(site, loc) {
  const u = loc.replace(ORIGIN, "") || "/";
  const f = u.endsWith("/") ? u + "index.html" : u;
  return path.join(site, f);
}


// Clean Markdown copy of a page's <main> (Philip 9 Nov 2026): /pages/foo.html -> /pages/foo.md,
// /dir/ -> /dir/index.md. Not linked from any visible page; llms.txt points at these.
function toMarkdown(mainHtml) {
  let h = mainHtml
    .replace(/<(script|style|noscript|svg|template|form|button|iframe|nav|footer)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<img[^>]*>/gi, " ");
  h = h.replace(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const t = txt.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!t) return " ";
    if (/^(#|javascript:|mailto:)/i.test(href)) return t;
    const abs = href.startsWith("http") ? href : ORIGIN + (href.startsWith("/") ? href : "/" + href);
    return `[${t}](${abs})`;
  });
  h = h
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n")
    .replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, "\n\n#### $1\n\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<\/(p|div|tr|section|article|ul|ol|table|blockquote|details|summary)>|<br\s*\/?>/gi, "\n\n")
    .replace(/<\/t[dh]>/gi, " | ")
    .replace(/<[^>]+>/g, " ");
  const lines = decode(h).split("\n").map((l) => l.replace(/[ \t]+/g, " ").trim());
  const out = [];
  for (const l of lines) {
    if (!l || /^[-|*\s]*$/.test(l) && l !== "") { if (out.length && out[out.length - 1] !== "") out.push(""); continue; }
    if (/^\*\*\s*\*\*$/.test(l)) continue;
    out.push(l.replace(/^(#+) +/, "$1 ").replace(/ \| *$/, ""));
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
const mdPath = (loc) => { const u = loc.replace(ORIGIN, "") || "/"; return u.endsWith("/") ? u + "index.md" : u.replace(/\.html?$/, "") + ".md"; };

function readPage(site, loc) {
  let html = "";
  try { html = fs.readFileSync(fileFor(site, loc), "utf8"); } catch (e) { return null; }
  const t = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "";
  const d = (html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i) || [])[1] || "";
  let main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
  main = main
    .replace(/<(script|style|noscript|svg|template|form|button|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|ul|ol|table|blockquote)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  const lines = decode(main).split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  let body = lines.join("\n\n");
  if (body.length > MAX_BODY) body = body.slice(0, MAX_BODY).replace(/\s+\S*$/, "") + " ...";
  const title = clean(t).replace(/\s*[|–—-]\s*Quickler\s*$/i, "") || clean(h1) || loc;
  const mainRaw = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
  let md = dash(toMarkdown(mainRaw));
  if (md.length > 200000) md = md.slice(0, 200000) + "\n\n...";
  return { loc, title: dash(title), desc: dash(clean(d)), body: dash(body), md, mdUrl: ORIGIN + mdPath(loc) };
}

module.exports = function generate(site, scriptsDir) {
  const sm = fs.readFileSync(path.join(site, "sitemap.xml"), "utf8");
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const pages = locs.map((l) => readPage(site, l)).filter(Boolean);
  const intro = fs.readFileSync(path.join(scriptsDir, "llms-intro.txt"), "utf8").replace(/\s+$/, "") + "\n";
  const fullIntro = fs.readFileSync(path.join(scriptsDir, "llms-full-intro.txt"), "utf8").replace(/\s+$/, "") + "\n";

  const norm = (u) => u.replace(/[)>\].,;]+$/, "").replace(/\/$/, "");
  const linked = new Set((intro.match(/https:\/\/quickler\.co[^\s)>\]]*/g) || []).map(norm));
  const rest = pages.filter((p) => !linked.has(norm(p.loc)));

  const groups = {};
  for (const p of rest) {
    const seg = p.loc.replace(ORIGIN, "").split("/").filter(Boolean)[0] || "";
    const g = seg === "" ? "Home" : seg === "pages" ? "Pages" : seg.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
    (groups[g] = groups[g] || []).push(p);
  }
  let out = intro + "\n## All pages\n\nEvery public page on quickler.co, generated at build time from the sitemap.\n";
  for (const g of Object.keys(groups).sort((a, b) => (a === "Pages") - (b === "Pages") || a.localeCompare(b))) {
    out += `\n### ${g}\n\n`;
    for (const p of groups[g].sort((a, b) => a.title.localeCompare(b.title))) {
      out += `- [${p.title.replace(/[\[\]]/g, "")}](${p.mdUrl})${p.desc ? ": " + p.desc : ""}\n`;
    }
  }
  fs.writeFileSync(path.join(site, "llms.txt"), out);

  for (const p of pages) {
    const head = `# ${p.title}\n\n${p.desc ? "> " + p.desc + "\n\n" : ""}Source: ${p.loc}\n\n`;
    const f = path.join(site, mdPath(p.loc));
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, head + p.md + "\n");
  }

  let full = fullIntro + "\n---\n\n# Every page\n\n";
  for (const p of pages) full += `## ${p.title}\n${p.loc}\n\n${p.body || p.desc}\n\n`;
  fs.writeFileSync(path.join(site, "llms-full.txt"), full);
  console.log(`[llms] ${pages.length} pages and .md copies, llms.txt ${out.length} chars, llms-full.txt ${full.length} chars`);
};
