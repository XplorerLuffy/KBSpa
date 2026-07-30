/**
 * Loads the Electron main-process modules with a mocked `electron` API and
 * exercises the pure logic. Catches typos, bad exports and broken wiring that
 * `node --check` cannot see. Not a substitute for running the real app.
 */
const Module = require("node:module");
const path = require("node:path");
const assert = require("node:assert");

const DESKTOP = path.join(__dirname, "..");
const os = require("node:os");
const TMP = path.join(os.tmpdir(), "kbspa-desktop-test");
const calls = [];

function fn(name) {
  return (...args) => {
    calls.push(name);
    return undefined;
  };
}

const listeners = {};

const electronMock = {
  app: {
    getPath: () => TMP,
    getVersion: () => "1.0.0",
    // false, as in any real dev run via `electron .` — the updater module
    // must no-op entirely against this rather than try to load
    // electron-updater, which expects a packaged app-update.yml to exist.
    isPackaged: false,
    requestSingleInstanceLock: () => true,
    quit: fn("app.quit"),
    whenReady: () => ({ then: () => {} }),
    on: (event) => {
      listeners[event] = true;
    },
  },
  BrowserWindow: class {
    constructor(opts) {
      this.opts = opts;
      calls.push("new BrowserWindow");
    }
    on() {}
    once() {}
    loadURL() {}
    loadFile() {}
  },
  Menu: {
    buildFromTemplate: (t) => ({ template: t }),
    setApplicationMenu: fn("Menu.setApplicationMenu"),
  },
  Tray: class {
    constructor() {}
    setToolTip() {}
    setContextMenu() {}
    on() {}
    isDestroyed() {
      return false;
    }
    destroy() {}
  },
  nativeImage: {
    createFromPath: () => ({ resize: () => ({}) }),
  },
  Notification: class {
    static isSupported() {
      return true;
    }
    constructor(o) {
      this.o = o;
    }
    on() {}
    show() {
      calls.push("notification.show");
    }
  },
  shell: { openExternal: fn("shell.openExternal") },
  ipcMain: { on: fn("ipcMain.on") },
  dialog: { showMessageBox: fn("dialog.showMessageBox") },
  screen: { getAllDisplays: () => [{ bounds: { x: 0, y: 0, width: 1920, height: 1080 } }] },
  contextBridge: { exposeInMainWorld: fn("contextBridge.expose") },
  ipcRenderer: { send: fn("ipcRenderer.send") },
};

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === "electron") return "electron-mock";
  return origResolve.call(this, request, ...rest);
};
require.cache["electron-mock"] = { id: "electron-mock", filename: "electron-mock", loaded: true, exports: electronMock };

