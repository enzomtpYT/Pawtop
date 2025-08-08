/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    Margins,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalRoot,
    ModalSize,
    openModal,
    useForceUpdater
} from "@equicord/types/utils";
import { Button, Forms, Text, Toasts } from "@equicord/types/webpack/common";
import { Settings } from "shared/settings";

import { SettingsComponent } from "./Settings";

export const DeveloperOptionsButton: SettingsComponent = ({ settings }) => {
    return <Button onClick={() => openDeveloperOptionsModal(settings)}>Open Developer Settings</Button>;
};
function openDeveloperOptionsModal(settings: Settings) {
    openModal(props => (
        <ModalRoot {...props} size={ModalSize.SMALL}>
            <ModalHeader>
                <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>
                    Equibop Developer Options
                </Text>
                <ModalCloseButton onClick={props.onClose} />
            </ModalHeader>
            <ModalContent>
                <div style={{ padding: "1em 0" }}>
                    <Forms.FormTitle tag="h5">Equicord Location</Forms.FormTitle>
                    <VencordLocationPicker settings={settings} />
                    <Forms.FormTitle tag="h5" className={Margins.top16}>
                        Debugging
                    </Forms.FormTitle>
                    <div className="vcd-settings-button-grid">
                        <Button onClick={() => VesktopNative.debug.launchGpu()}>chrome://gpu</Button>
                        <Button onClick={() => VesktopNative.debug.launchWebrtcInternals()}>
                            chrome://webrtc-internals
                        </Button>
                    </div>
                </div>
            </ModalContent>
        </ModalRoot>
    ));
}
const VencordLocationPicker: SettingsComponent = ({ settings }) => {
    const forceUpdate = useForceUpdater();
    const equicordDir = VesktopNative.fileManager.getEquicordDir();

    return (
        <>
            <Forms.FormText>
                Equicord files are loaded from{" "}
                {equicordDir ? (
                    <a
                        href="about:blank"
                        onClick={e => {
                            e.preventDefault();
                            VesktopNative.fileManager.showItemInFolder(equicordDir!);
                        }}
                    >
                        {equicordDir}
                    </a>
                ) : (
                    "the default location"
                )}
            </Forms.FormText>
            <div className="vcd-settings-button-grid">
                <Button
                    size={Button.Sizes.SMALL}
                    onClick={async () => {
                        const choice = await VesktopNative.fileManager.selectEquicordDir();
                        switch (choice) {
                            case "cancelled":
                                break;
                            case "ok":
                                Toasts.show({
                                    message: "Equicord install changed. Fully restart Equibop to apply.",
                                    id: Toasts.genId(),
                                    type: Toasts.Type.SUCCESS
                                });
                                break;
                            case "invalid":
                                Toasts.show({
                                    message:
                                        "You did not choose a valid Equicord install. Make sure you're selecting the dist dir!",
                                    id: Toasts.genId(),
                                    type: Toasts.Type.FAILURE
                                });
                                break;
                        }
                        forceUpdate();
                    }}
                >
                    Change
                </Button>
                <Button
                    size={Button.Sizes.SMALL}
                    color={Button.Colors.RED}
                    onClick={async () => {
                        await VesktopNative.fileManager.selectEquicordDir(null);
                        forceUpdate();
                    }}
                >
                    Reset
                </Button>
            </div>
        </>
    );
};
