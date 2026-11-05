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
    return { label: out || "" };
  } catch (e) {
    return { label: "" };
  }
};
