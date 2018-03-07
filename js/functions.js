/**
 * Verschiedene Funktioen für das System
 */

 // Electron
const electron = require('electron');
//	Electron API Links
	const dialog = electron.dialog;
//JSON Speicher für Userdaten
const storage = require('electron-json-storage');

var mainWindow = null;

module.exports = {
	//User Ausloggen, Fenster neu starten, wieder nach Login fragen
	"logUserOut" : function (){
		mainWindow = electron.BrowserWindow.getFocusedWindow();
		//Wiklich ausloggen?
		dialog.showMessageBox(
			{ type: 'info', buttons: ['Ja', 'Nein'], message: 'Wollen Sie sich wirklich ausloggen?' },
			function (buttonIndex) {
				if( buttonIndex === 0 ){
					//Authcode löschen, dann Fenster neu laden
					mainWindow.webContents.send( 'delete-authcode' );
				}
			}
		);
	},
	//Userdaten löschen, Fenster neu laden
	"deleteUserData" : function () {
		//Userdaten löschen
		storage.remove('NotesUser', function(error) {
			if( error ){ throw error; }
	
			mainWindow.reload();
		});
	},
	//Userdaten des Users abfragen (werde in Home gesucht und wenn verfügbar geladen)
	"askForUserData" : function( event ) {
		var userdata = {
			"server" : "",
			"username" : "",
			"userid" : "",
			"authcode" : ""
		};
		var loggedIn = false;

		try{
			//Speicherung als JSON-String unter Schlüssel "NotesUser"
			storage.has( 'NotesUser', function(error, hasIt) {
				if( error ){ throw error; }

				if( hasIt ){
					//Daten lesen
					storage.get( 'NotesUser' , function(error, data) {
						if (error){ throw error; }
						//Daten nehemen
						userdata = data;
		
						answer( true );
					});
				}
				else{
					answer(false);
				}
			});

			//zurückgeben
			function answer(loggedIn){
				event.sender.send('ask-for-user-data-back', {
					"loggedIn" : loggedIn,
					"userdata" : userdata
				});
			}

		//Fehler fangen.
		} catch( e ) {
			dialog.showErrorBox( 'Kann Userinformationen nicht lesen!' , 'Fehler: "' + e.message + '"' );
		}
	},
	//Userdaten auf Festplatte im Home des Users sichern
	"saveUserData" : function( event, userdata ){
		storage.set('NotesUser', userdata, function(error) {
			if (error){
				dialog.showErrorBox( 'Kann Userinformationen nicht speichern!' , 'Fehler: "' + error.message + '"' );
			}
		});
	},
	//Freigaben Menübutton
	"freigabenDialog" : function(){
		//an das Fenster weitergeben
		electron.BrowserWindow.getFocusedWindow().webContents.send( 'freigaben-dialog' );
	},
	//Freigaben Menübutton
	"webviewDevtools" : function(){
		//an das Fenster weitergeben
		electron.BrowserWindow.getFocusedWindow().webContents.send( 'webview-devtools' );
	}
}