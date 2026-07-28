import path from "node:path";
import { Config } from "@remotion/cli/config";

// Reuse the app's existing /public folder (logo.svg etc.) instead of duplicating assets.
Config.setPublicDir(path.join(__dirname, "..", "public"));

// This container has Chromium and ffmpeg pre-installed; point Remotion at them
// instead of letting it download its own copies.
if (process.env.REMOTION_CHROME_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME_EXECUTABLE);
}

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
