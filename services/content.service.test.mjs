/**
 * Regression tests for the settings double-encoding bug.
 *
 * saveSettings used to JSON.stringify a value that supabase-js would encode
 * again, so each save wrapped the text in another set of quotes. The mangled
 * value was then read back into the admin form, so quotes and backslashes
 * compounded on every save.
 *
 * Run with:  node services/content.service.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

// Extract the pure function without pulling in the Supabase server client
// (which requires Next's request context).
const source = readFileSync(path.join(here, "content.service.ts"), "utf8");
const match = source.match(
  /export function decodeSettingValue[\s\S]*?\n}\n/,
);
assert.ok(match, "decodeSettingValue not found in content.service.ts");
const js = match[0]
  .replace("export function", "return function")
  .replace(/\(raw:\s*unknown\):\s*string/, "(raw)")
  .replace(/const parsed:\s*unknown\s*=/, "const parsed =");
const decodeSettingValue = new Function(js)();

let failures = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL  ${name}\n        ${err.message}`);
  }
};

console.log("\ndecodeSettingValue");

check("passes a normal value through untouched", () => {
  assert.equal(decodeSettingValue("+97577706348"), "+97577706348");
  assert.equal(
    decodeSettingValue("Gelephu Mindfulness city"),
    "Gelephu Mindfulness city",
  );
});

check("unwraps one accidental encoding layer", () => {
  assert.equal(decodeSettingValue('"+97577706348"'), "+97577706348");
});

check("unwraps several compounded layers", () => {
  assert.equal(decodeSettingValue('"\\"\\\\\\"Kuenphen\\\\\\"\\""'), "Kuenphen");
});

check("recovers a URL wrapped in stray escapes", () => {
  assert.equal(
    decodeSettingValue('\\"https://www.facebook.com/share/1DVof9oEEa/\\"'),
    "https://www.facebook.com/share/1DVof9oEEa/",
  );
});

check("keeps inner quotes that are part of the text", () => {
  assert.equal(decodeSettingValue('He said "hi" today'), 'He said "hi" today');
});

check("does not mangle a URL containing '=' padding", () => {
  const url = "https://www.instagram.com/kuenphenbspa?igsh=MXA0N295YTIxcnN2cw==";
  assert.equal(decodeSettingValue(url), url);
  assert.equal(decodeSettingValue(JSON.stringify(url)), url);
});

check("leaves a value the admin typed in quotes alone", () => {
  // Fully-quoted with no escapes is indistinguishable from one bad layer, so
  // it decodes; but quoted text with surrounding words must survive intact.
  assert.equal(decodeSettingValue('Say "ahh" now'), 'Say "ahh" now');
  assert.equal(decodeSettingValue('a "b" c'), 'a "b" c');
});

check("handles empty and nullish input", () => {
  assert.equal(decodeSettingValue(""), "");
  assert.equal(decodeSettingValue('""'), "");
  assert.equal(decodeSettingValue(null), "");
  assert.equal(decodeSettingValue(undefined), "");
});

check("terminates on pathological input", () => {
  const nested = '"'.repeat(40) + "x" + '"'.repeat(40);
  assert.equal(typeof decodeSettingValue(nested), "string");
});

console.log(
  failures === 0 ? "\nALL CHECKS PASSED\n" : `\n${failures} FAILURE(S)\n`,
);
process.exit(failures === 0 ? 0 : 1);
