# Pawtop [<img src="/static/icon.png" width="225" align="right" alt="Pawtop">](https://github.com/enzomtpYT/Pawtop)

[![PawsomeVencord](https://img.shields.io/badge/PawsomeVencord-grey?style=flat)](https://github.com/enzomtpYT/PawsomeVencord)
[![Tests](https://github.com/enzomtpYT/Pawtop/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/enzomtpYT/Pawtop/actions/workflows/test.yml)
[![Discord](https://img.shields.io/discord/1173279886065029291.svg?color=768AD4&label=Discord&logo=discord&logoColor=white)](https://discord.gg/w9jVtzNx4c)

Pawtop is a fork of [Equibop](https://github.com/Equicord/Equibop).

You can join our [discord server](https://discord.gg/w9jVtzNx4c) for commits, changes, chat or even support.<br></br>

**Main features**:
- PawsomeVencord preinstalled
- Much more lightweight and faster than the official Discord app
- Linux Screenshare with sound & wayland
- Much better privacy, since Discord has no access to your system

**Extra included changes**

- Tray Customization with voice detection and notification badges
- Command-line flags to toggle microphone and deafen status (Linux)
- Custom Arguments from [this PR](https://github.com/Equicord/Equibop/pull/46)
- arRPC-bun with debug logging support https://github.com/Creationsss/arrpc-bun

**Linux Note**:

- You can use the `--toggle-mic` & `--toggle-deafen` flags to toggle your microphone and deafen status from the terminal. These can be bound to keyboard shortcuts at the system level.

**Not fully Supported**:
- Global Keybinds (Windows/macOS - use command-line flags on Linux instead)

## Installing
Check the [Releases](https://github.com/enzomtpYT/Pawtop/releases) page

### Linux

[![Pawtop](https://img.shields.io/badge/AVAILABLE_ON_THE_AUR-333232?style=for-the-badge&logo=arch-linux&logoColor=0F94D2&labelColor=%23171717)](https://aur.archlinux.org/packages?O=0&K=pawtop)

## Building from Source

You need to have the following dependencies installed:
- [Git](https://git-scm.com/downloads)
- [Bun](https://bun.sh)

Packaging will create builds in the dist/ folder

```sh
git clone https://github.com/enzomtpYT/Pawtop
cd Pawtop

# Install Dependencies
bun install

# Either run it without packaging
bun start

# Or package (will build packages for your OS)
bun package

# Or only build the Linux Pacman package
bun package --linux pacman

# Or package to a directory only
bun package:dir
```

## Building LibVesktop from Source

This is a small C++ helper library Pawtop uses on Linux to emit D-Bus events. By default, prebuilt binaries for x64 and arm64 are used.

If you want to build it from source:
1. Install build dependencies:
    - Debian/Ubuntu: `apt install build-essential python3 curl pkg-config libglib2.0-dev`
    - Fedora: `dnf install @c-development @development-tools python3 curl pkgconf-pkg-config glib2-devel`
2. Run `bun buildLibVesktop`
3. From now on, building Pawtop will use your own build
