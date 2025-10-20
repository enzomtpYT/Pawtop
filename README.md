# Pawtop [<img src="/static/icon.png" width="225" align="right" alt="Pawtop">](https://github.com/enzomtpYT/Pawtop)

[![PawsomeVencord](https://img.shields.io/badge/PawsomeVencord-grey?style=flat)](https://github.com/enzomtpYT/PawsomeVencord)
[![Tests](https://github.com/enzomtpYT/Pawtop/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/enzomtpYT/Pawtop/actions/workflows/test.yml)
[![Discord](https://img.shields.io/discord/1173279886065029291.svg?color=768AD4&label=Discord&logo=discord&logoColor=white)](https://discord.gg/w9jVtzNx4c)

Pawtop is a fork of [Equibop](https://github.com/Equicord/Equibop).

You can join our [discord server](https://discord.gg/w9jVtzNx4c) for commits, changes, chat or even support.<br></br>

## Main features

- Much more lightweight and faster than the official Discord app
- Linux Screenshare with sound & wayland

**Extra included changes**

- PawsomeVencord preinstalled
- Custom Splash animations from [this PR](https://github.com/Vencord/Vesktop/pull/355)
- Tray Customization & Voice detection and Badge from [this PR](https://github.com/Vencord/Vesktop/pull/517)
- Global Keybind to Toggle voice status from [this PR](https://github.com/Vencord/Vesktop/pull/609)
- Custom Arguments from [this PR](https://github.com/Equicord/Equibop/pull/46)
- Remove (#) title prefix when Notification Badge option is toggled from [this PR](https://github.com/Vencord/Vesktop/pull/686)
- Allow patching video & audio devices into screen share from [this PR](https://github.com/Vencord/Vesktop/pull/195)

**Linux Note**:

- You can use the `--toggle-mic` & `--toggle-deafen` flags to toggle your microphone and deafen status from the terminal.

**Not fully Supported**:
<!-- not supported on windows yet lol -->
- Global Keybinds

## Installing

### Windows

If you don't know the difference, pick the Installer.

- Installer
  - [Universal](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-win.exe)
  - [x64 / amd64](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-win-x64.exe)
  - [Arm® 64](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-win-arm64.exe)
- Portable
  - [x64 / amd64](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-win-x64.zip)
  - [Arm® 64](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-win-arm64.zip)

### Mac

These work on both M Series and Intel Series Macs

- [DMG](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-mac-universal.dmg)
- [ZIP](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-mac-universal.zip)

### Linux

[![Pawtop](https://img.shields.io/badge/AVAILABLE_ON_THE_AUR-333232?style=for-the-badge&logo=arch-linux&logoColor=0F94D2&labelColor=%23171717)](https://aur.archlinux.org/packages?O=0&K=pawtop)
<br>
<a href="https://flathub.org/apps/io.github.enzomtpyt.pawtop">
  <img src="https://flathub.org/api/badge?svg" alt="Download on Flathub" style="width:220px; height:auto;">
</a>

If you don't know the difference, pick amd64.

- amd64 / x86_64
  - [AppImage](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-linux-x86_64.AppImage)
  - [Ubuntu/Debian (.deb)](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-linux-amd64.deb)
  - [Fedora/RHEL (.rpm)](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-linux-x86_64.rpm)
  - [tarball](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-linux-x64.tar.gz)
- Arm® 64 / aarch64
  - [AppImage](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-linux-arm64.AppImage)
  - [Ubuntu/Debian (.deb)](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-linux-arm64.deb)
  - [Fedora/RHEL (.rpm)](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-linux-aarch64.rpm)
  - [tarball](https://github.com/enzomtpYT/Pawtop/releases/latest/download/Pawtop-linux-arm64.tar.gz)

#### Community packages

Below you can find unofficial packages created by the community. They are not officially supported by us, so before reporting issues, please first confirm the issue also happens on official builds. When in doubt, consult with their packager first. The flatpak and AppImage should work on any distro that [supports them](https://flatpak.org/setup/), so I recommend you just use those instead!

- Arch Linux: [Pawtop on the Arch user repository](https://aur.archlinux.org/packages?K=pawtop)
- NixOS: `nix-shell -p pawtop`

## Building from Source

You need to have the following dependencies installed:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download)
- pnpm: `npm install --global pnpm`

Packaging will create builds in the dist/ folder

> [!NOTE]
> On Windows, if you run the test script, you will get test errors about venmic, you can ignore these as it's a linux only module.

```sh
git clone https://github.com/enzomtpYT/Pawtop
cd Pawtop

# Install Dependencies
pnpm i

# Either run it without packaging
pnpm start

# Or package (will build packages for your OS)
pnpm package

# Or only build the Linux Pacman package
pnpm package --linux pacman

# Or package to a directory only
pnpm package:dir
```
