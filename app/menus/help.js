const {shell} = require('electron');

exports = module.exports = (app) => ({
	label: 'Help',
	submenu: [
		{
			label: 'Online Documentation',
			click: () => shell.openExternal('https://support.office.com/en-us/outlook?omkt=en-001'),
		},
		{
			label: 'Github Project',
			click: () => shell.openExternal('https://github.com/mahmoudbahaa/outlook-for-linux'),
		},
		{type: 'separator'},
		{
			label: `Version ${app.getVersion()}`,
			enabled: false,
		},
		{role: 'toggledevtools'},
	],
});
