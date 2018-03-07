/**
 * Diese Datei prüft auf verfügbare Updates.
 */

 module.exports = class{

	constructor(){
		// Bibilotheken
		this.request = require( 'request' );
		this.electron = require( 'electron' );
		this.compareVersions = require('compare-versions');
		this.storage = require('electron-json-storage');

		this.package_json_url = 'https://api.github.com/repos/kimbtech/KIMB-Notes-Desktop/contents/package.json';
		this.releases_url = 'https://github.com/kimbtech/KIMB-Notes-Desktop/releases/latest';

		this.githubchecked = false;
		this.hasUpdate = false;
	}

	/**
	 * Nach Updates für KIMB-Notes gucken und wenn vorhanden, User hinweisen
	 * 	Prüft ob heute schon angefragt, fragt an, wenn nötig und löst Meldung aus.
	 */
	checkUpdates(){
		var THIS = this;

		//nach Daten gucken
		this.storage.has( 'Updates', function(error, hasIt) {
			if( error ){ throw error; }

			if( hasIt ){
				//Daten lesen
				THIS.storage.get( 'Updates' , function(error, data) {
					if (error){ throw error; }
					
					// Anfrage älter als 24 h?
					if( data.requestTime + 86400000 < Date.now() ){
						//neu fragen
						THIS.githubAPIrequest();
					}
					else{
						THIS.hasUpdate = data.hasUpdate;

						//Hinweis
						THIS.updateInfo();
					}
					
				});
			}
			else{
				//keine Daten, also nachfragen
				THIS.githubAPIrequest();
			}
		});

		
	}

	/**
	 * Stellt Anfrage an GitHub API
	 * 	Setzt dabei this.githubchecked und this.hasUpdate
	 * 	Schribt in Storage
	 */
	githubAPIrequest(){
		var THIS = this;

		//Parameter
		var option = {
			url: this.package_json_url,
			headers: {
				'User-Agent': 'KIMB-Notes-Desktop by kimbtech'
			}
		};

		//Antwort verarbeiten
		function response(e, resp, body){
			if (!e && resp.statusCode == 200) {
				THIS.githubchecked = true;

				//Antwort parsen
				body = JSON.parse( body );
				//base64 to ASCII
				var package_json = new Buffer(body.content, 'base64').toString('ascii');
				//aktuelle Package JSON parsen
				package_json = JSON.parse( package_json );
				var onlineVersion =  package_json.version;
				
				//vergleichen
				THIS.hasUpdate = THIS.compareVersions( THIS.electron.app.getVersion(), onlineVersion) < 0;

				//Daten speichern
				THIS.storage.set('Updates', { requestTime : Date.now(), hasUpdate : THIS.hasUpdate  }, function(error) {
					if (error){ throw error; }
				});

				//Hinweis
				THIS.updateInfo();
			}
		}

		//Anfrage durchführen
		this.request(option, response)
	}

	/**
	 * Update Hinweis erzeugen, wird von checkUpdates() aufgerufen
	 * 	Hinweis wird nur gezeigt, falls Update vorhanden!!
	 */
	updateInfo(){
		if( this.hasUpdate ){
			var THIS = this;
			this.electron.dialog.showMessageBox({
				type : "info",
				title : "Update verfügbar",
				message : "Es ist eine neue Version von KIMB-Notes-Desktop verfügbar!",
				buttons : ["Herunterladen", "Später"]
			}, function ( num ) {
				if( num == 0 ){
					//Link aufrufen
					THIS.electron.shell.openExternal( THIS.releases_url );
				}
			});
		}
	}
}