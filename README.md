# Equibop

Equibop is a custom Discord desktop app

**Main features**:
- Equicord preinstalled
- Much more lightweight and faster than the official Discord app
- Linux Screenshare with sound & wayland
- Much better privacy, since Discord has no access to your system

## Installing

Check the [Releases](https://github.com/Equicord/Equibop/releases) page


## Building from Source

You need to have the following dependencies installed:
- [Git](https://git-scm.com/downloads)
- [Bun](https://bun.sh)

Packaging will create builds in the dist/ folder

```sh
git clone https://github.com/Equicord/Equibop
cd Equibop

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

This is a small C++ helper library Equibop uses on Linux to emit D-Bus events. By default, prebuilt binaries for x64 and arm64 are used.

If you want to build it from source:
1. Install build dependencies:
    - Debian/Ubuntu: `apt install build-essential python3 curl pkg-config libglib2.0-dev`
    - Fedora: `dnf install @c-development @development-tools python3 curl pkgconf-pkg-config glib2-devel`
2. Run `bun buildLibVesktop`
3. From now on, building Equibop will use your own build