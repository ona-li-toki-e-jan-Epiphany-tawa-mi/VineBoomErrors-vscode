// TODO Possible add config option to select error severity.

import * as vscode from "vscode";
const commands  		 = vscode.commands;
const window      		 = vscode.window;
const languages			 = vscode.languages;
const workspace          = vscode.workspace;
const DiagnosticSeverity = vscode.DiagnosticSeverity;

const findExec = require("find-exec");
import { spawn } from "child_process";
import * as fs from "fs";
const R_OK = fs.constants.R_OK;

/**
 * A mapping between string keys and a given type. Just objects with a specified value type.
 */
 interface Dictionary<Type> {
	[key: string]: Type;
};



let playBoomOnError = true;

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
			  , "mpg123", "mpg321" /* Same player, different name */];

// Various options to make sure players don't open any windows and exit when done.
let playerOptions: Dictionary<string[]> = { ffplay: ["-nodisp", "-autoexit"]
	                  					 , cvlc:   ["--play-and-exit"]};

// Delay between consecutive file plays when using loopPlayFile().
let delay = 100;

/**
 * Loads data from the configuration into the global namespace.
 * @param event Leave null if not calling from workspace.onDidChangeConfiguration().
 */
function loadConfiguration(context: vscode.ExtensionContext, 
						   event: vscode.ConfigurationChangeEvent | null = null) {
	// If a ConfigurationChangeEvent and it isn't for us we don't need to do anything.
	if (event && !event.affectsConfiguration("vineBoomErrors"))
		return;
	
	const configuration = workspace.getConfiguration("vineBoomErrors");

	// Conditional assignments are used to satisfy TypeScript's typechecker. || is only used when a 
	// 		value being falsy is an invalid state, otherwise could lead to valid values being rejected.
	const tempPlayBoomOnError = configuration.get("playBoomOnError");
	playBoomOnError           = typeof tempPlayBoomOnError === "boolean" ? tempPlayBoomOnError 
																		 : playBoomOnError;

	_vineBoomFile = configuration.get("soundEffectLocation") || 
				    `${context.extensionPath}/audio/vineboom.mp3`;
	
	const tempDelay = configuration.get("delay");
	delay 			= typeof tempDelay === "number" ? tempDelay : delay;

	const tempPlayers = configuration.get("players");
	players = Array.isArray(tempPlayers) ? tempPlayers : players

	const tempPlayerOptions: Dictionary<string[]> | undefined = configuration.get("playerOptions");
	playerOptions = typeof tempPlayerOptions === "object" ? tempPlayerOptions : playerOptions;
}



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
	try {
		fs.accessSync(filePath, R_OK);
	} catch (error) {
		throw `An error occured while trying to open sound file "${_vineBoomFile}"; unable to open!". Description: ${error}`;
	}

	const player       = getPlayer();
	const args         = (playerOptions[player] || []).concat(filePath);
	const audioProcess = spawn(player, args);

	audioProcess.on('error', (code: number) =>
		window.showErrorMessage(`Something went wrong while trying to play "${filePath}" with ${player}. Error code: ${code}`));

	const onClose = new Promise((resolve) =>
		audioProcess.on('close', resolve))
		.then((code) => {
			if (code !== 0)
				window.showErrorMessage(`Something went wrong while trying to play "${filePath}" with ${player}. Error code: ${code}`);	
		});
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
let errorHistory: Dictionary<number> = {};

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
	loadConfiguration(context);

	const playBoom = commands.registerCommand("vineBoomErrors.playBoom", () =>
		playFile(getVineBoomFile()));
	context.subscriptions.push(playBoom);

	languages.onDidChangeDiagnostics((event: vscode.DiagnosticChangeEvent) => {
		if (playBoomOnError) 
			vineboomForErrors(event);
	});

	workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => 
		loadConfiguration(context, event));
}

export function deactivate() {}
