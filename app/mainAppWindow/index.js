require('@electron/remote/main').initialize();
const { shell, BrowserWindow, app, session, nativeTheme, dialog } = require('electron');
const isDarkMode = nativeTheme.shouldUseDarkColors;
const windowStateKeeper = require('electron-window-state');
const path = require('path');
const login = require('../login');
const Menus = require('../menus');
const { LucidLog } = require('lucid-log');
const exec = require('child_process').exec;
const TrayIconChooser = require('../browser/tools/trayIconChooser');
// eslint-disable-next-line no-unused-vars
const { AppConfiguration } = require('../appConfiguration');
const connMgr =  require('../connectionManager');

/**
 * @type {TrayIconChooser}
 */
let iconChooser;

let isControlPressed = false;

/**
 * @type {LucidLog}
 */
let logger;

let aboutBlankRequestCount = 0;
let config;

/**
 * @type {BrowserWindow}
 */
let window = null;

/**
 * @param {AppConfiguration} mainConfig 
 */
exports.onAppReady = async function onAppReady(mainConfig) {
	config = mainConfig.startupConfig;
	iconChooser = new TrayIconChooser(mainConfig.startupConfig);
	logger = new LucidLog({
		levels: config.appLogLevels.split(',')
	});

	window = await createWindow();

	new Menus(window, config, iconChooser.getFile());
	addEventHandlers();

	const url = processArgs(process.argv);
	connMgr.start(url,{
		window: window,
		config: config
	});

	applyAppConfiguration(config, window);
};

let allowFurtherRequests = true;

exports.onAppSecondInstance = function onAppSecondInstance(event, args) {
	logger.debug('second-instance started');
	if (window) {
		event.preventDefault();
		const url = processArgs(args);
		if (url && allowFurtherRequests) {
			allowFurtherRequests = false;
			setTimeout(() => { allowFurtherRequests = true; }, 5000);
			window.loadURL(url, { userAgent: config.chromeUserAgent });
		}

		restoreWindow();
	}
};

/**
 * Applies the configuration passed as arguments when executing the app.
 * @param config Configuration object.
 * @param {BrowserWindow} window The browser window.
 */
function applyAppConfiguration(config, window) {
	if (typeof config.clientCertPath !== 'undefined' && config.clientCertPath !== '') {
		app.importCertificate({ certificate: config.clientCertPath, password: config.clientCertPassword }, (result) => {
			logger.info('Loaded certificate: ' + config.clientCertPath + ', result: ' + result);
		});
	}

	window.webContents.setUserAgent(config.chromeUserAgent);

	if (!config.minimized) {
		window.show();
	} else {
		window.hide();
	}

	if (config.webDebug) {
		window.openDevTools();
	}
}

function restoreWindow() {
	// If minimized, restore.
	if (window.isMinimized()) {
		window.restore();
	}

	// If closed to tray, show.
	else if (!window.isVisible()) {
		window.show();
	}

	window.focus();
}

function processArgs(args) {
	var regHttps = /^https:\/\/outlook.microsoft.com\/l\/(meetup-join|channel)\//g;
	var regMS = /^msoutlook:\/l\/(meetup-join|channel)\//g;
	logger.debug('processArgs:', args);
	for (const arg of args) {
		if (regHttps.test(arg)) {
			logger.debug('A url argument received with https protocol');
			window.show();
			return arg;
		}
		if (regMS.test(arg)) {
			logger.debug('A url argument received with msoutlook protocol');
			window.show();
			return config.url + arg.substring(8, arg.length);
		}
	}
}

/**
 * @param {Electron.OnBeforeRequestListenerDetails} details 
 * @param {Electron.CallbackResponse} callback 
 */
function onBeforeRequestHandler(details, callback) {
	// Check if the counter was incremented
	if (aboutBlankRequestCount < 1) {
		// Proceed normally
		callback({});
	} else {
		// Open the request externally
		logger.debug('DEBUG - webRequest to  ' + details.url + ' intercepted!');
		shell.openExternal(details.url);
		// decrement the counter
		aboutBlankRequestCount -= 1;
		callback({ cancel: true });
	}
}

/**
 * @param {Electron.HandlerDetails} details 
 * @returns {{action: 'deny'} | {action: 'allow', outlivesOpener?: boolean, overrideBrowserWindowOptions?: Electron.BrowserWindowConstructorOptions}}
 */
