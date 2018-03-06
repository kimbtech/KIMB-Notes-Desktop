// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

/**
 * Imports
 */

//Für die IPC Messages
const ipc = require('electron').ipcRenderer
// URLs testen
var validUrl = require('valid-url');
// Hashing
var sjcl = require('sjcl');
// System Dialog
const dialog = require('electron').remote.dialog 
// Electron Shell
const {shell} = require( 'electron' );

//Webrequests
var request = require('request');

/**
 * Funktionen
 */
//Struktur für Userdaten
var userdata = {
	"server" : "",
	"username" : "",
	"userid" : "",
	"authcode" : ""
};

/**
 * WebRequest an Server stellen
 * Unter userdata.server muss korrekter Server angegeben sein!!
 * @param {String} task Aufgabenbereich der Anfage (login, list, view, admin)
 * @param {JSON} post Daten die per POST übertragen werden sollen
 * @param {function (JSON)} callback (optional) Funktion nach erfolgreicher Anfage, JSON Rückgabe als Parameter
 * @param {function (JSON)} errcallback (optional) Funktion bei fehlerhafter Anfrage, Parameter Fehlerobjekt und Status-Code
 */
function web_request( task, post, callback, errcallback ){
	request.post({
			url: userdata.server + '/ajax.php?' + task, 
			form : post,
			jar: true
		},
		function (error, response, body) {
			if(
				error !== null || (response && response.statusCode) != 200
			){
				//Fehlermeldung
				dialog.showErrorBox(
					'Fehler beim Login',
					'Konnte nicht mit Server verbinden: "'
						+ (( error !== null ) ? error.message : 'Statuscode ' + (response && response.statusCode) ) + '"'
				);

				//Fehler weitergeben
				if( typeof errcallback === "function" ){
					errcallback( error, (response && response.statusCode) );
				}
			}
			else{
				if( typeof callback === "function" ){
					//Daten zurueckgeben
					callback( body );
				}
			}
	    });
}

/**
 * Rufe eine URL mittles WebView auf.
 * @param {String} url URL, welche im WebView aufgerufen werden soll
 * @param {function (webview} donecallb (optional) Callback, welches nach fertig geladenem Webview aufgerufen wird
 */
function openWebView( url, donecallb ){
	//übergeordnetes zeigen
	$( "div.webview" ).removeClass( 'disable' );

	if( $( "webview#mainWebview" ).length === 0 ){
		//Webview erstellen
		$( "div.webview" ).html(
			'<webview src="' + url + '" id="mainWebview" useragent="KIMB-Notes-Desktop (using Electron, Chrome)"></webview>'
		);

		//als Variable verfügbar machen
		var webview = $( "webview#mainWebview" )[0];
	}
	else{
		//als Variable verfügbar machen
		var webview = $( "webview#mainWebview" )[0];

		webview.loadURL( url );
	}

	//Links im Browser öffnen
	webview.addEventListener('new-window', (e) => {
			shell.openExternal(e.url);
	});
	webview.addEventListener('will-navigate', (e) => {
			shell.openExternal(e.url);
	});
	
	//immer korrekt beenden
	webview.addEventListener('destroyed', () => {
		$( "div.webview" ).addClass( 'disable' );
	});
	webview.addEventListener('close', () => {
		$( "div.webview" ).addClass( 'disable' );
	});
	
	//Callback ermöglichen
	if( typeof donecallb === "function" ){
		webview.addEventListener('dom-ready', (e) => {
			donecallb( webview );
		});
	}
}

/**
 * SYSTEM
 */

