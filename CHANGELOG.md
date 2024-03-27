# Change Log

- Switched to my own audio library player-sounder (https://www.npmjs.com/package/player-sounder) that fixes the problems I had with play-sound.
- Reloading is no longer neccessary to update which player is being used.
- Fixed weirdness with how the configuration was loaded, resulting in the above.
- Changed how the player list and player options configurations were loaded to account for player-sounder's defaults. The player list now uses player-sounder's when empty, but the user supplied list when not. The player options uses player-sounder's, overwriting any entries present in the user supplied options with the user's values. I reccommend checking to see if yours is configured correctly after these changes.

### 1.0.0

- Switched from play-sound to find-exec for playing audio files as play-sound didn't offer much in terms of functionality, and most of what it offered had to be overwritten anyways.
- Added ability to configure which audio players to use.
- Added ability to configure what arguments are used with which audio players.
- Configuration changes are now loaded live and only one remains that still requires reloading.
- Added ability to configure at which error severity level to play the Vine boom.

### 0.1.0

- Initial release.
