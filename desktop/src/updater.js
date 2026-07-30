"use strict";

const { app, dialog } = require("electron");

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

let intervalHandle = null;
let downloaded = false;
let updater = null;

/**
 * Wraps electron-updater so an installed copy checks GitHub Releases for a
 * newer build and installs it without anyone re-running the installer.
 *
 * electron-updater is required lazily, only once packaged: importing it does
 * real setup work (reading app-update.yml, building an NSIS-specific updater
 * instance) that has nothing to check against for a dev build run via
 * `electron .`, and nothing useful to mock in the smoke tests.
 */
function start() {
  if (!app.isPackaged || updater) return;

  updater = require("electron-updater").autoUpdater;
  updater.autoDownload = true;
  updater.autoInstallOnAppQuit = true;

  updater.on("update-downloaded", (info) => {
    downloaded = true;
    dialog
      .showMessageBox({
        type: "info",
        title: "Update ready",
        message: `Kuenphen Admin ${info.version} is ready to install.`,
        detail:
          "Restart now to finish installing it, or it will install automatically the next time the app closes.",
        buttons: ["Restart now", "Later"],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) updater.quitAndInstall();
      });
  });

  // Best-effort only — offline, or GitHub being unreachable, must never
  // crash or interrupt the app.
  updater.on("error", (err) => {
    console.error("[updater]", err ? err.message : err);
  });

  checkForUpdates();
  intervalHandle = setInterval(checkForUpdates, CHECK_INTERVAL_MS);
}

function checkForUpdates() {
  if (!updater) return;
  updater.checkForUpdates().catch((err) => {
    console.error("[updater] check failed", err && err.message);
  });
}

function stop() {
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = null;
}

function isUpdateDownloaded() {
  return downloaded;
}

module.exports = { start, stop, checkForUpdates, isUpdateDownloaded };
