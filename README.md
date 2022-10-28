![VineBoomErrors Logo](images/icon.png)

# VineBoomErrors

Plays the Vine boom sound effect when your badly-written code generates errors.

## Features

- `Play the Vine boom sound effect` command to play the Vine boom... on command.
- When new errors are found through linting or static analysis because of your **_lackluster, maidenless craftmanship,_** the Vine boom sound effect will be played for each of them **individually.**

## Configuration

- `vineBoomErrors.playBoomOnError`
    - If true, plays the Vine boom sound effect when an error is produced by a linter or static analysis.
    - Default: `true`  
- `vineBoomErrors.soundEffectLocation`
    - If left blank, uses the Vine boom sound stored in the extension directory. You can put a path to another sound file to change the sound played.
    - Default: `""`
- `vineBoomErrors.delay`
    - The time, in milliseconds, to space apart each Vine boom.
    - Allowable values: `non-negative`
    - Default: `100`

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
  
## Release Notes

Initial release.

### 0.1.0

Initial release.

## Copyright

The logo is derived from Vine's logo © 2018 Twitter, Inc.