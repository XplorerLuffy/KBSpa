"use strict";

const { contextBridge, ipcRenderer } = require("electron");

/**
 * The only bridge between the page and the main process.
 *
 * Deliberately tiny: the window loads the live admin panel, so anything
 * exposed here is reachable by that page. `retry` is all the offline screen
 * needs, and it takes no arguments — nothing the renderer sends can influence
 * where the app navigates.
 */
contextBridge.exposeInMainWorld("kbspa", {
  retry: () => ipcRenderer.send("kbspa:retry"),
  isDesktop: true,
});
