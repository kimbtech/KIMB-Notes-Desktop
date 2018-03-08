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
		//Referenz für aktuelles Display
		this.display = null;

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
	 * oben links auf dem aktuellen Bildschirm liegt.
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
	 * Getter für die Position, an der sich ein Fenster öffnen soll, damit es
	 * zentral auf dem aktuellen Bildschirm liegt.
	 * @param {number} width Breite des zu zentrierenden Fensters
	 * @param {numbr} height Höhe des zu zentrierenden Fensters
	 * @return {JSON} x und y mit int-Werten
	 * @throws {NotReadyException}
	 */
	getActiveScreenCenter( width, height ){
		//Obere linke Ecke
		var topleft = this.getActiveScreenTopLeft();
		topleft.x = topleft.x - 20;
		topleft.y = topleft.y - 20;

		//Mitte des Bildschirms
		var center = {
			x : topleft.x + Math.floor( this.display.bounds.width / 2 ),
			y : topleft.y + Math.floor( this.display.bounds.height / 2)
		};

		//Fenstergröße abziehen => obere linke Ecke des Fensters
		center.x = center.x - Math.floor( width / 2 );
		center.y = center.y - Math.floor( height / 2 );

		return center;
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

				this.display = display;

				//fertig
				return;
			}
		});
	}


}