/**
 * Die Hauptdatei des Systems 
 */

// ****
// Komponentenimporte
// ****

// Electron API
const electron = require('electron');
//	Electron API Links
	const ipc = electron.ipcMain;
	const dialog = electron.dialog;

//Systemkonfiguration
const config = require( __dirname + '/js/config.js' );
//JSON Speicher für Userdaten
const storage = require('electron-json-storage');

// ****
// Allgemeines Fensterverhalten
// ****

//globale Referenz auf das Febster, damit es nicht vom Garbage Collector gefressen wird
let mainWindow;

function createWindow () {
	// Fenster soll bei Maus geöffnet werden
	var mousePos = electron.screen.getCursorScreenPoint();

	// Hauptfenster erstellen
	mainWindow = new electron.BrowserWindow({
		x: mousePos.x, 
		y: mousePos.y,
		minWidth: 340,
		width: 900,
		height: 700,
		minHeight: 500,
		icon: __dirname + '/assets/icons/png/64x64.png',
		backgroundColor: '#f5f5f5',
		show: false
	});

	//Haupdatei laden
	mainWindow.loadURL('file://' + __dirname + '/index.html' );

	//Fenster erst zeigen, wenn Inhalt fertig
	mainWindow.once( 'page-title-updated', function() {
		mainWindow.show();
	});
	
	// Fenster geschlossen?
  	mainWindow.on('closed', function () {
		// Fenster kann weg
		mainWindow = null
	});

	//Menü laden
  	electron.Menu.setApplicationMenu(
		electron.Menu.buildFromTemplate(
			require('./js/menue.js')
		)
	);
}

// Fenster erst erstellen, wenn electron vollständig geladen ist
electron.app.on('ready', createWindow)

// Programm beenden, wenn Fenster geschlossen, außer bei Mac
electron.app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		electron.app.quit();
	}
});

// aus dem Mac OS Dock erwachen lassen
electron.app.on('activate', function () {
	if( mainWindow === null ){
		createWindow();
	}
});

// ****
// Load Functions
// ****

const {askForUserData, saveUserData} = require(__dirname + '/js/functions.js' );

// Messages IPC
ipc.on('reload-window', () => {
	mainWindow.reload();
});
ipc.on('ask-for-user-data', askForUserData);
ipc.on('save-user-data', saveUserData);