//Loginmanager
function mainLoginManager(){

	//check for Login Data
	//	sends messages to main.js to get Userinformation form there
	//	calls next functions, sets userdata as far as possible
	function checkForLoginData(){
		//IPC ask for Data
		ipc.send('ask-for-user-data')

		//IPC on Data back
		ipc.on('ask-for-user-data-back', function (event, data ) {
			//eingeloggt?
			if( data.loggedIn ){
				userdata = data.userdata;
				openNotesTool();
			}
			else{
				loginform();
			}
		});
	}

	//loginform
	function loginform(){
		//schon mal etwas im Formular gehabt?
		var lastinput = localStorage.getItem( 'lastinput' ) ;
		//	leer?
		if( lastinput !== null && lastinput != '' ){
			//Arraynparsen
			lastinput = JSON.parse( lastinput );
			//setzen
			$( "input#serverurl" ).val( lastinput[0] );
			$( "input#username" ).val( lastinput[1] );
		}

		//zeige Formular
		$( 'div.credentials' ).removeClass( 'disable' );
		$( 'div.message.loading' ).addClass( 'disable' );

		var password;
		
		//Höre auf Click/ Enter
		$('input#password').keypress(function (e) {
			if (e.which == 13) {
				checkUserDataGetAuthcode();
			}
		});
		$( 'button#loginsubmit' ).click( checkUserDataGetAuthcode );
		function checkUserDataGetAuthcode(){
			//check User Data and get Authcode
			$( 'div.message.loading' ).removeClass( 'disable' );
			
			//aus Formular holen
			userdata.server = $( "input#serverurl" ).val();
			//http(s) davor, wenn nicht da
			if( userdata.server.substr(0,7) != 'http://' && userdata.server.substr(0,8) != 'https://' ){
				userdata.server = 'https://' + userdata.server;
				
			}

			userdata.username = $( "input#username" ).val();
			password = $( "input#password" ).val();
			//	sichern, später vorschlagen
			localStorage.setItem( 'lastinput', JSON.stringify( [ userdata.server, userdata.username ] ) );

			//Hinweis, dass keine Verschlüsselte Verbindung
			if( userdata.server.substr(0,7) == 'http://' ){
				dialog.showMessageBox({
					type : "warning",
					title : "Unverschlüsselte Verbindung",
					message : "Die Verbindung zum angegebenen Server ist nicht verschlüsselt, dadurch werden die Inhalte der Notizen nicht geschützt!",
					buttons : ["Trotzdem anmelden", "Abbrechen"]
				}, function ( num ) {
					if( num == 0 ){
						//Login
						serverconnlogin();
					}
					else{
						//Ladebalken weg
						$( 'div.message.loading' ).addClass( 'disable' );						
					}
				});
			}
			else{
				serverconnlogin();
			}

			function serverconnlogin(){
				if(
					validUrl.isUri(  userdata.server )
					&&
					userdata.username.replace( /[^a-z]/, '' ) === userdata.username && userdata.username != ''
					&& 
					password != ''
				){
					//Passwort Hashen
					password = sjcl.codec.hex.fromBits( sjcl.hash.sha256.hash( password ));

					//Authcode holen
					web_request( 'login',
						{ username : userdata.username , password : password  },
						function ( data ) {
							try{
								//erstmal String zu JSON
								data = JSON.parse( data );
							
								if(
									typeof data === "object"
									&&
									typeof data.status === "string"
									&&
									typeof data.error !== "undefined"
									&&
									typeof data.data !== "undefined"
								){
									//Login okay?
									if( data.status === "okay" ){
										//UserID sichern
										userdata.userid = data.data.id;

										//Passwort aus DOM löschen
										$( "input#password" ).val('');

										//Authcode erstellen
										web_request( 'account',
											{ userid : userdata.userid, art : 'new', id : 'empty'  },
											function ( data ) {
												//erstmal String zu JSON
												data = JSON.parse( data );

												//Antwort okay?
												if( data.status === "okay" ){
													//Authcode übernehmen
													userdata.authcode = data.data;

													//Daten sichern
													ipc.send( 'save-user-data', userdata );
													
													//Formular ausblenden
													$( 'div.credentials' ).addClass( 'disable' );

													//NotesTool öffnen
													openNotesTool();
												}
												else{
													$( 'div.message.loading' ).addClass( 'disable' );
													dialog.showErrorBox( 'Login nicht erfolgreich!', 'Kann keinen Authentifizierungslink erstellen!' );
												}
											});
									}
									else{
										$( 'div.message.loading' ).addClass( 'disable' );
										dialog.showErrorBox( 'Login nicht erfolgreich!', 'Bitte prüfen Sie Username und Passwort!' );
									}
								}
								else{
									throw new Error( 'Fehler' );
								}
							} catch(e){
								$( 'div.message.loading' ).addClass( 'disable' );
								dialog.showErrorBox( 'Fehlerhafte Serverantowort', 'Der angegebene Server hat nicht wie ein KIMB-Notes-Server geantowrtet!' );
							}
						});
				}
				else{
					$( 'div.message.loading' ).addClass( 'disable' );
					dialog.showErrorBox( 'Formulareingaben', 'Bitte füllen Sie allen Felder korrekt!' );
				}
			}
		}
	}

	//open Notes
	function openNotesTool(){
		//Userdaten okay?
		web_request( 'login',
			{ username : userdata.username, authcode : userdata.authcode },
			function (data) {
				//erstmal String zu JSON
				data = JSON.parse( data );

				//okay?
				if( data.status === "okay" ){
					//using webview and authcode
					var url = userdata.server + '/' + '#' + userdata.username + ':' + userdata.authcode;
					openWebView( url, ( webview ) => {
						var css = 'div.logout button#logout{ display: none !important; }'
							+ 'div.logout span.small{ display: none !important; } '
							+ 'div.logout{ height : 25px !important; width : 45px !important; }';

						webview.executeJavaScript( ' $("head").append( "<style>' + css + ' )</style>" );' );
					});
				}
				else{
					dialog.showErrorBox( 'Login nicht möglich!', 'Sie konnten nicht eingeloggt werden.' );
					loginform();
				}
		});

	}

	//Erstmal nach bekannten Daten gucken.
	checkForLoginData();
}
//Logindaten suchen, Login versuchen, Notes öffnen,
//	wenn keine Daten gefunden, Formular zeigen
mainLoginManager();

