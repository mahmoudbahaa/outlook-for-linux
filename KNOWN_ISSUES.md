# Known issues

## Oauth services

Some services requires the app to open the windows in electron. An example is github that requires authentication using oauth.

We are defaulting in opening the links in a external browser, but links can be open ina electron windows by using the 'Crl+Click' combination.

## No history

Switching the userAgent with the persistence turn on sometimes have the side effect of "loosing" the channels history. Removing the data under the appropriate config directory should fix the issue.

### Config folder locations

The following is a list of locations depending on your type installation:

| Type of install |                                    Location                                     | Clean-up command |
|:-------------:|:-------------------------------------------------------------------------------:|:-----:|
| Vanilla install |                          `~/.config/outlook-for-linux`                          | `rm -rf ~/.config/outlook-for-linux` |
| snap |          `~/snap/outlook-for-linux/current/.config/outlook-for-linux/`          |  `rm -rf ~/snap/outlook-for-linux/current/.config/outlook-for-linux/` |
| --user installed flatpak | `~/.var/app/com.github.mahmoudbahaa.outlook_for_linux/config/outlook-for-linux` | `rm -rf ~/.var/app/com.github.IsmaelMartinez.outlook_for_linux/config/outlook-for-linux` |
| From source |                              `~/.config/Electron/`                              | `rm -rf ~/.config/Electron/` |

## Spellchecker not working

Details are in issue [#28](https://github.com/IsmaelMartinez/teams-for-linux/issues/28)

In short, node_spellchecker only ships with en_US dictionary.

As a work around, you can enable the use of local dictionaries by installing hunspell and your locale dictionary as indicates in this link [https://github.com/atom/spell-check#debian-ubuntu-and-mint](https://github.com/atom/spell-check#debian-ubuntu-and-mint)

Also check [#154](https://github.com/IsmaelMartinez/teams-for-linux/issues/154) in case you have an issue with the detection of the locale.

## No desktop notifications

Some notifications daemons in linux don't support the implementation that Microsoft implemented in the browser.

## Blank page

Some users have reported a blank page on login (with the title `Microsoft Outlook - initializing`).

The following workarounds tend to solve the issue:

*    Right click on the Microsoft Outlook icon tray and click on Refresh. (Ctrl+R)

If the above doesn't work:

*    Close the application and delete the application cache folder

  *    `.config/outlook-for-linux/Partitions/outlook-4-linux/Application Cache`

  *    for Snap installation, `snap/outlook-for-linux/current/.config/outlook-for-linux/Partitions/outlook-4-linux/Application Cache`.

  *    for flatpack, `~/.var/app/com.github.IsmaelMartinez.outlook_for_linux/config/outlook-for-linux/Partitions/outlook-4-linux/Application\ Cache/`

  >  Check the config locations to find other installations location

Refer to [#171](https://github.com/IsmaelMartinez/teams-for-linux/issues/171) for more info

If when you reload or close the application you get the blank page again, please repeat the second workaround.
