/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChildProcess, spawn } from "child_process";
import { app } from "electron";
import { existsSync } from "fs";
import { join, resolve } from "path";

import { Settings } from "../settings";

function getBundledBunPath(): string {
    const resourcesPath = process.resourcesPath || join(app.getAppPath(), "..");
    const { platform } = process;
    const { arch } = process;

    let bunBinary = "bun";
    if (platform === "win32") bunBinary = "bun.exe";

    const bunPath = join(resourcesPath, "bun", `${platform}-${arch}`, `bun-${platform}-${arch}`, bunBinary);

    if (existsSync(bunPath)) {
        return bunPath;
    }

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
        console.log("[arRPC] Using Bun at:", bunPath);

        bunProcess = spawn(bunPath, [workerPath], {
            stdio: ["ignore", "pipe", "pipe"],
            env: process.env,
            windowsHide: true
        });

        bunProcess.stdout?.on("data", data => {
            console.log("[arRPC >]", data.toString().trim());
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
