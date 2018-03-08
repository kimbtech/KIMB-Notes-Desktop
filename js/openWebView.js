// Electron Shell
const shell = require('electron').shell;

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
		if(e.url != 'file://dont-open/' ){
			shell.openExternal(e.url);
		}
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

module.exports = openWebView;