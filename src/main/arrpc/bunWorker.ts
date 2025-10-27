/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Bridge from "arrpc-bun/src/bridge";
import Server from "arrpc-bun/src/server";

(async () => {
    await Bridge.init();

    const server = await Server.create();

    // get actual bridge port - may be 1337-1347
    const bridgePort = Bridge.getPort() || 1337;
    const bridgeHost = "127.0.0.1";

    process.send?.({
        type: "SERVER_INFO",
        data: {
            port: bridgePort,
            host: bridgeHost
        }
    });

    server.on("activity", (data: any) => {
        if (data.activity?.application_id === "STREAMERMODE") {
            process.send?.({
                type: "STREAMERMODE",
                data: JSON.stringify(data)
            });
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
