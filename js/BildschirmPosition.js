/**
 * Aktuell gibt es das Problem, dass das Fenster sich bei der Maus öffnet, was unpraktisch ist.
 * 	Der Standard von Electron, dass das Fenster sich in der Mitte öffnet, ist bei mehreren Bildschirmen unglücklich,
 * 	da es evtl. nicht der Haupbildschirm ist.
 * 
 * Diese Datei bestimmt auf welchem Bildschirm die Maus gerade ist und öffnent das Fenster dort oben links.
 */

const electron = require('electron');
const app = electron.app;

function NotReadyException( m ){
	this.message = m;
	this.name = "NotReadyException";
}

module.exports = class {

	/**
	 * Berechnet die Position, an der ein sinnvoll Fenster mittig geöffnet werden kann.
	 *  Position kann mittels getActiveScreenTopLeft() oder über callback zurückgegeben werden.
	 *  Falls Electron App noch nicht bereit ist, wir mit der Berechnung async. gewartet.
	 * @param {function} callback Erhält berechnete Position als JSON {x:,y:}
	 */
	constructor ( callback ){
		//Daten
		this.activeScreenTopLeftData = {x : 0, y : 0};
		//noch nicht berechnet
		this.activeScreenTopLeftCalced = false;

		//App bereit?
		if( app.isReady() ){
			//berechnen
			this.calcActiveScreenTopLeft();

			//Berechnete Daten über Callback mitteilen
			if( typeof callback == "function" ){
				callback( this.getActiveScreenTopLeft() );
			}
		}
		else{
			//Berechnen sobald App bereit
			app.on('ready', function() {
				this.calcActiveScreenTopLeft();

				//Berechnete Daten über Callback mitteilen
				if( typeof callback == "function" ){
					callback( this.getActiveScreenTopLeft() );
				}
			});
		}
	}

	/**
	 * Getter für die Position, an der sich ein Fenster öffnen soll, damit es
	 * zentral auf dem aktuellen Bildschirm liegt.
	 * @return {JSON} x und y mit int-Werten
	 * @throws {NotReadyException}
	 */
	getActiveScreenTopLeft(){
		// Daten schon berechnet?
		if( this.activeScreenTopLeftCalced ){
			//zurückgeben
			return this.activeScreenTopLeftData;
		}
		else{
			//noch nicht möglich, Fehler
			throw new NotReadyException( 'Die Abfrage ist noch nicht möglich, da Electron noch nicht bereit ist.' );
		}
	}

	/**
	 * Bestimmt die Koordianten und speichert sie im Objekt.
	 * @private 
	 */
	calcActiveScreenTopLeft(){
		//Screen erst hier verfügbar!
		const screen = electron.screen;

		//berechnet
		this.activeScreenTopLeftCalced = true;

		var mouse = screen.getCursorScreenPoint();

		screen.getAllDisplays().some( display => {
			//Maus in diesem Fenster?
			if(
					( display.bounds.x - mouse.x ) < 0 && 
					( display.bounds.x + display.bounds.width - mouse.x ) > 0
				&&
					( display.bounds.y - mouse.y ) < 0 && 
					( display.bounds.y + display.bounds.height - mouse.y ) > 0
			){
				//oben links in diesem Bildschirm
				this.activeScreenTopLeftData.x = display.bounds.x + 20;
				this.activeScreenTopLeftData.y = display.bounds.y + 20;

				//fertig
				return;
			}
		});
	}


}