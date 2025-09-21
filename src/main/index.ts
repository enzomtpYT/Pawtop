/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./ipc";

import { app, BrowserWindow, nativeTheme, net, protocol } from "electron";
import { autoUpdater } from "electron-updater";
import { IpcEvents } from "shared/IpcEvents";

import { DATA_DIR } from "./constants";
import { createFirstLaunchTour } from "./firstLaunch";
import { initKeybinds } from "./keybinds";
import { createWindows, mainWin } from "./mainWindow";
import { registerMediaPermissionsHandler } from "./mediaPermissions";
import { registerScreenShareHandler } from "./screenShare";
import { Settings, State } from "./settings";
import { addSplashLog, createSplashWindow } from "./splash";
import { setAsDefaultProtocolClient } from "./utils/setAsDefaultProtocolClient";
import { isDeckGameMode } from "./utils/steamOS";

if (!IS_DEV) {
    autoUpdater.checkForUpdatesAndNotify();
}

console.log("Equibop v" + app.getVersion());

// Make the Vencord files use our DATA_DIR
process.env.EQUICORD_USER_DATA_DIR = DATA_DIR;

const isLinux = process.platform === "linux";

export let enableHardwareAcceleration = true;

function init() {
    setAsDefaultProtocolClient("discord");
    initKeybinds();

    const {
        disableSmoothScroll,
        hardwareAcceleration,
        hardwareVideoAcceleration,
        splashAnimationPath,
        arguments: args
    } = Settings.store;

    const enabledFeatures = new Set(app.commandLine.getSwitchValue("enable-features").split(","));
    const disabledFeatures = new Set(app.commandLine.getSwitchValue("disable-features").split(","));
    app.commandLine.removeSwitch("enable-features");
    app.commandLine.removeSwitch("disable-features");

    if (hardwareAcceleration === false || process.argv.includes("--disable-gpu")) {
        enableHardwareAcceleration = false;
        app.disableHardwareAcceleration();
    } else {
        if (hardwareVideoAcceleration) {
            enabledFeatures.add("AcceleratedVideoEncoder");
            enabledFeatures.add("AcceleratedVideoDecoder");

            if (isLinux) {
                enabledFeatures.add("AcceleratedVideoDecodeLinuxGL");
                enabledFeatures.add("AcceleratedVideoDecodeLinuxZeroCopyGL");
            }
        }
    }

    if (disableSmoothScroll) {
        app.commandLine.appendSwitch("disable-smooth-scrolling");
    }

    // disable renderer backgrounding to prevent the app from unloading when in the background
    // https://github.com/electron/electron/issues/2822
    // https://github.com/GoogleChrome/chrome-launcher/blob/5a27dd574d47a75fec0fb50f7b774ebf8a9791ba/docs/chrome-flags-for-tools.md#task-throttling
    app.commandLine.appendSwitch("disable-renderer-backgrounding");
    app.commandLine.appendSwitch("disable-background-timer-throttling");
    app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
    if (process.platform === "win32") {
        disabledFeatures.add("CalculateNativeWinOcclusion");
    }
    if (args) {
        app.commandLine.appendArgument(args);
        console.log("Running with additional arguments:", args);
    }
    // work around chrome 66 disabling autoplay by default
    app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

    // WinRetrieveSuggestionsOnlyOnDemand: Work around electron 13 bug w/ async spellchecking on Windows.
    // HardwareMediaKeyHandling, MediaSessionService: Prevent Discord from registering as a media service.
    disabledFeatures.add("WinRetrieveSuggestionsOnlyOnDemand");
    disabledFeatures.add("HardwareMediaKeyHandling");
    disabledFeatures.add("MediaSessionService");

    if (isLinux) {
        // Support TTS on Linux using https://wiki.archlinux.org/title/Speech_dispatcher
        app.commandLine.appendSwitch("enable-speech-dispatcher");
    }

    disabledFeatures.forEach(feat => enabledFeatures.delete(feat));

    const enabledFeaturesArray = enabledFeatures.values().filter(Boolean).toArray();
    const disabledFeaturesArray = disabledFeatures.values().filter(Boolean).toArray();

    if (enabledFeaturesArray.length) {
        app.commandLine.appendSwitch("enable-features", enabledFeaturesArray.join(","));
        console.log("Enabled Chromium features:", enabledFeaturesArray.join(", "));
    }

    if (disabledFeaturesArray.length) {
        app.commandLine.appendSwitch("disable-features", disabledFeaturesArray.join(","));
        console.log("Disabled Chromium features:", disabledFeaturesArray.join(", "));
    }

    // In the Flatpak on SteamOS the theme is detected as light, but SteamOS only has a dark mode, so we just override it
    if (isDeckGameMode) nativeTheme.themeSource = "dark";

    app.on("second-instance", (_event, commandLine, _cwd, data: any) => {
        if (data.IS_DEV) app.quit();
        else if (mainWin) {
            const isToggleCommand = commandLine.some(arg => arg === "--toggle-mic" || arg === "--toggle-deafen");
            if (isToggleCommand) {
                const command = commandLine.includes("--toggle-mic")
                    ? IpcEvents.TOGGLE_SELF_MUTE
                    : IpcEvents.TOGGLE_SELF_DEAF;
                mainWin.webContents.send(command);
            } else {
                if (mainWin.isMinimized()) mainWin.restore();
                if (!mainWin.isVisible()) mainWin.show();
                mainWin.focus();
            }
        }
    });

    app.whenReady().then(async () => {
        if (process.platform === "win32") app.setAppUserModelId("io.github.equicord.equibop");

        createSplashWindow();
        addSplashLog();

        registerScreenShareHandler();
        registerMediaPermissionsHandler();
        // register file handler so we can load the custom splash animation from the user's filesystem
        protocol.handle("splash-animation", () => {
            return net.fetch("file:///" + splashAnimationPath);
        });
        addSplashLog();

        bootstrap();

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindows();
            }
        });
    });
}

if (!app.requestSingleInstanceLock({ IS_DEV })) {
    if (IS_DEV) {
        console.log("Equibop is already running. Quitting previous instance...");
        init();
    } else {
        console.log("Equibop is already running. Quitting...");
        app.quit();
    }
} else {
    init();
}

async function bootstrap() {
    if (!Object.hasOwn(State.store, "firstLaunch")) {
        createFirstLaunchTour();
        addSplashLog();
    } else {
        createWindows();
        addSplashLog();
    }
}

// MacOS only event
export let darwinURL: string | undefined;
app.on("open-url", (_, url) => {
    darwinURL = url;
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
