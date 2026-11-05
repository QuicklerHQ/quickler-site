// The site's version label, the same as the engine's and the dashboard's
// (Philip 5 Nov 2026): TOTAL.DAY.MONTH.YEAR.INDEX in UK date order, e.g.
// 412.5.11.2026.3. scripts/version_label.sh works it out from git, so the same
// commit always gets the same label. site.json's "version" stays as the cache
// buster on CSS and JS links; this label is what the footer shows.
const { execFileSync } = require("child_process");
const path = require("path");
module.exports = () => {
  try {
    const out = execFileSync("bash", [path.join(__dirname, "../../scripts/version_label.sh")], { encoding: "utf8", timeout: 5000 }).trim();
    // Shown as Philip asked (5 Nov 2026 12:34): "465 (17 of 5/11/2026)".
    const m = out.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    const shown = m ? `${m[1]} (${m[5]} of ${m[2]}/${m[3]}/${m[4]})` : out;
    return { label: out || "", shown: shown || "" };
  } catch (e) {
    return { label: "" };
  }
};
