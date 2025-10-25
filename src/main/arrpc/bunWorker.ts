/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Bridge from "arrpc-bun/src/bridge";
import Server from "arrpc-bun/src/server";

Bridge.init();

(async () => {
    // @ts-ignore
    const server = await new Server();

    server.on("activity", (data: any) => {
        // dont send STREAMERMODE activities to the bridge
        if (data.activity?.application_id === "STREAMERMODE") {
            return;
        }

        Bridge.send(data);
    });

    const shutdown = async () => {
        console.log("[arRPC-Bun] Shutting down...");
        await server.shutdown();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
})();
