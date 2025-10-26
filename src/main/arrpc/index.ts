/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChildProcess, spawn } from "child_process";
import { app } from "electron";
import { existsSync } from "fs";
import { join, resolve } from "path";
import { IpcEvents } from "shared/IpcEvents";

import { mainWin } from "../mainWindow";
import { Settings } from "../settings";

interface ArRPCMessage {
    type: "STREAMERMODE";
    data: string;
}

function isArRPCMessage(message: unknown): message is ArRPCMessage {
    return (
        typeof message === "object" &&
        message !== null &&
        "type" in message &&
        message.type === "STREAMERMODE" &&
        "data" in message &&
        typeof message.data === "string"
    );
}

function getBundledBunPath(): string {
    const { platform } = process;
    const { arch } = process;

    let bunBinary = "bun";
    if (platform === "win32") bunBinary = "bun.exe";

    const bunPlatform = platform === "win32" ? "windows" : platform;

    const possiblePaths = [
        // packaged app with resourcesPath
        process.resourcesPath
            ? join(process.resourcesPath, "bun", `${platform}-${arch}`, `bun-${bunPlatform}-${arch}`, bunBinary)
            : null,
        // system Electron (AUR, etc) - app.asar is in the resources directory
        join(app.getAppPath(), "..", "bun", `${platform}-${arch}`, `bun-${bunPlatform}-${arch}`, bunBinary),
        // development or alternative structure
        join(app.getAppPath(), "bun", `${platform}-${arch}`, `bun-${bunPlatform}-${arch}`, bunBinary)
    ].filter(Boolean);

    for (const bunPath of possiblePaths) {
        if (bunPath && existsSync(bunPath)) {
            return bunPath;
        }
    }

    // fallback to system bun
    return "bun";
}

let bunProcess: ChildProcess;

export function destroyArRPC() {
    if (!bunProcess) return;

    bunProcess.kill();
    bunProcess = null as any;
}

export async function restartArRPC() {
    destroyArRPC();
    await new Promise(resolve => setTimeout(resolve, 500));
    await initArRPC();
}

export async function initArRPC() {
    if (!Settings.store.arRPC) {
        destroyArRPC();
        return;
    }

    if (bunProcess) return;

    try {
        // check for unpacked version first (for production builds)
        const workerPath = resolve(__dirname, "./arrpc/bunWorker.js").replace("app.asar", "app.asar.unpacked");
        const bunPath = getBundledBunPath();

        bunProcess = spawn(bunPath, [workerPath], {
            stdio: ["ignore", "pipe", "pipe", "ipc"],
            env: process.env,
            windowsHide: true
        });

        bunProcess.on("message", message => {
            if (isArRPCMessage(message)) {
                mainWin?.webContents.send(IpcEvents.STREAMER_MODE_DETECTED, message.data);
            }
        });

        bunProcess.stdout?.on("data", data => {
            console.log(data.toString().trim());
        });

        bunProcess.stderr?.on("data", data => {
            console.error("[arRPC ! stderr]", data.toString().trim());
        });

        bunProcess.on("error", err => {
            console.error("[arRPC] Failed to start:", err);
        });

        bunProcess.on("exit", code => {
            if (code !== 0 && code !== null) {
                console.error(`[arRPC] Process exited with code ${code}`);
            }
            bunProcess = null as any;
        });
    } catch (e) {
        console.error("Failed to start arRPC server", e);
    }
}

Settings.addChangeListener("arRPC", initArRPC);
