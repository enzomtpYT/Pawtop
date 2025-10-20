/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { app } from "electron";
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { stripIndent } from "shared/utils/text";

interface AutoStart {
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
}

function makeAutoStartLinux(): AutoStart {
    const configDir = process.env.XDG_CONFIG_HOME || join(process.env.HOME!, ".config");
    const dir = join(configDir, "autostart");
    const file = join(dir, "pawtop.desktop");

    // IM STUPID
    const legacyName = join(dir, "pawtop.desktop");
    if (existsSync(legacyName)) renameSync(legacyName, file);

    // "Quoting must be done by enclosing the argument between double quotes and escaping the double quote character,
    // backtick character ("`"), dollar sign ("$") and backslash character ("\") by preceding it with an additional backslash character"
    // https://specifications.freedesktop.org/desktop-entry-spec/desktop-entry-spec-latest.html#exec-variables
    const commandLine = process.argv.map(arg => '"' + arg.replace(/["$`\\]/g, "\\$&") + '"').join(" ");

    return {
        isEnabled: () => existsSync(file),
        enable() {
            const desktopFile = stripIndent`
                [Desktop Entry]
                Type=Application
                Name=Pawtop
                Comment=Pawtop autostart script
                Exec=${commandLine}
                StartupNotify=false
                Terminal=false
                Icon=vesktop
            `;

            mkdirSync(dir, { recursive: true });
            writeFileSync(file, desktopFile);
        },
        disable: () => rmSync(file, { force: true })
    };
}

const autoStartWindowsMac: AutoStart = {
    isEnabled: () => app.getLoginItemSettings().openAtLogin,
    enable: () => app.setLoginItemSettings({ openAtLogin: true }),
    disable: () => app.setLoginItemSettings({ openAtLogin: false })
};

export const autoStart = process.platform === "linux" ? makeAutoStartLinux() : autoStartWindowsMac;
