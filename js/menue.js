/**
 * Diese Datei erstellt ein passends MenüTemplate
 */

// Electron APIs
const electron = require('electron');
// Eigenes Über-Fenster
const openAboutWindow = require('about-window').default;
// Systemkonfiguration
const config = require( __dirname + '/config.js' );
// ausgewählte Funktionen
const {freigabenDialog, logUserOut, webviewDevtools} = require( __dirname + '/functions.js' );

//Menue erstellen
var menuTemplate = [];

//About vorne (Mac und andere getrennt)
if( process.platform === 'darwin' ){
	menuTemplate.push({
		label: 'KIMB-Notes-Desktop',
		submenu: [
			{
				label: 'Über KIMB-Notes-Desktop',
				click: () => openAboutWindow({
					icon_path: __dirname + '/../assets/icons/png/128x128.png',
					bug_report_url : 'https://github.com/kimbtech/KIMB-Notes-Desktop/issues',
					copyright: 'copyright by KIMB-technologies 2017, distributed under terms of GPLv3',
					homepage: 'https://github.com/kimbtech/KIMB-Notes-Desktop',
					description: 'A desktop application for KIMB-Notes server.',
					license: 'GPL-3.0',
					win_options : electron.screen.getCursorScreenPoint()
				})
			},
			{type: 'separator'},
			{role: 'services', submenu: []},
			{type: 'separator'},
			{role: 'hide'},
			{role: 'hideothers'},
			{role: 'unhide'},
			{type: 'separator'},
			{
				label: 'Freigaben',
				click: () => freigabenDialog()
			},
			{type: 'separator'},
			{
				label: 'Ausloggen',
				click: () => logUserOut()
			},
			{
				label : 'Beenden',
				role: 'quit'
			}
		]
    });
}
else{
	menuTemplate.push({
		label: 'KIMB-Notes-Desktop',
		submenu: [
			{
					label: 'Über KIMB-Notes-Desktop',
						click: () => openAboutWindow({
							icon_path: __dirname + '/../assets/icons/png/128x128.png',
							bug_report_url : 'https://github.com/kimbtech/KIMB-Notes-Desktop/issues',
							copyright: 'copyright by KIMB-technologies 2017, distributed under terms of GPLv3',
							homepage: 'https://github.com/kimbtech/KIMB-Notes-Desktop',
							description: 'A desktop application for KIMB-Notes server.',
							license: 'GPL-3.0',
							win_options : electron.screen.getCursorScreenPoint()
						})
			},
			{type: 'separator'},
			{
				label: 'Freigaben',
				click: () => freigabenDialog()
			},
			{type: 'separator'},
			{
				label: 'Ausloggen',
				click: () => logUserOut()
			},
			{
				label : 'Beenden',
			role: 'quit'
			}
		]
	});
}

//Weiteres Menü (alle OS gleich)
menuTemplate.push({
	label: 'Bearbeiten',
	submenu: [
		{
			label: 'Rückgängig',
			role: 'undo'
		},
		{
			label: 'Wiederholen',
			role: 'redo'
		},
		{type: 'separator'},
		{
			label: 'Ausschneiden',
			role: 'cut'
		},
		{
			label: 'Kopieren',
			role: 'copy'
		},
		{
			label: 'Einfügen',
			role: 'paste'
		}
	]
});

menuTemplate.push({
	label: 'Fenster',
	submenu: [
		{
			label: 'Neu laden',
			role: 'reload'
		},
		{ type: 'separator' },
		{
			label: 'Minimieren',
			role: 'minimize'
		},
		{
			label: 'Schließen',
			role: 'close'
		}
	]
});

//Entwicklungsmenü
if( config.devMode ){
	menuTemplate.push({
		label: 'Entwicklung',
		submenu: [
			{role: 'forcereload'},
			{role: 'toggledevtools'},
			{
				label: 'Toggle Webview Developer Tools',
				click: () => webviewDevtools()
			}
		]
	});
}

// Template ausgeben
module.exports = menuTemplate;