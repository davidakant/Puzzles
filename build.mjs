// Build: read the readable source (index.src.html), obfuscate the inline JS,
// then minify the whole document, writing the deployed index.html.
import { readFile, writeFile } from 'node:fs/promises';
import { minify } from 'html-minifier-terser';
import JavaScriptObfuscator from 'javascript-obfuscator';

const SRC = 'index.src.html';
const OUT = 'index.html';

const html = await readFile(SRC, 'utf8');

// Extract the single inline <script> block.
const scriptRe = /<script>([\s\S]*?)<\/script>/;
const match = html.match(scriptRe);
if (!match) throw new Error('No inline <script> block found in ' + SRC);

const originalJs = match[1];

// Obfuscate the JS. renameGlobals stays false so any names reachable from
// the DOM (there are none currently, but keep it safe) are preserved.
const obfuscated = JavaScriptObfuscator.obfuscate(originalJs, {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: false,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  splitStrings: false,
  numbersToExpressions: true,
  simplify: true,
  transformObjectKeys: false,
  renameGlobals: false,
  identifierNamesGenerator: 'hexadecimal',
  selfDefending: false,
  disableConsoleOutput: false,
}).getObfuscatedCode();

const withObfuscatedJs = html.replace(
  scriptRe,
  () => '<script>' + obfuscated + '</script>'
);

// Minify HTML + inline CSS. Leave minifyJS off — the JS is already processed.
const out = await minify(withObfuscatedJs, {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: false,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
});

await writeFile(OUT, out, 'utf8');

const kb = (n) => (n / 1024).toFixed(1) + ' KB';
console.log(`Source JS:  ${kb(originalJs.length)}`);
console.log(`Obf. JS:    ${kb(obfuscated.length)}`);
console.log(`Source HTML: ${kb(html.length)}  ->  Output: ${kb(out.length)}`);
