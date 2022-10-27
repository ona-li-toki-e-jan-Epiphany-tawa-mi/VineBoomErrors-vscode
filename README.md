# VineBoomErrors

Plays the Vine boom sound effect when your badly-written code generates errors.

## Features

- `Play the Vine boom sound effect` command to play the Vine boom... on command.
- When new errors are found through linting or static analysis because of your **_lackluster, maidenless craftmanship,_** the Vine boom sound effect will be played for each of them **individually.**

## Configuration.

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
  
## Release Notes

Initial release.

### 0.1.0

Initial release.
