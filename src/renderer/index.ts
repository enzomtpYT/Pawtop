/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./themedSplash";
import "./ipcCommands";
import "./appBadge";
import "./patches";
import "./fixes";
import "./arrpc";

export * as Components from "./components";
import { findByPropsLazy, onceReady } from "@vencord/types/webpack";
import { Alerts } from "@vencord/types/webpack/common";

import SettingsUi from "./components/settings/Settings";
import { VesktopLogger } from "./logger";
import { Settings } from "./settings";
export { Settings };

import type SettingsPlugin from "@vencord/types/plugins/_core/settings";

VesktopLogger.log("Equibop v" + VesktopNative.app.getVersion());

const customSettingsSections = (Vencord.Plugins.plugins.Settings as any as typeof SettingsPlugin).customSections;

customSettingsSections.push(() => ({
    section: "Equibop",
    label: "Equibop Settings",
    element: SettingsUi,
    className: "vc-vesktop-settings"
}));

const VoiceActions = findByPropsLazy("toggleSelfMute");
VesktopNative.voice.onToggleSelfMute(() => VoiceActions.toggleSelfMute());
VesktopNative.voice.onToggleSelfDeaf(() => VoiceActions.toggleSelfDeaf());

// TODO: remove soon
const equicordDir = "equicordDir" as keyof typeof Settings.store;
if (Settings.store[equicordDir]) {
    onceReady.then(() =>
        setTimeout(
            () =>
                Alerts.show({
                    title: "Custom Equicord Location",
                    body: "Due to security hardening changes in Equibop, your custom Equicord location had to be reset. Please configure it again in the settings.",
                    onConfirm: () => delete Settings.store[equicordDir]
                }),
            5000
        )
    );
}
