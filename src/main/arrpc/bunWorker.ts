/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Bridge from "arrpc-bun/src/bridge";
import Server from "arrpc-bun/src/server";

(async () => {
    // @ts-ignore
    const server = await new Server();

    server.on("activity", (data: any) => {
        Bridge.send(data);
    });

    console.log("[arRPC-Bun] Server started");

    const shutdown = async () => {
        console.log("[arRPC-Bun] Shutting down...");
        await server.shutdown();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
})();
