// TODO Possibly ditch play-sound dependency and use find-exec as play-sound doesn't offer much and 
//   can easily be replicated.
// TODO Possibly add configuration options for which players to use.
// TODO Possible add config option to select error severity.

import * as vscode from "vscode";
const commands  		 = vscode.commands;
const window      		 = vscode.window;
const languages			 = vscode.languages;
const DiagnosticSeverity = vscode.DiagnosticSeverity;

const playsound = require("play-sound")({
	// Must be mp3 compatible.
	// TODOO: omxplayer and cmdmp3win have not been tested.
	players: [ "mplayer", "mpv", "ffplay", "omxplayer", "cmdmp3win"
             , "cvlc" /* from VLC */, "play" /* from SoX (and possibly play.exe on Windows, not sure. */
			 , "mpg123", "mpg321" /* Same player, different name */]
});



// Various options to make sure players don't open any windows and exit when done.
const playerOptions = { ffplay: ["-nodisp", "-autoexit"]
	                  , cvlc:   ["--play-and-exit"]};

/**
 * Plays the given audio file with one of the available players.
 * @param filePath audio file path.
 */
function playFile(filePath: string) {
	playsound.play(filePath, playerOptions, (error: any) => {
		if (error)
			window.showErrorMessage(`Error: unable to play file ${filePath}. Cause: ${error}`);
	});
}

/**
 * Plays the given audio file {count} times, spaced out by given delay, in milliseconds.
 * 
 * @param filePath  audio file path.
 * @param count     number of times to play it.
 * @param delay     amount of time to space out each play by.
 */
function loopPlayFile(filePath: string, count: number, delay: number) {
	let delayAccumulator = 0;

	for (; count > 0; count--) {
		setTimeout( () => playFile(filePath)
			      , delayAccumulator);
		delayAccumulator += delay;	
	}
}



/**
 * A mapping between string keys and a given type. Just objects with a specified value type.
 */
interface Dictonary<Type> {
	[key: string]: Type;
};

// Stores previous error counts so we don't Vine boom unnecessarily ;).
let errorHistory: Dictonary<number> = {};

/**
 * Produces a Vine boom for every *new* error found from static analysis.
 * 
 * @param vineBoomFile path to the file containing the Vine boom effect.
 * @param delay amount of time to space out each Vine boom by.
 */
function vineboomForErrors(event: vscode.DiagnosticChangeEvent, vineBoomFile: string, delay: number) {
	for (const URI of event.uris) {
		let URIString = URI.toString();
		
		let errors = 0;
		for (const diagnostic of languages.getDiagnostics(URI))
			if (diagnostic.severity <= DiagnosticSeverity.Error)
				errors++;

		let boomableErrors = errors;
		if (URIString in errorHistory)
			boomableErrors -= errorHistory[URIString];

		if (boomableErrors > 0) 
			loopPlayFile(vineBoomFile, boomableErrors, delay);

		errorHistory[URIString] = errors;
	} 
}



export function activate(context: vscode.ExtensionContext) {
	const configuration = vscode.workspace.getConfiguration("vineBoomErrors");
	const vineBoomFile: string = configuration.get("soundEffectLocation") || 
								 `${context.extensionPath}/audio/vineboom.mp3`;

	let playBoom = commands.registerCommand("vineBoomErrors.playBoom", () =>
		playFile(vineBoomFile));
	context.subscriptions.push(playBoom);

	vscode.languages.onDidChangeDiagnostics((event: vscode.DiagnosticChangeEvent) => {
		if (configuration.get("playBoomOnError")) {
			let delay: number = configuration.get("delay") || 100;
			vineboomForErrors(event, vineBoomFile, delay);
		}
	});
}

export function deactivate() {}
