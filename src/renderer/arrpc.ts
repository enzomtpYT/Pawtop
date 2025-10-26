/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Logger } from "@equicord/types/utils";
import { findLazy, findStoreLazy, onceReady } from "@equicord/types/webpack";
import { FluxDispatcher, InviteActions } from "@equicord/types/webpack/common";
import { IpcCommands } from "shared/IpcEvents";

import { onIpcCommand } from "./ipcCommands";
import { Settings } from "./settings";

const logger = new Logger("EquibopRPC", "#5865f2");
const StreamerModeStore = findStoreLazy("StreamerModeStore");

const ARRPC_PLUGIN_NAME = "WebRichPresence";

function getArRPCPlugin() {
    return Vencord.Plugins.plugins[ARRPC_PLUGIN_NAME] as any;
}

logger.info(`arRPC setting is: ${Settings.store.arRPC}`);
if (Settings.store.arRPC) {
    onceReady.then(() => {
        const plugin = getArRPCPlugin();

        if (plugin && !Vencord.Plugins.isPluginEnabled(ARRPC_PLUGIN_NAME)) {
            logger.info(`Auto-starting ${ARRPC_PLUGIN_NAME} plugin for arRPC...`);
            const result = Vencord.Plugins.startPlugin(plugin);
            logger.info(`Plugin start result: ${result}`);
        }
    });
}

Settings.addChangeListener("arRPC", (enabled: boolean | undefined) => {
    onceReady.then(() => {
        const plugin = getArRPCPlugin();
        if (!plugin) {
            logger.error(`${ARRPC_PLUGIN_NAME} plugin not found!`);
            return;
        }

        if (enabled && !Vencord.Plugins.isPluginEnabled(ARRPC_PLUGIN_NAME)) {
            logger.info(`Starting ${ARRPC_PLUGIN_NAME} plugin...`);
            Vencord.Plugins.startPlugin(plugin);
        } else if (!enabled && Vencord.Plugins.isPluginEnabled(ARRPC_PLUGIN_NAME)) {
            logger.info(`Stopping ${ARRPC_PLUGIN_NAME} plugin...`);
            Vencord.Plugins.stopPlugin(plugin);
        }
    });
});

// handle STREAMERMODE separately from regular RPC activities
VesktopNative.arrpc.onStreamerModeDetected(jsonData => {
    if (!Settings.store.arRPC) return;

    try {
        const data = JSON.parse(jsonData);
        if (data.socketId === "STREAMERMODE" && StreamerModeStore.autoToggle) {
            FluxDispatcher.dispatch({
                type: "STREAMER_MODE_UPDATE",
                key: "enabled",
                value: data.activity?.application_id === "STREAMERMODE"
            });
        }
    } catch (e) {
        logger.error("Failed to handle STREAMERMODE:", e);
    }
});

onIpcCommand(IpcCommands.RPC_ACTIVITY, async jsonData => {
    if (!Settings.store.arRPC) return;

    await onceReady;

    const plugin = getArRPCPlugin();
    if (plugin?.handleEvent) {
        plugin.handleEvent(new MessageEvent("message", { data: jsonData }));
    }
});

onIpcCommand(IpcCommands.RPC_INVITE, async code => {
    const { invite } = await InviteActions.resolveInvite(code, "Desktop Modal");
    if (!invite) return false;

    VesktopNative.win.focus();

    FluxDispatcher.dispatch({
        type: "INVITE_MODAL_OPEN",
        invite,
        code,
        context: "APP"
    });

    return true;
});

const { DEEP_LINK } = findLazy(m => m.DEEP_LINK?.handler);

onIpcCommand(IpcCommands.RPC_DEEP_LINK, async data => {
    logger.debug("Opening deep link:", data);
    try {
        DEEP_LINK.handler({ args: data });
        return true;
    } catch (err) {
        logger.error("Failed to open deep link:", err);
        return false;
    }
});
