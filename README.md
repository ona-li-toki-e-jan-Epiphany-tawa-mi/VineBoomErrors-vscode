![VineBoomErrors Logo](images/icon.png)

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
    - The command-line players to play the Vine boom effect with. Uses the first one found to be present, searching from left to right. If one of the present players causes issues, remove it. If your player is not present, add it to the front. Must be compatible with MP3s.
    - Default: `["mplayer", "mpv", "ffplay", "omxplayer", "cmdmp3win", "cvlc", "play", "mpg123"]`
    - Reload for changes to take effect.
- `vineBoomErrors.playerOptions`
    - Command-line options to supply to the players. Keys are the names of the players and must be the same as in `vineBoomErrors.players`. At a minimum, any options that close the player after playing and prevent it from opening any windows are required if that is not the default behavior.
    - Default: `{"ffplay": ["-nodisp", "-autoexit"], "cvlc": ["--play-and-exit"]}`

## How to build

Make sure you have [Node.js](https://nodejs.org/en "Node.js website.") and [vsce](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#vsce "VSCode help page on vsce.") installed on your system.

Run the following command(s) within the project directory.

```console
vsce package
```

## Installation

VineBoomErrors can be installed directly from the [VSCode Marketplace.](https://marketplace.visualstudio.com/items?itemName=onalitokiejanEpiphanytawami.vineboomerrors "VineBoomErros page on VSCode Marketplace.")

Alternatively you could download the latest .vsix package from [RELEASES,](https://github.com/ona-li-toki-e-jan-Epiphany-tawa-mi/VineBoomErrors-vscode/releases "Releases for VineBoomErrors.") or compile from source, and install it manually, which can be done either in [the extensions side tab,](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix "VSCode help page on installing extensions from .vsix.") or by running the following command(s):

```console
code --install-extension <package name goes here>
```

Make sure to reload or restart Visual Studio Code after installing .

## Copyright

The logo is derived from Vine's logo © 2018 Twitter, Inc.