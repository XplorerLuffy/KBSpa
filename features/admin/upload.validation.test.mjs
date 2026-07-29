/**
 * Tests for admin media upload validation.
 *
 * These guard the server-side checks: the file input's `accept` attribute and
 * the client are not controls, so type, size and destination folder must all be
 * enforced here.
 *
 * Run with:  node features/admin/upload.validation.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.join(here, "upload.validation.ts"), "utf8");

// Transpile with the real compiler rather than stripping types by hand — the
// regex approach breaks on syntax like `as const`.
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

const exports = {};
new Function("exports", "require", outputText)(exports, () => {
  throw new Error("upload.validation must not import anything");
});

const { checkUpload, resolveFolder, buildObjectPath, MAX_UPLOAD_BYTES } = exports;


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

console.log("\nupload validation");

check("accepts a normal PNG and maps the extension", () => {
  const r = checkUpload("image/png", 1024);
  assert.equal(r.ok, true);
  assert.equal(r.extension, "png");
});

check("maps jpeg to a .jpg extension", () => {
  assert.equal(checkUpload("image/jpeg", 1024).extension, "jpg");
});

check("accepts video for the hero background", () => {
  assert.equal(checkUpload("video/mp4", 5_000_000).extension, "mp4");
});

check("rejects a disallowed type", () => {
  const r = checkUpload("application/pdf", 1024);
  assert.equal(r.ok, false);
  assert.match(r.error, /PNG/);
});

check("rejects an executable masquerading by size alone", () => {
  assert.equal(checkUpload("application/x-msdownload", 10).ok, false);
});

check("rejects an empty file", () => {
  const r = checkUpload("image/png", 0);
  assert.equal(r.ok, false);
  assert.match(r.error, /No file/);
});

check("rejects a file over the limit and names the size", () => {
  const r = checkUpload("image/png", MAX_UPLOAD_BYTES + 1);
  assert.equal(r.ok, false);
  assert.match(r.error, /10 MB/);
});

check("accepts a file exactly at the limit", () => {
  assert.equal(checkUpload("image/png", MAX_UPLOAD_BYTES).ok, true);
});

console.log("\nfolder resolution");

check("keeps an allowed folder", () => {
  assert.equal(resolveFolder("staff"), "staff");
  assert.equal(resolveFolder("hero"), "hero");
});

check("falls back for an unknown folder", () => {
  assert.equal(resolveFolder("wherever"), "gallery");
  assert.equal(resolveFolder(undefined), "gallery");
  assert.equal(resolveFolder(null), "gallery");
});

check("cannot be used to escape the bucket prefix", () => {
  // A traversal attempt must not survive into the stored path.
  assert.equal(resolveFolder("../../etc"), "gallery");
  assert.equal(resolveFolder("logo/../../secret"), "gallery");
  const p = buildObjectPath("../../etc", "png");
  assert.ok(!p.includes(".."), `path escaped: ${p}`);
  assert.ok(p.startsWith("gallery/"), p);
});

console.log("\nobject paths");

check("builds a path under the requested folder", () => {
  const p = buildObjectPath("services", "webp");
  assert.match(p, /^services\/[0-9a-f-]{36}\.webp$/);
});

check("generates a unique name per call", () => {
  const a = buildObjectPath("gallery", "png");
  const b = buildObjectPath("gallery", "png");
  assert.notEqual(a, b);
});

console.log(
  failures === 0 ? "\nALL CHECKS PASSED\n" : `\n${failures} FAILURE(S)\n`,
);
process.exit(failures === 0 ? 0 : 1);
