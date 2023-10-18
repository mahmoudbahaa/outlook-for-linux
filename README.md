# outlook-for-linux

This is an unofficial Microsoft Outlook client.

Please report bugs and questions in the issues section. We will attend them as soon as possible.

PRs and suggestions are welcomed. We will continue to support the community.

---

[![Gitter chat](https://badges.gitter.im/ismaelmartinez/outlook-for-linux.png)](https://gitter.im/outlook-for-linux/community "Gitter chat")
![](https://img.shields.io/github/release/mahmoudbahaa/outlook-for-linux.svg?style=flat)
![](https://img.shields.io/github/downloads/mahmoudbahaa/outlook-for-linux/total.svg?style=flat)
![Build & Release](https://github.com/mahmoudbahaa/outlook-for-linux/workflows/Build%20&%20Release/badge.svg)
![](https://img.shields.io/librariesio/github/mahmoudbahaa/outlook-for-linux)
[![Known Vulnerabilities](https://snyk.io//test/github/mahmoudbahaa/outlook-for-linux/badge.svg?targetFile=package.json)](https://snyk.io//test/github/mahmoudbahaa/outlook-for-linux?targetFile=package.json)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/826059bbf59d45148c46e440579fc221)](https://app.codacy.com/gh/mahmoudbahaa/outlook-for-linux/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![outlook-for-linux](https://snapcraft.io/outlook-for-linux/badge.svg)](https://snapcraft.io/outlook-for-linux)

Unofficial Microsoft Outlook client for Linux using [`Electron`](https://electronjs.org/).
It uses the Web App and wraps it as a standalone application using Electron.

## Downloads

Binaries available under [releases](https://github.com/mahmoudbahaa/outlook-for-linux/releases) for `AppImage`, `rpm`, `deb`, `snap`, and `tar.gz`.

In the case of `AppImage`, we recommend using [`AppImageLauncher`](https://github.com/TheAssassin/AppImageLauncher) for the best desktop experience.

[//]: # (We have a dedicated deb and rpm repo at https://outlookforlinux.de hosted with :heart: by [Nils Büchner]&#40;https://github.com/nbuechner&#41;. Please follow the installation instructions below.)

[//]: # ()
[//]: # (### Debian/Ubuntu and other derivatives)

[//]: # (```bash)

[//]: # (sudo wget -qO /etc/apt/keyrings/outlook-for-linux.asc https://repo.outlookforlinux.de/outlook-for-linux.asc)

[//]: # ()
[//]: # (echo "deb [signed-by=/etc/apt/keyrings/outlook-for-linux.asc arch=$&#40;dpkg --print-architecture&#41;] https://repo.outlookforlinux.de/debian/ stable main" | sudo tee /etc/apt/sources.list.d/outlook-for-linux-packages.list)

[//]: # ()
[//]: # (sudo apt update && sudo apt install outlook-for-linux)

[//]: # (```)

[//]: # (### RHEL/Fedora and other derivatives)

[//]: # (```bash)

[//]: # (curl -1sLf -o /tmp/outlook-for-linux.asc https://repo.outlookforlinux.de/outlook-for-linux.asc; rpm --import /tmp/outlook-for-linux.asc; rm -f /tmp/outlook-for-linux.asc)

[//]: # ()
[//]: # (curl -1sLf -o /etc/yum.repos.d/outlook-for-linux.repo https://repo.outlookforlinux.de/rpm/outlook-for-linux.repo)

[//]: # ()
[//]: # (sudo yum update && sudo yum install outlook-for-linux)

[//]: # (```)

[//]: # ()
[//]: # (Also available in:)

[//]: # ()
[//]: # ([![AUR: outlook-for-linux]&#40;https://img.shields.io/badge/AUR-outlook--for--linux-blue.svg&#41;]&#40;https://aur.archlinux.org/packages/outlook-for-linux&#41;)

[//]: # ()
[//]: # ([![Pacstall: outlook-for-linux-deb]&#40;https://img.shields.io/badge/Pacstall-outlook--for--linux--deb-00958C&#41;]&#40;https://github.com/pacstall/pacstall-programs/tree/master/packages/outlook-for-linux-deb&#41;)


[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/outlook-for-linux)

[//]: # ()
[//]: # (<a href='https://flathub.org/apps/details/com.github.IsmaelMartinez.outlook_for_linux'><img width='170' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.png'/></a>)

## Starting arguments

Check in the config [`README.md`](app/config/README.md) in the config folder.

## Contributing

Please refer to the [`CONTRIBUTING.md`](CONTRIBUTING.md) file for more information about how to run this application from source, and/or how to contribute.

## Known issues

Known issues and workarounds can be found in the [`KNOWN_ISSUES.md`](KNOWN_ISSUES.md) file.

## History

Read about the history of this project in the [`HISTORY.md`](HISTORY.md) file.

## License

License: [`GPLv3`](LICENSE.md)
