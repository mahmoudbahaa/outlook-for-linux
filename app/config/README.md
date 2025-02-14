# Config

This folder contains the configuration options available for the app.

## Available starting arguments

The application uses [yargs](https://www.npmjs.com/package/yargs) to allow command line arguments.

Here is the list of available arguments and its usage:

| Option | Usage | Default Value |
|:-:|:-:|:-:|
| appIcon | Outlook app icon to show in the tray | |
| appIconType | Type of tray icon to be used default/light/dark | default |
| appLogLevels | Comma separated list of log levels (error,warn,info,debug) | error,warn |
| appTitle |  A text to be suffixed with page title | Microsoft Outlook |
| chromeUserAgent | user agent string for chrome | Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3831.6 Safari/537.36 |
| customCACertsFingerprints | custom CA Certs Fingerprints to allow SSL unrecognized signer or self signed certificate (see below) | [] |
| customUserDir | Custom User Directory so that you can have multiple profiles | |
| clearStorage | Whether to clear the storage before creating the window or not | false |
| clientCertPath clientCertPassword | custom Client Certs for corporate authentication (certificate must be in pkcs12 format) | [] |
| closeAppOnCross | Close the app when clicking the close (X) cross | false |
| config | config file location | ~/.config/outlook-for-linux/config.json |
| defaultURLHandler | Default application to be used to open the HTTP URLs |  |
| disableNotifications | A flag to disable all notifications | false |
| disableNotificationSound | Disable notification sound | false |
| disableNotificationWindowFlash | A flag indicates whether to disable window flashing when there is a notification | false |
| help  | show the available commands | false |
| onlineCheckMethod | Type of network test for checking online status, can be: https, dns, native, none | https |
| partition | [BrowserWindow](https://electronjs.org/docs/api/browser-window) webpreferences partition | persist:outlook-4-linux |
| proxyServer | Proxy Server with format address:port | None |
| menubar | A value controls the menu bar behaviour (auto/visible/hidden) | auto |
| minimized | Start the application minimized | false |
| ntlmV2enabled | set enable-ntlm-v2 value | true |
| url | url to open | [https://outlook.microsoft.com/](https://outlook.microsoft.com/) |
| version | show the version number | false |
| webDebug | Start with the browser developer tools open  |  false |


As an example, to disable the persistence, you can run the following command:

```bash
outlook-for-linux --partition nopersist
```

Alternatively, you can use a file called `config.json` with the configuration options. This file needs to be located in `~/.config/outlook-for-linux/config.json`.
For Snap installations, the file is located in `~/snap/outlook-for-linux/current/.config/outlook-for-linux/config.json`.

[yargs](https://www.npmjs.com/package/yargs) allows for extra modes of configuration. Refer to their documentation if you prefer to use a configuration file instead of arguments.

Example:

```json
{
    "closeAppOnCross": true
}
```

## Getting custom CA Certs fingerprints

Information about how to get the custom CA Certs fingerprints is now available under the [certificate README.md file](../certificate/README.md)

