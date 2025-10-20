/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { app, NativeImage, nativeImage } from "electron";
import { join } from "path";
import { IpcEvents } from "shared/IpcEvents";
import { BADGE_DIR } from "shared/paths";

import { mainWin } from "./mainWindow";
import { dbus, getSessionBus } from "./utils/dbus";

const imgCache = new Map<number, NativeImage>();
function loadBadge(index: number) {
    const cached = imgCache.get(index);
    if (cached) return cached;

    const img = nativeImage.createFromPath(join(BADGE_DIR, `${index}.ico`));
    imgCache.set(index, img);

    return img;
}

let lastBadgeIndex: null | number = -1;
export var lastBadgeCount: number = -1;

export function setBadgeCount(count: number) {
    lastBadgeCount = count;
    switch (process.platform) {
        case "linux":
            if (typeof count !== "number") {
                // sanitize
                throw new Error("count must be a number");
            }

            const sessionBus = getSessionBus();
            sessionBus.connection.message({
                type: dbus.messageType.signal,
                serial: 1,
                path: "/",
                interface: "com.canonical.Unity.LauncherEntry",
                member: "Update",
                signature: "sa{sv}",
                body: [
                    process.env.container === "1"
                        ? "application://io.github.enzomtpyt.pawtop.desktop" // flatpak handling
                        : "application://pawtop.desktop",
                    [
                        ["count", ["x", count === -1 ? 0 : count]],
                        ["count-visible", ["b", count > 0]]
                    ]
                ]
            });
            break;
        case "darwin":
            if (count === 0) {
                app.dock!.setBadge("");
                break;
            }
            app.dock!.setBadge(count === -1 ? "•" : count.toString());
            break;
        case "win32":
            const [index, description] = getBadgeIndexAndDescription(count);
            if (lastBadgeIndex === index) break;

            lastBadgeIndex = index;

            // circular import shenanigans
            const { mainWin } = require("./mainWindow") as typeof import("./mainWindow");
            mainWin.setOverlayIcon(index === null ? null : loadBadge(index), description);
            break;
    }

    mainWin.webContents.send(IpcEvents.SET_CURRENT_VOICE_TRAY_ICON);
}

function getBadgeIndexAndDescription(count: number): [number | null, string] {
    if (count === -1) return [11, "Unread Messages"];
    if (count === 0) return [null, "No Notifications"];

    const index = Math.max(1, Math.min(count, 10));
    return [index, `${index} Notification`];
}