/**
 * Freigaben etc.
 */

//Freigaben Dialog
function freigabenDialog(){
	/*
		//Schließen
		mainLoginManager();
		
		//Öffnen
		openWebView( '<<share-link>>' );

		/*
		 * ToDo
		 */
	/**/
	dialog.showErrorBox( 'Noch nicht verfügbar!', 'Diese Funktion ist noch nicht verfügbar!!' );
}

//Authcode löschen, dann Fenster neu laden
function deleteAuthCode(){
	//überhaupt Userdaten?
	if( userdata.server != '' ){
		//einloggen
		web_request( 'login',
			{ username : userdata.username, authcode : userdata.authcode },
			function (data) {
				//erstmal String zu JSON
				data = JSON.parse( data );

				//okay?
				if( data.status === "okay" ){
					//Code löschen
					web_request( 'account',
						{ userid : userdata.userid, art : 'del', id : sjcl.codec.hex.fromBits( sjcl.hash.sha256.hash( userdata.authcode )) },
						function ( data ) {
							//erstmal String zu JSON
							data = JSON.parse( data );

							//Antwort okay?
							if( data.status === "okay" ){
								ipc.send( 'reload-window' );
							}
							else{
								dialog.showErrorBox('Logout fehlgeschlagen', 'Sie konnten nicht ausgeloggt werden!');
							}
					});
				}
				else{
					dialog.showErrorBox( 'Nicht eingeloggt', 'Sie konnten nicht eingeloggt werden!' );
				}
		});
	}
	else{
		dialog.showErrorBox( 'Kein Login', 'Es konnte kein Login gefunden werden!' );
	}
}

// IPC Messages
ipc.on( 'freigaben-dialog', freigabenDialog );
ipc.on( 'delete-authcode', deleteAuthCode );