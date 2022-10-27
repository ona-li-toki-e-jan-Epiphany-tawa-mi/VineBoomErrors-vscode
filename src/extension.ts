// TODOOOOOOO: Detect when compile and runtime errors occur.
// TODOOOOOOO: Finish making the best quality extension that ever was.
// TODO Possibly ditch play-sound dependency and use find-exec as play-sound doesn't offer much and 
//   can easily be replicated.

import * as vscode from "vscode";
const playsound = require("play-sound")({
	// Must be mp3 compatible.
	// TODOO: omxplayer and cmdmp3win have not been tested.
	players: [ "mplayer", "mpv", "ffplay", "omxplayer", "cmdmp3win"
             , "cvlc" /* from VLC */, "play" /* from SoX */
			 , "mpg123", "mpg321" /* Same player, different name */]
});



// Various options to make sure players don't open any windows and exit when done.
const playerOptions = { ffplay: ["-nodisp", "-autoexit"]
	                  , cvlc:   ["--play-and-exit"]};

/**
 * Plays the audio file pointed to by the given path with one of the available players.
 * @param filePath audio file path.
 */
function playFile(filePath: string) {
	playsound.play(filePath, playerOptions, (error: any) => {
		if (error) throw error;});
}



export function activate(context: vscode.ExtensionContext) {
	let vineBoomFile = `${context.extensionPath}/audio/vineboom.mp3`;

	let start = vscode.commands.registerCommand("vineBoomErrors.playBoom", () =>
		playFile(vineBoomFile));

	context.subscriptions.push(start);
}

export function deactivate() {}
