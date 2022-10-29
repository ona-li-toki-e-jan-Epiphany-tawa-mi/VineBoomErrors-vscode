// TODO Possible add config option to select error severity.

import * as vscode from "vscode";
const commands  		 = vscode.commands;
const window      		 = vscode.window;
const languages			 = vscode.languages;
const DiagnosticSeverity = vscode.DiagnosticSeverity;

const findExec = require("find-exec");
import { spawn } from "child_process";

/**
 * A mapping between string keys and a given type. Just objects with a specified value type.
 */
 interface Dictonary<Type> {
	[key: string]: Type;
};



let _vineBoomFile: string | undefined = undefined;
function getVineBoomFile(): string {
	if (!_vineBoomFile)
		throw 'Vine boom file path not set!'

	return _vineBoomFile;
}

// Must be mp3 compatible.
// TODOO: omxplayer and cmdmp3win have not been tested.
let players = [ "mplayer", "mpv", "ffplay", "omxplayer", "cmdmp3win"
              , "cvlc" /* from VLC */, "play" /* from SoX(?) */
			  , "mpg123", "mpg321" /* Same player, different name */]

// Various options to make sure players don't open any windows and exit when done.
const playerOptions: Dictonary<string[]> = { ffplay: ["-nodisp", "-autoexit"]
	                  					   , cvlc:   ["--play-and-exit"]};

// Delay between consecutive file plays when using loopPlayFile().
let delay = 100;



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
			throw `Unable to find any sound players on the system! (attempted to look for ${players})`;
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
	if (count === 0)
		return;

	playFile(filePath);
	setTimeout( () => loopPlayFile(filePath, count - 1, delay)
			  , delay);
}



// Stores previous error counts so we don't Vine boom unnecessarily ;).
let errorHistory: Dictonary<number> = {};

/**
 * Produces a Vine boom for every *new* error found from static analysis.
 */
function vineboomForErrors(event: vscode.DiagnosticChangeEvent) {
	for (const URI of event.uris) {
		const URIString = URI.toString();
		
		let errors = 0;
		for (const diagnostic of languages.getDiagnostics(URI))
			if (diagnostic.severity <= DiagnosticSeverity.Error)
				errors++;

		let boomableErrors = errors;
		if (URIString in errorHistory)
			boomableErrors -= errorHistory[URIString];

		if (boomableErrors > 0) 
			loopPlayFile(getVineBoomFile(), boomableErrors, delay);

		errorHistory[URIString] = errors;
	} 
}



export function activate(context: vscode.ExtensionContext) {
	const configuration = vscode.workspace.getConfiguration("vineBoomErrors");
	const playBoomOnError = configuration.get("playBoomOnError");
	_vineBoomFile = configuration.get("soundEffectLocation") || 
					`${context.extensionPath}/audio/vineboom.mp3`;
	delay = configuration.get("delay") || delay;
	players = configuration.get("players") || players;


	const playBoom = commands.registerCommand("vineBoomErrors.playBoom", () =>
		playFile(getVineBoomFile()));
	context.subscriptions.push(playBoom);

	vscode.languages.onDidChangeDiagnostics((event: vscode.DiagnosticChangeEvent) => {
		if (playBoomOnError) 
			vineboomForErrors(event);
	});
}

export function deactivate() {}
