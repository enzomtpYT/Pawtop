/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BaseText, Button, Heading, Paragraph, TextButton } from "@equicord/types/components";
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
import { Toasts } from "@equicord/types/webpack/common";
import { Settings } from "shared/settings";

import { cl, SettingsComponent } from "./Settings";

export const DeveloperOptionsButton: SettingsComponent = ({ settings }) => {
    return <Button onClick={() => openDeveloperOptionsModal(settings)}>Open Developer Settings</Button>;
};

function openDeveloperOptionsModal(settings: Settings) {
    openModal(props => (
        <ModalRoot {...props} size={ModalSize.MEDIUM}>
            <ModalHeader>
                <BaseText size="lg" weight="semibold" tag="h3" style={{ flexGrow: 1 }}>
                    Pawtop Developer Options
                </BaseText>
                <ModalCloseButton onClick={props.onClose} />
            </ModalHeader>

            <ModalContent>
                <div style={{ padding: "1em 0" }}>
                    <Heading tag="h5">PawsomeVencord Location</Heading>
                    <EquicordLocationPicker settings={settings} />

                    <Heading tag="h5" className={Margins.top16}>
                        Debugging
                    </Heading>
                    <div className={cl("button-grid")}>
                        <Button onClick={() => VesktopNative.debug.launchGpu()}>Open chrome://gpu</Button>
                        <Button onClick={() => VesktopNative.debug.launchWebrtcInternals()}>
                            Open chrome://webrtc-internals
                        </Button>
                    </div>
                </div>
            </ModalContent>
        </ModalRoot>
    ));
}

const EquicordLocationPicker: SettingsComponent = ({ settings }) => {
    const forceUpdate = useForceUpdater();
    const usingCustomEquicordDir = VesktopNative.fileManager.isUsingCustomVencordDir();

    return (
        <>
            <Paragraph>
                PawsomeVencord files are loaded from{" "}
                {usingCustomEquicordDir ? (
                    <TextButton
                        variant="link"
                        onClick={e => {
                            e.preventDefault();
                            VesktopNative.fileManager.showCustomVencordDir();
                        }}
                    >
                        a custom location
                    </TextButton>
                ) : (
                    "the default location"
                )}
            </Paragraph>
            <div className={cl("button-grid")}>
                <Button
                    size={"small"}
                    onClick={async () => {
                        const choice = await VesktopNative.fileManager.selectPawsomeVencordDir();
                        switch (choice) {
                            case "cancelled":
                                break;
                            case "ok":
                                Toasts.show({
                                    message: "PawsomeVencord install changed. Fully restart Pawtop to apply.",
                                    id: Toasts.genId(),
                                    type: Toasts.Type.SUCCESS
                                });
                                break;
                            case "invalid":
                                Toasts.show({
                                    message:
                                        "You did not choose a valid PawsomeVencord install. Make sure you're selecting the dist dir!",
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
                    size={"small"}
                    variant="dangerPrimary"
                    onClick={async () => {
                        await VesktopNative.fileManager.selectPawsomeVencordDir(null);
                        forceUpdate();
                    }}
                >
                    Reset
                </Button>
            </div>
        </>
    );
};
