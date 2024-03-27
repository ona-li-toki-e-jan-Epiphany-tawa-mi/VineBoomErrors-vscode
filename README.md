![VineBoomErrors Logo](images/icon.png)

**!!NOTICE!!:** This will not be updated as I no longer use VSCode.

# VineBoomErrors

Plays the Vine boom sound effect when your badly-written code generates errors.

## Features

- `Play the Vine boom sound effect` command to play the Vine boom... on command.
- When new errors are found through linting or static analysis because of your **_lackluster, maidenless craftmanship,_** the Vine boom sound effect will be played for each of them **individually.**

## Configuration

- `vineBoomErrors.playBoomOnError`
    - If `true`, plays the Vine boom sound effect when an error is produced by a linter or static analysis.
    - Default: `true`
- `vineBoomErrors.soundEffectLocation`
    - If left blank, uses the Vine boom sound stored in the extension directory. You can put a path to another sound file to change the sound played.
    - Default: `""`
- `vineBoomErrors.delay`
    - The time, in milliseconds, to space apart each Vine boom.
    - Allowable values: `non-negative`
    - Default: `100`
- `vineBoomErrors.players`
    - The command-line players to play the Vine boom effect with. Uses the first one found to be present, searching from first to last. If left blank, uses the player list supplied by player-sounder (https://www.npmjs.com/package/player-sounder). "player-sounder npm entry") Must be compatible with MP3s.
    - Default: `[]` (`"mplayer"`, `"mpv"`, `"ffplay"`, `"cvlc"`, `"play"`, `"mpg123"`, and `"mpg321"` from player-sounder as of version 1.0.0.)
- `vineBoomErrors.playerOptions`
    - Command-line options to supply to the players. Keys are the names of the players and must be the same as in `vineBoomErrors.players`. At a minimum, any options that close the player after playing and prevent it from opening any windows are required if that is not the default behavior. Uses the player options supplied by player-sounder (https://www.npmjs.com/package/player-sounder) by default. Any options supplied here will superceed those supplied by player-sounder.
    - Default: `{}` (`ffplay: ["-nodisp", "-autoexit"]` and `cvlc: ["--play-and-exit"]` from player-sounder as of version 1.0.0.)
- `vineBoomErrors.minimumSeverity`
    - The minimum diagnostic severity level at which to play the Vine boom. Choosing an option also chooses all of the options before it.
    - Allowable values: `"Error"`, `"Warning"`, `"Information"`, `"Hint"`
    - Default: `"Error"`

## How to build

Make sure you have Node.js and vsce
(https://code.visualstudio.com/api/working-with-extensions/publishing-extension#vsce)
installed on your system.

Run the following command(s) within the project directory:

```console
vsce package
```

## Installation

After building from source, you can either install it via the extensions side
tab
(https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix)
or by running the following command(s):

```console
code --install-extension <package name goes here>
```

Make sure to reload or restart Visual Studio Code after installing.

## Release Notes

- Switched to my own audio library player-sounder (https://www.npmjs.com/package/player-sounder) that fixes the problems I had with play-sound.
- Reloading is no longer neccessary to update which player is being used.
- Fixed weirdness with how the configuration was loaded, resulting in the above.
- Changed how the player list and player options configurations were loaded to account for player-sounder's defaults. The player list now uses player-sounder's when empty, but the user supplied list when not. The player options uses player-sounder's, overwriting any entries present in the user supplied options with the user's values. I reccommend checking to see if yours is configured correctly after these changes.
