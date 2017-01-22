// utility functions to deal with CORS requests

const $CORS = {
	// Create the XHR object. (https://www.html5rocks.com/en/tutorials/cors/)
	createCORSRequest: function(method, url) {
		let xhr = new XMLHttpRequest();
		if ("withCredentials" in xhr) {
			xhr.open(method, url, true);
		} else {
			// CORS not supported.
			xhr = null;
		}
		return xhr;
	},

	extract_lyrics: function(text){
		// Find lyrics in the returned document
		let parser = new DOMParser();
		let doc = parser.parseFromString(text, 'text/html');
		let actual_lyrics = $(doc).find(".lyrics").text();

		// add html tags to lyrics
		actual_lyrics = actual_lyrics.split(/\r?\n/);
		actual_lyrics.forEach(function(element, index, arr){
			arr[index] = "<p>" + arr[index] + "</p>";
		});

		// Finally, show the lyrics
		$("#lyrics").append(actual_lyrics);

		parser = null
		doc = null;
	},

	// Make the actual CORS request.
	makeCorsRequest: function(url) {

		let xhr = $CORS.createCORSRequest('GET', url);
		if (!xhr) {
			console.log('CORS not supported');
			return;
		}

		// Response handlers.
		xhr.onload = function() {
			let text = xhr.responseText;

			$CORS.extract_lyrics(text);
			
			// Credit website
			$("#lyrics").prepend(`<p style="text-align:right">Lyrics from <a href="${url}" target="_blank">Genius</a></p>`);

			// Clean up
			xhr = null;

		};

		xhr.onerror = function() {
			console.err("xhr request failed");
		};

		xhr.send();
	}
}

export default $CORS;
	