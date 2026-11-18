// Run the tutor tests without a browser:  node run_tests.js   (also rebuilds data/tutor-tests.js)
const fs = require("fs"), path = require("path");
const here = __dirname;
const tests = fs.readFileSync(path.join(here, "tutor-tests.json"), "utf8").trim();
fs.writeFileSync(path.join(here, "data", "tutor-tests.js"), "/* Generated from tutor-tests.json by run_tests.js — edit that file. */\nwindow.PQ_TUTOR_TESTS = " + tests + ";\n");
global.window = {};
global.document = { readyState: "complete", getElementById: () => null, createElement: () => ({ append() {}, addEventListener() {}, setAttribute() {} }), createTextNode: () => ({ nodeType: 3 }) };
require(path.join(here, "data", "tutor-data.js"));
require(path.join(here, "tutor.js"));
window.PQ_TUTOR_TESTS = JSON.parse(tests);
require(path.join(here, "tutor-test.js"));
const r = window.PQTutorEvaluate();
const groups = {};
r.results.forEach(o => { const g = groups[o.group] || (groups[o.group] = [0, 0]); g[1]++; if (o.ok) g[0]++; });
console.log(`tests ${r.pass}/${r.total}  ` + Object.entries(groups).map(([g, [a, b]]) => `${g} ${a}/${b}`).join(" · "));
r.results.filter(o => !o.ok).forEach(o => console.log("FAIL", o.said, "\n     ", o.fails.join("; ")));
process.exit(r.pass === r.total ? 0 : 1);
