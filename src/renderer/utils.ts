/*
 * SPDX-License-Identifier: GPL-3.0
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 */

export const { localStorage } = window;

export const isFirstRun = (() => {
    const key = "VCD_FIRST_RUN";
    if (localStorage.getItem(key) !== null) return false;
    localStorage.setItem(key, "false");
    return true;
})();

export type NavigatorUAData = {
    platform: string;
    brands: Array<{ brand: string; version: string }>;
    mobile: boolean;
};

export interface NavigatorExtended extends Navigator {
    userAgentData?: NavigatorUAData;
}

const getPlatform = (): string => {
    const navigatorExtended = navigator as NavigatorExtended;

    if (navigatorExtended.userAgentData) {
        return navigatorExtended.userAgentData.platform;
    }

    return navigator.userAgent; // Fallback for older browsers
};

const platform = getPlatform().toLowerCase();

export const isWindows = platform.includes("win");
export const isMac = platform.includes("mac");
export const isLinux = platform.includes("linux");

// console.log("Is Windows?", isWindows);
// console.log("Is Mac?", isMac);
// console.log("Is Linux?", isLinux);
