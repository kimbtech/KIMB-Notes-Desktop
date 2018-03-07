/**
 * Diese Datei füllt das Fenster der Freigaben mit Leben.
 */

// Systemkonfiguration
const conf = require( __dirname + '/../js/config.js' );

// Entwickler Modus?
if( conf.devMode ){
	$( "div#developerbuttons" ).removeClass('disable');
}

// Liste laden
function loadList(){
	// Daten laden
	/*
		ToDo
	*/
	var saves = [
		{
			name : "Müüüh",
			link : "hdsfser/sdfgertsdjkjksdgfre"
		}
	]

	// Liste erstellen
	var list = "";
	saves.forEach( function( data ){
		list += '<li class="box" link="'+ data.link +'" style="line-height: 28px;">'
			+ '<span class="name">' + data.name + '</span>'
			+ '<span style="float:right">'
			+ '<button class="deletefreigabe" title="Löschen">&#x2718;</button>'
			+ '</span>'
			+ '</li>';
	});
	// Liste ins DOM
	$("div.freigaben ul").html( list );

	//Löschen Listener
	$("button.deletefreigabe").click(function(){
		var link = $( this ).parent().parent().attr("link");
		deleteFreigabe( link );
	});
	//Öffnen Listener
	$("span.name").click(function(){
		var link = $( this ).parent().attr("link");
		openFreigabe( link );
	});
}
loadList();

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

	// Überhaupt Link gegeben?
	if( link != "" ){
		//speichern?
		if( save ){
			/*
				ToDo
			*/
			console.log( 'Save: (' + link + ',' + name + ')' );

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
function deleteFreigabe( link ){
	/*
		ToDo
	*/
	console.log('Delete: ' + link );

	//Liste neu laden
	loadList();
}

//Öffnen
function openFreigabe( link ){
	/*
		ToDo
	*/
	console.log('Open: ' + link );
}