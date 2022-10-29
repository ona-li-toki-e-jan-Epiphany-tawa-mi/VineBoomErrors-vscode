// TODO Possibly add configuration options for which players to use.
// TODO Possible add config option to select error severity.

import * as vscode from "vscode";
const commands  		 = vscode.commands;
const window      		 = vscode.window;
const languages			 = vscode.languages;
const DiagnosticSeverity = vscode.DiagnosticSeverity;

const findExec = require("find-exec");
const spawn    = require("child_process").spawn;

/**
 * A mapping between string keys and a given type. Just objects with a specified value type.
 */
 interface Dictonary<Type> {
	[key: string]: Type;
};



// Must be mp3 compatible.
// TODOO: omxplayer and cmdmp3win have not been tested.
const players = [ "mplayer", "mpv", "ffplay", "omxplayer", "cmdmp3win"
                , "cvlc" /* from VLC */, "play" /* from SoX(?) */
			    , "mpg123", "mpg321" /* Same player, different name */]

// Various options to make sure players don't open any windows and exit when done.
const playerOptions: Dictonary<string[]> = { ffplay: ["-nodisp", "-autoexit"]
	                  					   , cvlc:   ["--play-and-exit"]};

let _player: string | null = null;
/**
 * Gets the first available player on the system.
 *
 * @returns The player.
 * @throws If there are no available players.
 */
function getPlayer(): string {
	if (!_player) {
		_player = findExec(players);

		if (!_player)
			throw `Unable to find any sound players on the system (attempted to look for ${players})`;
	}

	return _player;
}

/**
 * Plays the given audio file with one of the available players.
 * @param filePath audio file path.
 */
async function playFile(filePath: string) {
	const player       = getPlayer();
	const args         = (playerOptions[player] || []).concat(filePath);
	const audioProcess = spawn(player, args);

	if (!audioProcess) {
		window.showErrorMessage("Unable to find any executables for playing sound");
		return
	}
	
	audioProcess.on('error', (code: number) =>
		window.showErrorMessage(`Something went wrong while trying to play "${filePath}" with ${player}. Error code: ${code}`));

	const onClose = new Promise((resolve) =>
		audioProcess.on('close', resolve));
	await onClose;
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
