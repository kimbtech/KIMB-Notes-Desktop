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

//Loginmanager
function mainLoginManager(){
	//Struktur für Userdaten
	var userdata = {
		"server" : "",
		"username" : "",
		"userid" : "",
		"authcode" : ""
	};

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
				logUserInViaAuthcode();
			}
			else{
				loginform();
			}
		});
	}

	//try Login
	function logUserInViaAuthcode(){
		alert( 'loggin in ...' + "\r\n\r\n\r\n" + JSON.stringify( userdata ) );
	}

	//loginform
	function loginform(){
		//zeige Formular
		$( 'div.credentials' ).removeClass( 'disable' );
		$( 'div.message.loading' ).addClass( 'disable' );

		var password;
		
		//Höre auf Click
		$( 'button#loginsubmit' ).click(function(){
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
				/*
					ToDo
				*/
					//Daten sichern
					ipc.send( 'save-user-data', userdata );

					alert( JSON.stringify( [ userdata, password ] ) );
			}
			else{
				dialog.showErrorBox( 'Formulareingaben', 'Bitte füllen Sie allen Felder korrekt!' );
			}
		});
	}

	//open Notes
	function openNotesTool(){

	}

	//Erstmal nach bekannten Daten gucken.
	checkForLoginData();
}
//Logindaten suchen, Login versuchen, Notes öffnen,
//	wenn keine Daten gefunden, Formular zeigen
mainLoginManager();


