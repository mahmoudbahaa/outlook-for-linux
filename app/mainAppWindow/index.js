require('@electron/remote/main').initialize();
const { shell, BrowserWindow, app, session, nativeTheme, dialog } = require('electron');
const isDarkMode = nativeTheme.shouldUseDarkColors;
const windowStateKeeper = require('electron-window-state');
const login = require('../login');
const Menus = require('../menus');
const { LucidLog } = require('lucid-log');
const exec = require('child_process').exec;
const TrayIconChooser = require('../browser/tools/trayIconChooser');
// eslint-disable-next-line no-unused-vars
const { AppConfiguration } = require('../appConfiguration');
const connMgr =  require('../connectionManager');
const path = require('path');

/**
 * @type {TrayIconChooser}
 */
let iconChooser;

let isControlPressed = false;

/**
 * @type {LucidLog}
 */
let logger;

let config;

/**
 * @type {Window}
 */
let window = null;

/**
 * @type {AppConfiguration}
 */
let appConfig = null;

/**
 * @param {AppConfiguration} mainConfig 
 */
exports.onAppReady = async function onAppReady(mainConfig) {
	appConfig = mainConfig;
	config = mainConfig.startupConfig;
	iconChooser = new TrayIconChooser(mainConfig.startupConfig);
	logger = new LucidLog({
		levels: config.appLogLevels.split(',')
	});

	window = await createWindow();

	new Menus(window, config, iconChooser.getFile());

	addEventHandlers();

	connMgr.start({
		window: window,
		config: config
	});

	applyAppConfiguration(config, window);
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

/**
 * @param {Electron.HandlerDetails} details 
 * @returns {{action: 'deny'} | {action: 'allow', outlivesOpener?: boolean, overrideBrowserWindowOptions?: Electron.BrowserWindowConstructorOptions}}
 */
function onNewWindow(details) {
	if (details.url === 'about:blank' || details.url === 'about:blank#blocked') {
		logger.debug('DEBUG - captured about:blank');

		return { action: 'deny' };
	}

	return secureOpenLink(details);
}

function onPageTitleUpdated(event, title) {
	window.webContents.send('page-title', title);
}

function onWindowClosed() {
	logger.debug('window closed');
	window = null;
	app.quit();
}

function addEventHandlers() {
	window.on('page-title-updated', onPageTitleUpdated);
	window.webContents.setWindowOpenHandler(onNewWindow);
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
			spellcheck: true
		},
	});
}