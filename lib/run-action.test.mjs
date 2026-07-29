/**
 * Tests for runAction.
 *
 * An unhandled rejection inside a React transition escapes to the error
 * boundary and replaces the page with the full-screen 500 — losing whatever the
 * user had typed. This wrapper exists so that can never happen, so it must
 * itself never throw.
 *
 * Run with:  node lib/run-action.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.join(here, "run-action.ts"), "utf8");

const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

/** Fresh module instance with stubbed sonner + window per test. */
function load() {
  const toasts = [];
  let reloaded = 0;
  const timers = [];

  const toast = {
    error: (message, opts) => toasts.push({ message, opts }),
    success: (message) => toasts.push({ message }),
  };

  const exports = {};
  const require = (id) => {
    if (id === "sonner") return { toast };
    throw new Error(`unexpected import: ${id}`);
  };

  // The module touches window/setTimeout only on the failure paths.
  globalThis.window = { location: { reload: () => reloaded++ } };
  globalThis.setTimeout = (fn) => {
    timers.push(fn);
    return 0;
  };

  new Function("exports", "require", outputText)(exports, require);
  return {
    runAction: exports.runAction,
    toasts,
    flushTimers: () => timers.forEach((fn) => fn()),
    reloadCount: () => reloaded,
  };
}

let failures = 0;
const check = async (name, fn) => {
  try {
    await fn();
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL  ${name}\n        ${err.message}`);
  }
};

console.log("\nrunAction");

await check("returns the action's result on success", async () => {
  const { runAction, toasts } = load();
  const result = await runAction(async () => ({ ok: true, value: 42 }));
  assert.deepEqual(result, { ok: true, value: 42 });
  assert.equal(toasts.length, 0, "success must not toast");
});

await check("passes through a falsy-but-valid result", async () => {
  const { runAction } = load();
  assert.equal(await runAction(async () => 0), 0);
});

await check("swallows a rejection instead of rethrowing", async () => {
  const { runAction } = load();
  // The whole point: this must not throw, or the page dies.
  const result = await runAction(async () => {
    throw new Error("database exploded");
  });
  assert.equal(result, undefined);
});

await check("reports a generic failure with a Reload action", async () => {
  const { runAction, toasts } = load();
  await runAction(async () => {
    throw new Error("database exploded");
  });
  assert.equal(toasts.length, 1);
  assert.match(toasts[0].message, /went wrong/i);
  assert.equal(typeof toasts[0].opts.action.onClick, "function");
});

await check("does not leak the raw server error to the user", async () => {
  const { runAction, toasts } = load();
  await runAction(async () => {
    throw new Error("column users.secret_token does not exist");
  });
  assert.ok(
    !/secret_token/.test(toasts[0].message),
    "internal error text must not be shown to the user",
  );
});

await check("auto-reloads on a stale-deployment action id", async () => {
  const { runAction, toasts, flushTimers, reloadCount } = load();
  await runAction(async () => {
    throw new Error('Failed to find Server Action "40ae765c". This request…');
  });
  assert.match(toasts[0].message, /updated/i);
  assert.equal(reloadCount(), 0, "should wait so the toast is readable");
  flushTimers();
  assert.equal(reloadCount(), 1);
});

await check("treats a dropped connection as recoverable too", async () => {
  const { runAction, flushTimers, reloadCount } = load();
  await runAction(async () => {
    throw new TypeError("Failed to fetch");
  });
  flushTimers();
  assert.equal(reloadCount(), 1);
});

await check("does not auto-reload on an ordinary error", async () => {
  const { runAction, flushTimers, reloadCount } = load();
  await runAction(async () => {
    throw new Error("validation failed");
  });
  flushTimers();
  assert.equal(reloadCount(), 0, "a reload loop would be worse than the error");
});

await check("handles a non-Error rejection", async () => {
  const { runAction, toasts } = load();
  const result = await runAction(async () => {
    throw "just a string";
  });
  assert.equal(result, undefined);
  assert.equal(toasts.length, 1);
});

console.log(
  failures === 0 ? "\nALL CHECKS PASSED\n" : `\n${failures} FAILURE(S)\n`,
);
process.exit(failures === 0 ? 0 : 1);