function onNewWindow(details) {
	if (details.url === 'about:blank' || details.url === 'about:blank#blocked') {
		// Increment the counter
		aboutBlankRequestCount += 1;

		logger.debug('DEBUG - captured about:blank');

		return { action: 'deny' };
	}

	return secureOpenLink(details);
}

function onWindowClosed() {
	logger.debug('window closed');
	window = null;
	app.quit();
}

function addEventHandlers() {
	window.webContents.setWindowOpenHandler(onNewWindow);
	window.webContents.session.webRequest.onBeforeRequest({ urls: ['https://*/*'] }, onBeforeRequestHandler);
	login.handleLoginDialogTry(window);
	window.on('closed', onWindowClosed);
	window.webContents.addListener('before-input-event', onBeforeInput);
}

/**
 * @param {Electron.Event} event 
 * @param {Electron.Input} input 
 */
function onBeforeInput(event, input) {
	isControlPressed = input.control;
}

/**
 * @param {Electron.HandlerDetails} details 
 * @returns {{action: 'deny'} | {action: 'allow', outlivesOpener?: boolean, overrideBrowserWindowOptions?: Electron.BrowserWindowConstructorOptions}}
 */
function secureOpenLink(details) {
	logger.debug(`Requesting to open '${details.url}'`);
	const action = getLinkAction();

	if (action === 0) {
		openInBrowser(details);
	}

	/**
	 * @type {{action: 'deny'} | {action: 'allow', outlivesOpener?: boolean, overrideBrowserWindowOptions?: Electron.BrowserWindowConstructorOptions}}
	 */
	const returnValue = action === 1 ? {
		action: 'allow',
		overrideBrowserWindowOptions: {
			modal: true,
			useContentSize: true,
			parent: window
		}
	} : { action: 'deny' };

	if (action === 1) {
		removePopupWindowMenu();
	}

	return returnValue;
}

function openInBrowser(details) {
	if (config.defaultURLHandler.trim() !== '') {
		exec(`${config.defaultURLHandler.trim()} ${details.url}`, openInBrowserErrorHandler);
	} else {
		shell.openExternal(details.url);
	}
}

function openInBrowserErrorHandler(error) {
	if (error) {
		logger.error(error.message);
	}
}

function getLinkAction() {
	const action = isControlPressed ? dialog.showMessageBoxSync(window, {
		type: 'warning',
		buttons: ['Allow', 'Deny'],
		title: 'Open URL',
		normalizeAccessKeys: true,
		defaultId: 1,
		cancelId: 1,
		message: 'This will open the URL in the application context. If this is for SSO, click Allow otherwise Deny.'
	}) + 1 : 0;

	isControlPressed = false;
	return action;
}

async function removePopupWindowMenu() {
	for (var i = 1; i <= 200; i++) {
		await sleep(10);
		const childWindows = window.getChildWindows();
		if (childWindows.length) {
			childWindows[0].removeMenu();
			break;
		}
	}
	return;
}

async function sleep(ms) {
	return await new Promise(r => setTimeout(r, ms));
}

async function createWindow() {
	// Load the previous state with fallback to defaults
	const windowState = windowStateKeeper({
		defaultWidth: 0,
		defaultHeight: 0,
	});

	if (config.clearStorage) {
		const defSession = session.fromPartition(config.partition);
		await defSession.clearStorageData();
	}

	// Create the window
	const window = createNewBrowserWindow(windowState);
	require('@electron/remote/main').enable(window.webContents);

	windowState.manage(window);

	window.eval = global.eval = function () { // eslint-disable-line no-eval
		throw new Error('Sorry, this app does not support window.eval().');
	};

	return window;
}

function createNewBrowserWindow(windowState) {
	return new BrowserWindow({
		title:'Outlook for Linux',
		x: windowState.x,
		y: windowState.y,

		width: windowState.width,
		height: windowState.height,
		backgroundColor: isDarkMode ? '#302a75' : '#fff',

		show: false,
		autoHideMenuBar: config.menubar == 'auto',
		icon: iconChooser.getFile(),

		webPreferences: {
			partition: config.partition,
			preload: path.join(__dirname, '..', 'browser', 'index.js'),
			plugins: true,
			contextIsolation: false,
			sandbox: false,
			spellcheck: false
		},
	});
}
