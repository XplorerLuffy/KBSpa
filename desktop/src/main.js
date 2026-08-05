"use strict";

const path = require("node:path");
const { app, BrowserWindow, Menu, shell, ipcMain, dialog, session } = require("electron");

const config = require("./config");
const windowState = require("./windowState");
const tray = require("./tray");
const bookingWatcher = require("./bookingWatcher");
const updater = require("./updater");

let mainWindow = null;
let pendingCount = 0;
let quitting = false;

/* Only one copy may run — a second launch focuses the existing window. */
if (!app.requestSingleInstanceLock()) {
  app.quit();
  return;
}

function showWindow() {
  if (!mainWindow) return createWindow();
  if (mainWindow.isMinimized()) mainWindow.restore();
  if (!mainWindow.isVisible()) mainWindow.show();
  mainWindow.focus();
}

function openSection(sectionPath) {
  showWindow();
  if (mainWindow) mainWindow.loadURL(`${config.siteUrl}${sectionPath}`);
}

function loadAdmin() {
  if (mainWindow) mainWindow.loadURL(config.adminUrl);
}

function showOffline() {
  if (mainWindow) mainWindow.loadFile(path.join(__dirname, "offline.html"));
}

function createWindow() {
  const state = windowState.restore();

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: "#faf6ee",
    title: "Kuenphen Beauty Spa — Admin",
    icon: tray.iconPath(),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // The window renders a remote page, so lock it down: no Node in the
      // renderer, isolated context, and OS-level sandbox.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: false,
    },
  });

  windowState.track(mainWindow);
  if (state.maximized) mainWindow.maximize();

  mainWindow.once("ready-to-show", () => mainWindow.show());

  // Keep the app alive in the tray when the window is closed, so background
  // booking alerts keep arriving. Quit is explicit (tray menu / Cmd+Q).
  mainWindow.on("close", (event) => {
    if (quitting) return;
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, _desc, url, isMainFrame) => {
    // -3 is ERR_ABORTED, which fires on ordinary client-side navigations.
    if (isMainFrame && errorCode !== -3 && !url.startsWith("file://")) showOffline();
  });

  /* Anything outside the app's own origin opens in the real browser. */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    let origin;
    try {
      origin = new URL(url).origin;
    } catch {
      event.preventDefault();
      return;
    }
    if (origin !== config.allowedOrigin && !url.startsWith("file://")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Same-origin links (e.g. the login screen's "Back to site") aren't caught
  // by will-navigate at all when Next.js handles them client-side — those are
  // History API pushes, not real navigations, so did-navigate-in-page is what
  // actually sees them. Anything that lands outside /admin (or the auth
  // screens needed to reach it) bounces straight back: this is meant to be
  // an admin-only window, not a second browser onto the public site.
  const snapBackToAdmin = (_event, url) => {
    let pathname;
    try {
      pathname = new URL(url).pathname;
    } catch {
      return;
    }
    if (!config.isAdminPath(pathname)) loadAdmin();
  };
  mainWindow.webContents.on("did-navigate", snapBackToAdmin);
  mainWindow.webContents.on("did-navigate-in-page", snapBackToAdmin);

  loadAdmin();
  return mainWindow;
}

function buildAppMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        { label: "Reload", accelerator: "CmdOrCtrl+R", click: loadAdmin },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Alt+F4",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "Go",
      submenu: config.sections.map((section) => ({
        label: section.label,
        click: () => openSection(section.path),
      })),
    },
    {
      label: "View",
      submenu: [
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
        { role: "toggleDevTools" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Open in browser",
          click: () => shell.openExternal(config.adminUrl),
        },
        { label: "Check for updates", click: () => updater.checkForUpdates() },
        { type: "separator" },
        {
          label: "About",
          click: () =>
            dialog.showMessageBox({
              type: "info",
              title: "Kuenphen Beauty Spa — Admin",
              message: "Kuenphen Beauty Spa — Admin",
              detail: `Version ${app.getVersion()}\n${config.siteUrl}`,
              buttons: ["OK"],
            }),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(async () => {
  // Require a fresh sign-in every time the app is launched, rather than
  // staying signed in indefinitely via the persisted session cookie — this
  // is a shared front-desk machine, not a single admin's personal browser.
  // Only cookies are cleared, and only at cold start: minimising the window,
  // closing to tray, or reloading during the same run leaves the session
  // alone.
  try {
    await session.defaultSession.clearStorageData({ storages: ["cookies"] });
  } catch {
    // Non-fatal — worst case the previous session carries over this launch.
  }

  buildAppMenu();
  createWindow();

  const handlers = { onShow: showWindow, onOpenSection: openSection };
  tray.create(handlers);
  updater.start();

  // Notifications are the reason this is a desktop app rather than a bookmark.
  bookingWatcher.start({
    electronSession: mainWindow.webContents.session,
    onOpenSection: openSection,
    onPendingCount: (count) => {
      pendingCount = count;
      tray.update({ ...handlers, pendingCount });
    },
  });

  app.on("activate", showWindow);
});

app.on("second-instance", showWindow);

app.on("before-quit", () => {
  quitting = true;
  bookingWatcher.stop();
  tray.destroy();
  updater.stop();
});

// The tray keeps the app running after the last window closes.
app.on("window-all-closed", () => {});

ipcMain.on("kbspa:retry", loadAdmin);
