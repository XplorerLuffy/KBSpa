"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { app, screen } = require("electron");

const FILE = () => path.join(app.getPath("userData"), "window-state.json");

const DEFAULTS = { width: 1440, height: 900, maximized: false };

function read() {
  try {
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(FILE(), "utf8")) };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Drop off-screen positions — a monitor may have been unplugged since last run. */
function isVisibleOnSomeDisplay(state) {
  if (typeof state.x !== "number" || typeof state.y !== "number") return false;
  return screen.getAllDisplays().some(({ bounds }) => {
    return (
      state.x >= bounds.x - 50 &&
      state.y >= bounds.y - 50 &&
      state.x + 100 <= bounds.x + bounds.width &&
      state.y + 100 <= bounds.y + bounds.height
    );
  });
}

function restore() {
  const state = read();
  if (!isVisibleOnSomeDisplay(state)) {
    delete state.x;
    delete state.y;
  }
  return state;
}

/** Persist size/position on move, resize and close. */
function track(win) {
  const save = () => {
    try {
      if (win.isDestroyed()) return;
      const maximized = win.isMaximized();
      // getNormalBounds() reports the pre-maximize size, which is what we want
      // to restore to when the user un-maximizes later.
      const bounds = win.getNormalBounds();
      fs.writeFileSync(FILE(), JSON.stringify({ ...bounds, maximized }));
    } catch {
      // A failed write just means the window opens at the default size.
    }
  };

  let timer = null;
  const debounced = () => {
    clearTimeout(timer);
    timer = setTimeout(save, 400);
  };

  win.on("resize", debounced);
  win.on("move", debounced);
  win.on("close", save);
}

module.exports = { restore, track };
