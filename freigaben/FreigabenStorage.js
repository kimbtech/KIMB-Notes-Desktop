/**
 * Klasse zur Speicherung derFreigaben mittels JSON Storage.
 */

//JSON Speicher für Userdaten
const storage = require('electron-json-storage');

module.exports = class FreigabenStorage {

	/**
	 * Ließt den Storage aus und macht ihn per Getter und Setter verfügbar.
	 * @callback callback Aufruf, wenn Objekt bereit (Daten von Festplatte geladen)
	 */
	constructor( callback ){
		//Daten vorhanden?
		storage.has( "Freigaben", ( e, h ) => {
			if( e ){ throw e; }

			//ja, dann ...
			if( h ){
				// ... Daten lesen
				storage.get("Freigaben", (e,d) => {
					if( e ){ throw e; }

					this.data = d;

					if( typeof callback == "function" ){
						callback();
					}
				});
			}
			else{
				//leeres Array
				this.data = [];						

				if( typeof callback == "function" ){
					callback();
				}
			}
		});
	}

	/**
	 * Die aktuelle Datenliste bekommen.
	 * @returns {array} Array mit JSON { name :, link :, time : }
	 */
	getList(){
		return this.data;
	}

	/**
	 * Einen Eintrag an die Liste anfügen
	 * @param {JSON} obj Hinzuzufügender Eintrag { name :, link : }
	 */
	addToList( obj ){
		obj.time = Date.now()
		this.data.push( obj );
		this.save();
	}

	/**
	 * Anhand des Timestamps einen Eintrag aus der Liste löschen
	 * @param {*} time Timestamps des zu löschenden Eintrags
	 */
	removeFromList( time ){
		var newdata = [];
		this.data.forEach(element => {
			//alle bis auf time behalten
			if( element.time !== time ){
				newdata.push( element );
			}
		});
		this.data = newdata;
		this.save();
	}

	/**
	 * Die JSON schreiben.
	 * @private
	 */
	save(){
		console.log( this.data );
		storage.set( "Freigaben", this.data, (e) => {
			if( e ){ throw e; }
		});
	}
}