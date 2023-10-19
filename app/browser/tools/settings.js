let _Settings_config = new WeakMap();
class Settings {
	/**
	 * @param {object} config
	 */
	init(config) {
		_Settings_config.set(this, config);
	}

	/**
	 * @type {object}
	 */
	get config() {
		return _Settings_config.get(this);
	}
}


module.exports = new Settings();