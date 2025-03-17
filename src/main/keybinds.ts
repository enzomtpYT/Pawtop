/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { spawnSync } from "node:child_process";
import { closeSync, constants, existsSync, open, openSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { Socket } from "net";
import { IpcEvents } from "shared/IpcEvents";

import { mainWin } from "./mainWindow";

const xdgRuntimeDir = process.env.XDG_RUNTIME_DIR || process.env.TMP || "/tmp";
export const socketFile = join(xdgRuntimeDir, "vesktop-ipc");
const LOCK_FILE = join(xdgRuntimeDir, "vesktop-ipc.lock");

const Actions = new Set([IpcEvents.TOGGLE_SELF_DEAF, IpcEvents.TOGGLE_SELF_MUTE]);

function createFIFO() {
    if (existsSync(socketFile)) {
        try {
            unlinkSync(socketFile);
        } catch (err) {
            console.error("Failed to remove existing mkfifo file:", err);
            return false;
        }
    }

    try {
        spawnSync("mkfifo", [socketFile]);
    } catch (err) {
        console.error("Failed to create mkfifo while initializing keybinds:", err);
        return false;
    }
    return true;
}

function openFIFO() {
    try {
        open(socketFile, constants.O_RDONLY | constants.O_NONBLOCK, (err, fd) => {
            if (err) {
                console.error("Error opening pipe while initializing keybinds:", err);
                return;
            }

            const pipe = new Socket({ fd });
            pipe.on("data", data => {
                const action = data.toString().trim();
                if (Actions.has(action as IpcEvents)) {
                    mainWin.webContents.send(action);
                }
            });

            pipe.on("end", () => {
                pipe.destroy();
                openFIFO();
            });
        });
    } catch (err) {
        console.error("Can't open socket file.", err);
    }
}

function cleanup() {
    try {
        if (existsSync(socketFile)) {
            unlinkSync(socketFile);
        }
    } catch (err) {
        console.error("Failed to remove mkfifo file:", err);
    }
}

function acquireLock() {
    try {
        const fd = openSync(LOCK_FILE, constants.O_CREAT | constants.O_EXCL | constants.O_RDWR);
        writeFileSync(fd, process.pid.toString());
        closeSync(fd);
        return true;
    } catch (err) {
        return false;
    }
}

export function initKeybinds() {
    if (!acquireLock()) {
        console.log("Another instance holds the lock, skipping keybinds initialization");
        return;
    }

    if (createFIFO()) {
        openFIFO();
    }

    process.on("exit", () => {
        try {
            if (existsSync(LOCK_FILE)) {
                unlinkSync(LOCK_FILE);
            }
        } catch (err) {
            console.error("Failed to remove lock file:", err);
        }
    });
}
