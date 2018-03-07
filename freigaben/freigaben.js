/**
 * Die Hauptdatei des Systems 
 */

// ****
// Komponentenimporte
// ****

// Electron API
const electron = require('electron');

// ****
// Allgemeines Fensterverhalten
// ****

//globale Referenz auf das Febster, damit es nicht vom Garbage Collector gefressen wird
let freigWindow;

function createWindow () {
	// Fenster soll bei Maus geöffnet werden
	var mousePos = electron.screen.getCursorScreenPoint();

	// Hauptfenster erstellen
	freigWindow = new electron.BrowserWindow({
		x: mousePos.x, 
		y: mousePos.y,
		minWidth: 340,
		width: 900,
		height: 700,
		minHeight: 500,
		icon: __dirname + '/../assets/icons/png/64x64.png',
		backgroundColor: '#f5f5f5',
		show: false
	});

	//Haupdatei laden
	freigWindow.loadURL('file://' + __dirname + '/freigaben.html' );

	//Fenster erst zeigen, wenn Inhalt fertig
	freigWindow.once( 'page-title-updated', function() {
		freigWindow.show();
	});
	
	// Fenster geschlossen?
  	freigWindow.on('closed', function () {
		// Fenster kann weg
		freigWindow = null
	});

	//kein Menü
  	electron.Menu.setApplicationMenu(null);
}
createWindow();