let failures = 0;
const pending = [];
function check(name, run) {
  try {
    const result = run();
    if (result && typeof result.then === "function") {
      pending.push(
        result.then(
          () => console.log(`  PASS  ${name}`),
          (err) => {
            failures++;
            console.log(`  FAIL  ${name}\n        ${err.message}`);
          },
        ),
      );
      return;
    }
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL  ${name}\n        ${err.message}`);
  }
}

console.log("\nconfig.js");
const config = require(path.join(DESKTOP, "src/config.js"));
check("derives admin/login URLs", () => {
  assert.ok(config.adminUrl.endsWith("/admin"));
  assert.ok(config.loginUrl.endsWith("/login"));
});
check("parses Supabase project ref from URL", () => {
  assert.strictEqual(config.supabaseProjectRef, "xujnlmyphzaxqdlohvjx");
});
check("allowedOrigin has no trailing path", () => {
  assert.strictEqual(config.allowedOrigin, "https://kb-spa-mkzq.vercel.app");
});
check("exposes navigable sections", () => {
  assert.ok(config.sections.length > 0);
  config.sections.forEach((s) => assert.ok(s.path.startsWith("/admin")));
});
check("isAdminPath allows admin and the auth screens needed to reach it", () => {
  assert.ok(config.isAdminPath("/admin"));
  assert.ok(config.isAdminPath("/admin/bookings"));
  assert.ok(config.isAdminPath("/admin/services/123/edit"));
  assert.ok(config.isAdminPath("/login"));
  assert.ok(config.isAdminPath("/signup"));
  assert.ok(config.isAdminPath("/forgot-password"));
  assert.ok(config.isAdminPath("/reset-password"));
  assert.ok(config.isAdminPath("/auth/callback"));
});
check("isAdminPath rejects the public site, booking flow and customer account", () => {
  assert.ok(!config.isAdminPath("/"));
  assert.ok(!config.isAdminPath("/services"));
  assert.ok(!config.isAdminPath("/services/deep-tissue-massage-60"));
  assert.ok(!config.isAdminPath("/about"));
  assert.ok(!config.isAdminPath("/gallery"));
  assert.ok(!config.isAdminPath("/booking"));
  assert.ok(!config.isAdminPath("/account"));
  assert.ok(!config.isAdminPath("/account/appointments"));
});
check("isAdminPath does not false-positive on a path merely prefixed by an admin one", () => {
  // "/admins-r-us" starts with "/admin" as a raw string but is not under it.
  assert.ok(!config.isAdminPath("/admins-r-us"));
  assert.ok(!config.isAdminPath("/logins"));
});

console.log("\nsession.js — cookie decoding");
const session = require(path.join(DESKTOP, "src/session.js"));
const REF = "xujnlmyphzaxqdlohvjx";
const fakeSession = (cookies) => ({ cookies: { get: async () => cookies } });

check("returns null when signed out (no cookies)", async () => {
  const token = await session.readAccessToken(fakeSession([]));
  assert.strictEqual(token, null);
});

check("reads a plain JSON session cookie", async () => {
  const value = JSON.stringify({ access_token: "tok_plain" });
  const token = await session.readAccessToken(
    fakeSession([{ name: `sb-${REF}-auth-token`, value }]),
  );
  assert.strictEqual(token, "tok_plain");
});

check("reads a base64- prefixed cookie", async () => {
  const raw = Buffer.from(JSON.stringify({ access_token: "tok_b64" })).toString("base64");
  const token = await session.readAccessToken(
    fakeSession([{ name: `sb-${REF}-auth-token`, value: `base64-${raw}` }]),
  );
  assert.strictEqual(token, "tok_b64");
});

check("reassembles chunked cookies in index order", async () => {
  const full = JSON.stringify({ access_token: "tok_chunked_value" });
  const mid = Math.floor(full.length / 2);
  // Deliberately supplied out of order to prove sorting works.
  const token = await session.readAccessToken(
    fakeSession([
      { name: `sb-${REF}-auth-token.1`, value: full.slice(mid) },
      { name: `sb-${REF}-auth-token.0`, value: full.slice(0, mid) },
    ]),
  );
  assert.strictEqual(token, "tok_chunked_value");
});

check("handles array-wrapped session payload", async () => {
  const value = JSON.stringify([{ access_token: "tok_arr" }, { id: "user" }]);
  const token = await session.readAccessToken(
    fakeSession([{ name: `sb-${REF}-auth-token`, value }]),
  );
  assert.strictEqual(token, "tok_arr");
});

check("returns null on malformed cookie instead of throwing", async () => {
  const token = await session.readAccessToken(
    fakeSession([{ name: `sb-${REF}-auth-token`, value: "{not json" }]),
  );
  assert.strictEqual(token, null);
});

check("ignores unrelated cookies", async () => {
  const token = await session.readAccessToken(
    fakeSession([{ name: "some-other-cookie", value: "xyz" }]),
  );
  assert.strictEqual(token, null);
});

console.log("\nwindowState.js");
const ws = require(path.join(DESKTOP, "src/windowState.js"));
check("falls back to defaults when no state file", () => {
  const s = ws.restore();
  assert.strictEqual(typeof s.width, "number");
  assert.strictEqual(typeof s.height, "number");
});
check("strips off-screen coordinates", () => {
  const fs = require("node:fs");
  fs.mkdirSync(TMP, { recursive: true });
  fs.mkdirSync(TMP, { recursive: true });
  fs.writeFileSync(
    path.join(TMP, "window-state.json"),
    JSON.stringify({ x: -9999, y: -9999, width: 800, height: 600 }),
  );
  const s = ws.restore();
  assert.strictEqual(s.x, undefined, "off-screen x should be dropped");
});
check("keeps on-screen coordinates", () => {
  const fs = require("node:fs");
  fs.mkdirSync(TMP, { recursive: true });
  fs.writeFileSync(
    path.join(TMP, "window-state.json"),
    JSON.stringify({ x: 100, y: 100, width: 800, height: 600 }),
  );
  const s = ws.restore();
  assert.strictEqual(s.x, 100);
});

console.log("\ntray.js");
const tray = require(path.join(DESKTOP, "src/tray.js"));
check("creates tray and builds menu without error", () => {
  tray.create({ onShow: () => {}, onOpenSection: () => {} });
  tray.update({ onShow: () => {}, onOpenSection: () => {}, pendingCount: 3 });
  tray.destroy();
});
check("icon file exists at referenced path", () => {
  require("node:fs").accessSync(tray.iconPath());
});

console.log("\nsound.js");
const sound = require(path.join(DESKTOP, "src/sound.js"));
check("exports playNotificationSound", () => {
  assert.strictEqual(typeof sound.playNotificationSound, "function");
});
check("no-ops without throwing off Windows (this test runs on " + process.platform + ")", () => {
  // Real PowerShell spawning only happens on win32; everywhere else this
  // must be an immediate, silent no-op rather than attempting to spawn
  // anything.
  sound.playNotificationSound();
});

console.log("\nbookingWatcher.js");
const watcher = require(path.join(DESKTOP, "src/bookingWatcher.js"));
check("exports start/stop", () => {
  assert.strictEqual(typeof watcher.start, "function");
  assert.strictEqual(typeof watcher.stop, "function");
});
check("signed-out session reports zero pending and does not throw", async () => {
  let reported = null;
  watcher.start({
    electronSession: fakeSession([]),
    onPendingCount: (n) => {
      reported = n;
    },
    onOpenSection: () => {},
  });
  await new Promise((r) => setTimeout(r, 50));
  watcher.stop();
  assert.strictEqual(reported, 0);
});

console.log("\npreload.js");
check("exposes the kbspa bridge", () => {
  require(path.join(DESKTOP, "src/preload.js"));
  assert.ok(calls.includes("contextBridge.expose"));
});

console.log("\nupdater.js");
const updater = require(path.join(DESKTOP, "src/updater.js"));
check("exports start/stop/checkForUpdates/isUpdateDownloaded", () => {
  assert.strictEqual(typeof updater.start, "function");
  assert.strictEqual(typeof updater.stop, "function");
  assert.strictEqual(typeof updater.checkForUpdates, "function");
  assert.strictEqual(typeof updater.isUpdateDownloaded, "function");
});
check("no-ops against a dev (unpackaged) build instead of requiring electron-updater", () => {
  // electron-updater is never mocked, so if start() tried to load it here
  // against our fake `electron` module, this would throw.
  updater.start();
  assert.strictEqual(updater.isUpdateDownloaded(), false);
});
check("checkForUpdates and stop are safe no-ops before/without start", () => {
  updater.checkForUpdates();
  updater.stop();
});

Promise.all(pending).then(() => setTimeout(() => {
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " FAILURE(S)"}\n`);
  process.exit(failures === 0 ? 0 : 1);
}, 300));
