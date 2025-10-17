/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BrowserWindow } from "electron";
import { join } from "path";
import { SplashProps } from "shared/browserWinProperties";
import { VIEW_DIR } from "shared/paths";

import { DATA_DIR } from "./constants";
import { Settings } from "./settings";
import { fileExistsAsync } from "./utils/fileExists";

let splash: BrowserWindow | undefined;

export async function createSplashWindow(startMinimized = false) {
    splash = new BrowserWindow({
        ...SplashProps,
        show: !startMinimized,
        webPreferences: {
            preload: join(__dirname, "splashPreload.js")
        }
    });

    splash.loadFile(join(VIEW_DIR, "splash.html"));

    const { splashBackground, splashColor, splashTheming } = Settings.store;

    if (splashTheming !== false) {
        if (splashColor) {
            const semiTransparentSplashColor = splashColor.replace("rgb(", "rgba(").replace(")", ", 0.2)");

            splash.webContents.insertCSS(`body { --fg: ${splashColor} !important }`);
            splash.webContents.insertCSS(`body { --fg-semi-trans: ${semiTransparentSplashColor} !important }`);
        }

        if (splashBackground) {
            splash.webContents.insertCSS(`body { --bg: ${splashBackground} !important }`);
        }
    }

    const customSplashPath = join(DATA_DIR, "userAssets", "splash");
    const hasCustomSplash = await fileExistsAsync(customSplashPath);

    if (!hasCustomSplash) {
        splash.webContents.insertCSS(`
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(-360deg); }
            }

            img {
                animation: spin 2s linear infinite;
            }
        `);
    }

    return splash;
}

export function updateSplashMessage(message: string) {
    if (splash && !splash.isDestroyed()) splash.webContents.send("update-splash-message", message);
}
