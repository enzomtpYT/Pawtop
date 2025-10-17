/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

const OriginalWebSocket = window.WebSocket;

window.WebSocket = class PatchedWebSocket extends OriginalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
        const urlString = url.toString();

        if (urlString.includes("127.0.0.1:1337") || urlString.includes("localhost:1337")) {
            const patchedUrl = urlString.replace(":1337", ":6969");
            console.log(`[arRPC Port Patch] Redirecting ${urlString} -> ${patchedUrl}`);
            super(patchedUrl, protocols);
        } else {
            super(url, protocols);
        }
    }
} as typeof WebSocket;
