/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import * as vscode from "vscode";
const commands			 = vscode.commands;
const window			 = vscode.window;
const languages			 = vscode.languages;
const workspace          = vscode.workspace;
const DiagnosticSeverity = vscode.DiagnosticSeverity;
type  DiagnosticSeverity = vscode.DiagnosticSeverity;

import * as playerSounder from "player-sounder";
type Dictionary<Type> = playerSounder.Dictionary<Type>;



/*
 * MIT License
 *
 * Copyright (c) 2022 ona-li-toki-e-jan-Epiphany-tawa-mi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */



/**
 * Configuration option paths packed into a neat little enum.
 */
enum Configuration {
	SECTION               = "vineBoomErrors",

	PLAY_BOOM_ON_ERROR    = "playBoomOnError",
	SOUND_EFFECT_LOCATION = "soundEffectLocation",
	DELAY				  = "delay",
	PLAYERS				  = "players",
	PLAYER_OPTIONS		  = "playerOptions",
	MINIMUM_SEVERITY	  = "minimumSeverity"
}

/**
 * Whether to play the Vine boom if an error occurs.
 */
let playBoomOnError: boolean = true;
/**
 * The sound effect to use. Defaults to the Vine boom.
 */
let vineBoomFile: string = "";
/**
 * Players with which to play the Vine boom. Must be mp3 compatible.
 */
let players: string[] = playerSounder.players;
/**
 * Various options to make sure players don't open any windows and exit when done.
 */
let playerOptions: Dictionary<string[]> = playerSounder.playerOptions;
/**
 * Delay between consecutive file plays when using loopPlayFile().
 */
let delay: number = 100;
/**
 * The minimum diagnostic severity level at which to play the Vine boom.
 */
let minimumSeverity: DiagnosticSeverity = DiagnosticSeverity.Error;

/**
 * Loads data from the configuration into the global namespace.
 * Must be called once at activation.
 *
 * @param event Leave null if not calling from {@link vscode#workspace#onDidChangeConfiguration}.
 */
function loadConfiguration(context: vscode.ExtensionContext,
						   event: vscode.ConfigurationChangeEvent | null = null) : void {
	function throwNoFetch(configurationName: string, recievedValue: any) : void {
		throw new Error(`ERROR: Unable to fetch configuration "${Configuration.SECTION}.${configurationName}"! Recieved: ${playBoomOnError}`);
	}

	// If a ConfigurationChangeEvent occurs and it isn't for us we don't need to do anything.
	if (event && !event.affectsConfiguration(Configuration.SECTION))
		return;

	const configuration = workspace.getConfiguration(Configuration.SECTION);


	let newPlayBoomOnError = configuration.get(Configuration.PLAY_BOOM_ON_ERROR);
	if (typeof newPlayBoomOnError !== "boolean")
		throwNoFetch(Configuration.PLAY_BOOM_ON_ERROR, newPlayBoomOnError);
	playBoomOnError = newPlayBoomOnError as boolean;

	let newVineBoomFile = configuration.get(Configuration.SOUND_EFFECT_LOCATION);
	if (typeof newVineBoomFile !== "string")
		throwNoFetch(Configuration.SOUND_EFFECT_LOCATION, newVineBoomFile);
	vineBoomFile = newVineBoomFile ? newVineBoomFile as string
								   : `${context.extensionPath}/audio/vineboom.mp3`;

	let newDelay = configuration.get(Configuration.DELAY);
	if (typeof newDelay !== "number")
		throwNoFetch(Configuration.DELAY, newDelay);
	delay = newDelay as number;

	let newPlayers = configuration.get(Configuration.PLAYERS);
	if (!Array.isArray(newPlayers) || !newPlayers.every((element) => typeof element === "string"))
		throwNoFetch(Configuration.PLAYERS, newPlayers);
	players = (newPlayers as string[]).length > 0 ? newPlayers as string[]
												  : playerSounder.players;
	playerSounder.reselectPlayer(players);

	// Merges specified options into all player options.
	let newPlayerOptions = configuration.get(Configuration.PLAYER_OPTIONS);
	if (typeof newPlayerOptions !== "object"
			|| !Object.values(newPlayerOptions as object).every((value) => Array.isArray(value)
																		&& value.every((element) => typeof element === "string")))
		throwNoFetch(Configuration.PLAYER_OPTIONS, newPlayerOptions);
	playerOptions = { ...playerSounder.playerOptions
					, ...newPlayerOptions as object};

	let newMinimumSeverity = configuration.get(Configuration.MINIMUM_SEVERITY);
	if (typeof newMinimumSeverity !== "string" || !(newMinimumSeverity as string in DiagnosticSeverity))
		throwNoFetch(Configuration.MINIMUM_SEVERITY, newMinimumSeverity);
	minimumSeverity = DiagnosticSeverity[newMinimumSeverity as keyof typeof DiagnosticSeverity];
}



/**
 * Plays the given audio file with one of the available players. Returns when done.
 * @param filePath audio file path.
 */
async function playFile(filePath: string): Promise<void> {
	try {
		let audioProcess = playerSounder.playFile(filePath, playerOptions);

		let errorCode = await playerSounder.onClose(audioProcess);
		if (errorCode !== 0)
			window.showErrorMessage(`Something went wrong while trying to play "${filePath}" with ${playerSounder.getAvaliblePlayer()}. Error code: ${errorCode}`);

	} catch (error) {
		window.showErrorMessage(`An error occured while trying to open sound file "${filePath}"; unable to open!". Description: ${error}`);
	}
}

/**
 * Plays the given audio file {count} times, spaced out by given delay, in milliseconds.
 *
 * @param filePath  audio file path.
 * @param count     number of times to play it.
 * @param delay     amount of time to space out each play by.
 */
function loopPlayFile(filePath: string, count: number, delay: number) : void {
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
function vineboomForErrors(event: vscode.DiagnosticChangeEvent) : void {
	for (const URI of event.uris) {
		const URIString = URI.toString();

		let errors = 0;
		for (const diagnostic of languages.getDiagnostics(URI))
			if (diagnostic.severity <= minimumSeverity)
				errors++;

		let boomableErrors = errors;
		if (URIString in errorHistory)
			boomableErrors -= errorHistory[URIString];

		if (boomableErrors > 0)
			loopPlayFile(vineBoomFile, boomableErrors, delay);

		errorHistory[URIString] = errors;
	}
}



/**
 * VineBoomErrors, Plays the Vine boom sound effect when your badly-written code generates errors.
 *
 * @author ona li toki e jan Epiphany tawa mi.
 */
export function activate(context: vscode.ExtensionContext) : void {
	loadConfiguration(context);

	const playBoom = commands.registerCommand("vineBoomErrors.playBoom", () =>
		playFile(vineBoomFile));
	context.subscriptions.push(playBoom);

	languages.onDidChangeDiagnostics((event: vscode.DiagnosticChangeEvent) => {
		if (playBoomOnError)
			vineboomForErrors(event);
	});

	workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) =>
		loadConfiguration(context, event));
}

export function deactivate() : void {}
