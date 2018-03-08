/**
 * Diese Datei füllt das Fenster der Freigaben mit Leben.
 */

// Systemkonfiguration
const conf = require( __dirname + '/../js/config.js' );
// URLs testen
const validUrl = require('valid-url');
// Speicher
const FreigabenStorage = require(__dirname + '/FreigabenStorage.js' );
//Speicher laden, wenn Fertig, Liste erstellen
var saves = new FreigabenStorage( loadList );
// Funktion zum Öffnen von WebViews
const openWebView = require(__dirname + '/../js/openWebView.js');

// Entwickler Modus?
if( conf.devMode ){
	$( "div#developerbuttons" ).removeClass('disable');
}

// Liste laden
function loadList(){	
	// Liste erstellen
	var list = "";
	saves.getList().forEach( function( data ){
		list += '<li class="box" link="'+ data.link +'" style="line-height: 28px;">'
			+ '<span class="name">' + data.name + '</span>'
			+ '<span style="float:right">'
			+ '<button class="deletefreigabe" title="Löschen" time="'+ data.time +'">&#x2718;</button>'
			+ '</span>'
			+ '</li>';
	});
	// Liste ins DOM
	$("div.freigaben ul").html( list );

	//Löschen Listener
	$("button.deletefreigabe").click(function(){
		var time = $( this ).attr("time");
		deleteFreigabe( time );
	});
	//Öffnen Listener
	$("span.name").click(function(){
		var link = $( this ).parent().attr("link");
		openFreigabe( link );
	});
}

//Neue dazu
function newFreigabe(){
	var link = $("input#freigabelink").val();
	var name = $("input#name").val();
	var save = $("input#speichern").is(':checked');

	// Name leer?
	if(name == ""){
		// Domainname des Servers
		name = link.match( /\w+\.\w+/ )[0];
		// Ende des Codes
		name += link.substr( link.search("#"), 5 );
	}

	//http(s) davor, wenn nicht da
	if( link.substr(0,7) != 'http://' && link.substr(0,8) != 'https://' ){
		link = 'https://' + link;
	}

	// Überhaupt Link gegeben?
	if( link != "" && validUrl.isUri( link ) ){
		//speichern?
		if( save ){
			//der Liste anfügen
			saves.addToList( { link : link, name : name } );

			//Freigabe öffnen
			openFreigabe( link )
			//Liste neu laden
			loadList();	
		}
		else{
			//Freigabe öffnen
			openFreigabe( link );
		}
	}
}
$("button#loginsubmit").click( newFreigabe );

//Löschen
function deleteFreigabe( time ){
	//aus der Liste entfernen
	saves.removeFromList( parseInt( time ) );

	console.log( time );

	//Liste neu laden
	loadList();
}

//Öffnen
function openFreigabe( link ){
	openWebView( link, ( webview ) => {
		
		var css = 'body { background: #f5f5f5; } '
			+ 'div.main { border: none; box-shadow: none; } '
			+ 'h1 { display:none; }'
			+ 'div.footer a { color: black } ';

		webview.executeJavaScript( ' $("button#closenote").unbind("click").click( function () { window.open("file://dont-open/")  } ); ' );
		webview.executeJavaScript( ' $("head").append( "<style>' + css + ' )</style>" );' );

		webview.addEventListener('new-window', (event, url) => {
			if( event.url == 'file://dont-open/' ){
				location.reload();
			}
		});
		
	});
}