# Lyrical #

## Chrome Lyrics Extension ##

This chrome extension displays lyrics for songs on Youtube, Google Play Music, and Spotify Web Player(for now)

### Features ###
* Instantly get lyrics for songs on YouTube and Google Play Music
* The lyrics panel can be integrated into the page, or popped-out
* When popped out, the panel can be resized and moved anywhere on the page 
* You can select on which of the supported websites the extension should run
* You can modify other default extension behavior
* Use Ctrl + Shift + S to toggle the lyrics panel
* Easily translate the lyrics to 80+ languages
* You can move to and highlight the next or previous line using right and left arrow keys

For a complete overview / guide click the "Options & How-To" button in the extension.

### How to install ###

You can get the live version of this extension [here](https://chrome.google.com/webstore/detail/lyrical/dkbbaocemdcnifbnpdbfklbnfoahmokg)

Alternatively:

* Clone this project
* Obtain a [Genius API key](https://genius.com/api-clients)
* Obtain a [Yandex API key](https://tech.yandex.com/keys/)
* In the `scripts/utils` directory create a file called `keys.js`. The file should contain the following:
```javascript
const keys = {
	genius: "<Your Genius API key>",
	yandex: "<Your Yandex Translate API key>"
}
export default keys
```
* Download [Google Closure Compiler](https://developers.google.com/closure/compiler/), and make sure the compiler variable in Makefile has the right location.
* Run `make` or `make compile`. This will run the closure compiler and generate the required files.
* Follow the steps [here](https://developer.chrome.com/extensions/getstarted#unpacked) to install the extension in Chrome.




