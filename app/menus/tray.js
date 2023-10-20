const { Tray, Menu } = require('electron');

class ApplicationTray {
	constructor(window, appMenu, iconPath) {
		this.window = window;
		this.iconPath = iconPath;
		this.appMenu = appMenu;
		this.addTray();
	}

	addTray() {
		this.tray = new Tray(this.iconPath);
		this.tray.setToolTip('Microsoft Outlook');
		this.tray.on('click', () => this.showAndFocusWindow());
		this.tray.setContextMenu(Menu.buildFromTemplate(this.appMenu));
	}

	showAndFocusWindow() {
		this.window.show();
		this.window.focus();
	}

	close() {
		this.tray.destroy();
	}
}
exports = module.exports = ApplicationTray;