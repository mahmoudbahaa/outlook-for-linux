const { app, Menu, MenuItem, clipboard, dialog, session, ipcMain } = require('electron');
const fs = require('fs'),
	path = require('path');
const application = require('./application');
const preferences = require('./preferences');
const help = require('./help');
const Tray = require('./tray');
const { LucidLog } = require('lucid-log');
const connectionManager = require('../connectionManager');

class Menus {
	constructor(window, config, iconPath) {
		/**
		 * @type {Electron.BrowserWindow}
		 */
		this.window = window;
		this.iconPath = iconPath;
		this.config = config;
		this.allowQuit = false;
		this.logger = new LucidLog({
			levels: config.appLogLevels.split(',')
		});
		this.initialize();
	}

	async quit(clearStorage = false) {
		this.allowQuit = true;

		clearStorage = clearStorage && dialog.showMessageBoxSync(this.window, {
			buttons: ['Yes', 'No'],
			title: 'Quit',
			normalizeAccessKeys: true,
			defaultId: 1,
			cancelId: 1,
			message: 'Are you sure you want to clear the storage before quitting?',
			type: 'question'
		}) === 0;

		if (clearStorage) {
			const defSession = session.fromPartition(this.config.partition);
			await defSession.clearStorageData();
		}

		this.window.close();
	}

	open() {
		if (!this.window.isVisible()) {
			this.window.show();
		}

		this.window.focus();
	}

	about() {
		const appInfo = [];
		appInfo.push(`outlook-for-linux@${app.getVersion()}\n`);
		for (const prop in process.versions) {
			if (prop === 'node' || prop === 'v8' || prop === 'electron' || prop === 'chrome') {
				appInfo.push(`${prop}: ${process.versions[prop]}`);
			}
		}
		dialog.showMessageBoxSync(this.window, {
			buttons: ['OK'],
			title: 'About',
			normalizeAccessKeys: true,
			defaultId: 0,
			cancelId: 0,
			message: appInfo.join('\n'),
			type: 'info'
		});
	}

	reload(show = true) {
		if (show) {
			this.window.show();
		}

		connectionManager.refresh();
	}

	debug() {
		this.window.openDevTools();
	}

	hide() {
		this.window.hide();
	}

	initialize() {
		const appMenu = application(this);

		if (this.config.menubar === 'hidden') {
			this.window.removeMenu();
		} else {
			this.window.setMenu(Menu.buildFromTemplate([
				appMenu,
				preferences(),
				help(app, this.window),
			]));
		}

		this.initializeEventHandlers();

		this.tray = new Tray(this.window, appMenu.submenu, this.iconPath);
	}

	initializeEventHandlers() {
		app.on('before-quit', () => this.onBeforeQuit());
		ipcMain.on('get-outlook-settings', saveSettingsInternal);
		ipcMain.on('set-outlook-settings', restoreSettingsInternal);
		this.window.on('close', (event) => this.onClose(event));
	}

	onBeforeQuit() {
		this.logger.debug('before-quit');
		this.allowQuit = true;
	}

	onClose(event) {
		this.logger.debug('window close');
		if (!this.allowQuit && !this.config.closeAppOnCross) {
			event.preventDefault();
			this.hide();
		} else {
			this.tray.close();
			this.window.webContents.session.flushStorageData();
		}
	}

	saveSettings() {
		this.window.webContents.send('get-outlook-settings');
	}

	restoreSettings() {
		this.window.webContents.send('set-outlook-settings', JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'outlook_settings.json'))));
	}
}

function saveSettingsInternal(event, arg) {
	fs.writeFileSync(path.join(app.getPath('userData'), 'outlook_settings.json'), JSON.stringify(arg));
	dialog.showMessageBoxSync(this.window, {
		message: 'Settings have been saved successfully!',
		title: 'Save settings',
		type: 'info'
	});
}

function restoreSettingsInternal(event, arg) {
	if (arg) {
		dialog.showMessageBoxSync(this.window, {
			message: 'Settings have been restored successfully!',
			title: 'Restore settings',
			type: 'info'
		});
	}
}

exports = module.exports = Menus;
