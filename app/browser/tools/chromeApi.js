const { ipcRenderer } = require('electron');
// In order to have this functionality working, contextIsolation should be disabled.
// In new versions of electron, contextIsolation is set to true by default.
// We should explicitly set it to false when creating BrowserWindow

var _getDisplayMedia;

function init(config) {
	window.addEventListener('DOMContentLoaded', () => {
		if (process.env.XDG_SESSION_TYPE === 'wayland') {
			_getDisplayMedia = navigator.mediaDevices.getDisplayMedia;
			navigator.mediaDevices.getDisplayMedia = customGetDisplayMediaWayland;
		} else {
			MediaDevices.prototype.getDisplayMedia = customGetDisplayMediaX11;
		}
	});
}

async function customGetDisplayMediaWayland(...args) {
	// Request main process to allow access to screen sharing
	const surface = await ipcRenderer.invoke('select-source-wayland');

	if (surface === 'none') {
		return null;
	}

	args[0].audio = false;
	args[0].video = { displaySurface: surface };

	return await _getDisplayMedia.apply(navigator.mediaDevices, args);
}

function customGetDisplayMediaX11() {
	return new Promise((resolve, reject) => {
		// Request main process to allow access to screen sharing
		ipcRenderer.once('select-source', (event, source) => {
			startStreaming({ source, resolve, reject });
		});
		ipcRenderer.send('select-source');
	});
}

function startStreaming(properties) {
	if (properties.source) {
		navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					chromeMediaSourceId: properties.source.id,
					minWidth: properties.source.screen.width,
					maxWidth: properties.source.screen.width,
					minHeight: properties.source.screen.height,
					maxHeight: properties.source.screen.height
				}
			}
		}).then(stream => {
			properties.resolve(stream);
		}).catch(e => {
			console.log(e.message);
			properties.reject(e.message);
		});
	} else {
		properties.reject('Access denied');
	}
}

module.exports = init;