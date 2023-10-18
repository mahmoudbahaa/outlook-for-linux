const yargs = require('yargs');
const path = require('path');
const { LucidLog } = require('lucid-log');

let logger;

function getConfigFile(configPath) {
	try {
		return require(path.join(configPath, 'config.json'));
	} catch (e) {
		return null;
	}
}

function argv(configPath) {
	let configFile = getConfigFile(configPath);
	const missingConfig = configFile == null;
	configFile = configFile || {};
	let config = yargs
		.env(true)
		.config(configFile)
		.options({
			appActiveCheckInterval: {
				default: 2,
				describe: 'A numeric value in seconds as poll interval to check if the system is active from being idle',
				type: 'number'
			},
			appIcon: {
				default: '',
				describe: 'Outlook app icon to show in the tray',
				type: 'string'
			},
			appIconType: {
				default: 'default',
				describe: 'Type of tray icon to be used',
				type: 'string',
				choices: ['default', 'light', 'dark']
			},
			appIdleTimeout: {
				default: 300,
				describe: 'A numeric value in seconds as duration before app considers the system as idle',
				type: 'number'
			},
			appIdleTimeoutCheckInterval: {
				default: 10,
				describe: 'A numeric value in seconds as poll interval to check if the appIdleTimeout is reached',
				type: 'number'
			},
			appLogLevels: {
				default: 'error,warn',
				describe: 'Comma separated list of log levels (error,warn,info,debug)',
				type: 'string'
			},
			appTitle: {
				default: 'Microsoft Outlook',
				describe: 'A text to be suffixed with page title',
				type: 'string'
			},
			authServerWhitelist: {
				default: '*',
				describe: 'Set auth-server-whitelist value',
				type: 'string'
			},
			bypassWaylandSourceSelection: {
				default: false,
				describe: 'A flag indicates whether to bypass wayland source selection dialog when screen a share request is received',
				type: 'boolean'
			},
			chromeUserAgent: {
				default: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} Safari/537.36`,
				describe: 'Google Chrome User Agent',
				type: 'string'
			},
			customCACertsFingerprints: {
				default: [],
				describe: 'Array of custom CA Certs Fingerprints to allow SSL unrecognized signer or self signed certificate',
				type: 'array'
			},
			customCSSName: {
				default: '',
				describe: 'custom CSS name for the packaged available css files. Currently those are: "compactDark", "compactLight", "tweaks", "condensedDark" and "condensedLight" ',
				type: 'string'
			},
			customCSSLocation: {
				default: '',
				describe: 'custom CSS styles file location',
				type: 'string'
			},
			customUserDir: {
				default: null,
				describe: 'Custom User Directory so that you can have multiple profiles',
				type: 'string'
			},
			clearStorage: {
				default: false,
				describe: 'Whether to clear the storage before creating the window or not',
				type: 'boolean'
			},
			clientCertPath: {
				default: '',
				describe: 'Custom Client Certs for corporate authentication (certificate must be in pkcs12 format)',
				type: 'string'
			},
			clientCertPassword: {
				default: '',
				describe: 'Custom Client Certs password for corporate authentication (certificate must be in pkcs12 format)',
				type: 'string'
			},
			closeAppOnCross: {
				default: false,
				describe: 'Close the app when clicking the close (X) cross',
				type: 'boolean'
			},
			defaultURLHandler: {
				default: '',
				describe: 'Default application to be used to open the HTTP URLs',
				type: 'string'
			},	 
			disableAutogain: {
				default: false,
				describe: 'A flag indicates whether to disable mic auto gain or not',
				type: 'boolean'
			},
			disableMeetingNotifications: {
				default: false,
				describe: 'Whether to disable meeting notifications or not',
				type: 'boolean'
			},
			disableNotifications: {
				default: false,
				describe: 'A flag to disable all notifications',
				type: 'boolean'
			},
			disableNotificationSound: {
				default: false,
				describe: 'Disable chat/meeting start notification sound',
				type: 'boolean'
			},
			disableNotificationSoundIfNotAvailable: {
				default: false,
				describe: 'Disables notification sound unless status is Available (e.g. while in a call, busy, etc.)',
				type: 'boolean'
			},
			disableNotificationWindowFlash: {
				default: false,
				describe: 'A flag indicates whether to disable window flashing when there is a notification',
				type: 'boolean'
			},
			partition: {
				default: 'persist:outlook-4-linux',
				describe: 'BrowserWindow webpreferences partition',
				type: 'string'
			},
			proxyServer: {
				default: null,
				describe: 'Proxy Server with format address:port',
				type: 'string'
			},
			menubar: {
				default: 'auto',
				describe: 'A value controls the menu bar behaviour',
				type: 'string',
				choices: ['auto', 'visible', 'hidden']
			},
			minimized: {
				default: false,
				describe: 'Start the application minimized',
				type: 'boolean'
			},
			ntlmV2enabled: {
				default: 'true',
				describe: 'Set enable-ntlm-v2 value',
				type: 'string'
			},
			spellCheckerLanguages: {
				default: [],
				describe: 'Array of languages to use with Electron\'s spell checker (experimental)',
				type: 'array'
			},
			url: {
				default: 'https://outlook.office.com/',
				describe: 'Microsoft Outlook URL',
				type: 'string'
			},
			webDebug: {
				default: false,
				describe: 'Enable debug at start',
				type: 'boolean'
			},
			onlineCheckMethod: {
				default: 'https',
				describe: 'Type of network test for checking online status.',
				type: 'string',
				choices: ['https', 'dns', 'native', 'none']
			}
		})
		.parse(process.argv.slice(1));

	logger = new LucidLog({
		levels: config.appLogLevels.split(',')
	});

	logger.debug('configPath:', configPath);
	if (missingConfig) {
		logger.info('No config file found, using default values');
	}
	logger.debug('configFile:', configFile);

	return config;
}

exports = module.exports = argv;
