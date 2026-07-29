"use strict";

const path = require("node:path");
const { Tray, Menu, nativeImage, app } = require("electron");
const config = require("./config");

let tray = null;

function iconPath() {
  return path.join(__dirname, "..", "build", "icon.png");
}

function build({ onOpenSection, onShow, pendingCount }) {
  const label =
    pendingCount > 0
      ? `${pendingCount} booking${pendingCount === 1 ? "" : "s"} awaiting approval`
      : "No bookings awaiting approval";

  return Menu.buildFromTemplate([
    { label, enabled: false },
    { type: "separator" },
    { label: "Open Kuenphen Admin", click: onShow },
    {
      label: "Go to",
      submenu: config.sections.map((section) => ({
        label: section.label,
        click: () => onOpenSection(section.path),
      })),
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
}

function create(handlers) {
  const image = nativeImage.createFromPath(iconPath());
  // 16px is the conventional Windows tray size; the source is 512px.
  tray = new Tray(image.resize({ width: 16, height: 16 }));
  tray.setToolTip("Kuenphen Beauty Spa — Admin");
  tray.on("click", handlers.onShow);
  update({ ...handlers, pendingCount: 0 });
  return tray;
}

function update(handlers) {
  if (!tray || tray.isDestroyed()) return;
  const { pendingCount = 0 } = handlers;
  tray.setContextMenu(build(handlers));
  tray.setToolTip(
    pendingCount > 0
      ? `Kuenphen Admin — ${pendingCount} awaiting approval`
      : "Kuenphen Beauty Spa — Admin",
  );
}

function destroy() {
  if (tray && !tray.isDestroyed()) tray.destroy();
  tray = null;
}

module.exports = { create, update, destroy, iconPath };
