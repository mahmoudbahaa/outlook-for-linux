let _Settings_config = new WeakMap();
class Settings {
	/**
	 * @param {object} config 
	 * @param {Electron.IpcRenderer} ipcRenderer 
	 */
	init(config, ipcRenderer) {
		_Settings_config.set(this, config);
		ipcRenderer.on('get-outlook-settings', retrieve);
		ipcRenderer.on('set-outlook-settings', restore);
	}

	/**
	 * @type {object}
	 */
	get config() {
		return _Settings_config.get(this);
	}
}

/**
 * @param {Electron.IpcRendererEvent} event 
 */
function retrieve(event) {
	const settings = {};
	event.sender.send('get-outlook-settings', settings);
}

/**
 * @param {Electron.IpcRendererEvent} event 
 * @param {...any} args 
 */
function restore(event, ...args) {
	console.log(args);
	event.sender.send('set-outlook-settings', true);
}

module.exports = new Settings();
