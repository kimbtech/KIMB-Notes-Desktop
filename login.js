// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//Für die IPC Messages
const ipc = require('electron').ipcRenderer
// URLs testen
var validUrl = require('valid-url');
// Hashing
var sjcl = require('sjcl');
// System Dialog
const dialog = require('electron').remote.dialog 

//Webrequests
var request = require('request');

//Loginmanager
function mainLoginManager(){
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
			},
			function (error, response, body) {
				if(
					error !== null || (response && response.statusCode) != 200
				){
					//Fehlermeldung
					dialog.showErrorBox(
						'Fehler beim Login',
						'Konnte nicht mit Server verbinden: "'
							+ (( error !== null ) ? error.message : 'Statuscode ' + (response && response.statusCode) ) +
						'"'
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

	//check for Login Data
	//	sends messages to main.js to get Userinformation form there
	//	calls next functions, sets userdata as far as possible
	function checkForLoginData(){
		//IPC ask for Data
		ipc.send('ask-for-user-data')

		//IPC on Data back
		ipc.on('ask-for-user-data-back', function (event, data ) {
			//eingeloggt?
			if( data.loggenIn ){
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
		//zeige Formular
		$( 'div.credentials' ).removeClass( 'disable' );
		$( 'div.message.loading' ).addClass( 'disable' );

		var password;
		
		//Höre auf Click
		$('input#password').keypress(function (e) {
			if (e.which == 13) {
				checkUserDataGetAuthcode();
			}
		});
		$( 'button#loginsubmit' ).click( checkUserDataGetAuthcode );
		function checkUserDataGetAuthcode(){
			//check User Data and get Authcode
			
			//aus Formular holen
			userdata.server = $( "input#serverurl" ).val();
			userdata.username = $( "input#username" ).val();
			password = $( "input#password" ).val();

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

									//Authcode erstellen
									/*
										ToDo
									*/
									
										//Daten sichern
										ipc.send( 'save-user-data', userdata );

										//NotesTool öffnen
										openNotesTool();
								
								}
								else{
									dialog.showErrorBox( 'Login nicht erfolgreich!', 'Bitte prüfen Sie Username und Passwort!' );
								}
							}
							else{
								throw new Error( 'Fehler' );
							}
						} catch(e){
							dialog.showErrorBox( 'Fehlerhafte Serverantowort', 'Der angegebene Server hat nicht wie ein KIMB-Notes-Server geantowrtet!' );
						}
					});
			}
			else{
				dialog.showErrorBox( 'Formulareingaben', 'Bitte füllen Sie allen Felder korrekt!' );
			}
		}
	}

	//open Notes
	function openNotesTool(){
		//using webview and authcode
		/*
			ToDo
		*/

		alert('opening notestool ' + JSON.stringify( userdata ) );
	}

	//Erstmal nach bekannten Daten gucken.
	checkForLoginData();
}
//Logindaten suchen, Login versuchen, Notes öffnen,
//	wenn keine Daten gefunden, Formular zeigen
mainLoginManager();


