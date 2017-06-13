import keys from "../utils/keys"
// Find and pull lyrics from Genius
const $lyrics = {

	// Function to pull the lyrics page and extract the lyrics from it
	pull_page: function(url, domain, in_milli){
		let myHeaders = new Headers();
		let myInit = {
			method: 'GET',
			headers: myHeaders,
			mode: 'cors',
			cache: 'default'
		}
		// Make the request
		fetch(url, myInit).then(function(response){
			if(response.ok){
				return response.text();
			}
			throw new Error("Couldn't make request :(");

		}).then(function(text){
			// find the lyrics
			let parser = new DOMParser();
			let doc = parser.parseFromString(text, 'text/html');
			let actual_lyrics = $(doc).find(".lyrics").text();

			// add html tags to lyrics
			actual_lyrics = actual_lyrics.split(/\r?\n/);
			actual_lyrics.forEach(function(element, index, arr){
				arr[index] = "<p>" + arr[index] + "</p>";
			});

			// Finally, show the lyrics
			$lyrics.$words.html(actual_lyrics);

			parser = null
			doc = null;

			// Credit website
			$lyrics.$words.prepend(`<span id="credits">Lyrics from <a href="${url}" target="_blank">${domain}</a></span>`);
			$lyrics.$words.append('<div id="bottom"></div>');

			$lyrics.autoscroll(in_milli);

		}).catch(function(e){
			$lyrics.$words.html("<div id='err_msg'><h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p></div>");
			console.error("Fetch error: " + e.message);
		});
	},
	
	// Function to pull lyrics from Genius
	get_lyrics: function(song, first_search, callback){	

		// Set cache
		$lyrics.$words = $("#words");

		// clean up the title 
		let title = this.clean_text(song.title);
		let artist = this.clean_text(song.artist);
		let split_dur = song.duration.split(":");
		let in_milli = Number(split_dur[0]) * 60000 + Number(split_dur[1]) * 1000;

		// console.log(title);
		// console.log(artist);

		$lyrics.$words.empty();
		$lyrics.$words.html(`<div id="err_msg">Working...<br><img src="${chrome.extension.getURL('img/loader.gif')}"></div>`);
		let access_token = keys.genius;

		fetch('https://api.genius.com/search?access_token=' + access_token + '&q=' + 
			encodeURIComponent(title) + "%20" + encodeURIComponent(artist)).then(
			function (response) {
				if(response.ok)
					return response.json();
				throw new Error("Couldn't make Genius request :(");
			}).then(
			function (data) {

		    		// Go through the data returned by Genius and check whether they have lyrics for this song.
			    	let hits = data.response.hits || 0;
			    	let found = false;
			    	for(let i = 0; i < hits.length && !found; ++i){

			    		//console.log(hits[i].result.title);
			    		//console.log(hits[i].result.primary_artist.name);
			    		
			    		title = title.trim().toUpperCase();
			    		artist = artist.trim().toUpperCase();
			    		let g_title = hits[i].result.title.trim().toUpperCase();
			    		let g_artist = hits[i].result.primary_artist.name.trim().toUpperCase();
			    		
			    		// replace fancy curly quotes
			    		g_title = g_title.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
			    		artist = artist.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
			    		g_artist = g_artist.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

			    		if((g_title.indexOf(title) !== -1 && g_artist.indexOf(artist) !== -1) || 
			    			(title.indexOf(g_title) !== -1 && artist.indexOf(g_artist) !== -1) ){

			    			found = true;

			    			// They have the song, now get the actual lyrics.
			    			let url = hits[i].result.url;

			    			$lyrics.pull_page(url, "Genius", in_milli);
			    		}
			    	}
			    	// Looped through all the data and no lyrics found.
			    	if(!found){
			    		if(first_search)
			    			callback();
			    		else
				    		$lyrics.$words.html("<div id='err_msg'><h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p></div>");
			    	}
		      
		  	}).catch(function(e){
		  		$lyrics.$words.html("<div id='err_msg'><h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p></div>");
		  		console.error(e.message);
		  	});
	},

	/**
	 *	Clean up text
	 *
	 *	@param text - The text to clean up
	 *	@return {string} the clean text 
	 */
	clean_text: function(text){
		text = text.toLowerCase();

		// remove anything in parentheses or brackets
		text = text.replace(/ *\([^)]*\) */gi, " ").replace(/ *\[.*?\] */gi, " ");
		// remove curly quotes
		text = text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

		// replace all variations of Ø with o 
		text = text.replace(/[\u2205\u00D8\u00F8\u2300]/gi, 'o');

		// remove any featuring x from the title because this causes issues
		let ft = null;
		if(text.indexOf("featuring") !== -1 )
			ft = "featuring";
		else if(text.indexOf("feat") !== -1)
			ft = "feat";
		else if(text.indexOf("ft.") !== -1)
			ft = "ft.";

		if(ft){
			let regex = new RegExp(ft + '.*$', 'i');
			text = text.replace(regex, "");
		}

		// remove any "produced by" text
		let prod = null;
		if(text.indexOf('produced by') !== -1)
			prod = 'produced by';
		else if(text.indexOf('prod. by') !== -1)
			prod = 'prod. by';

		if(prod){
			let regex = new RegExp(prod + '.*$', 'i');
			text = text.replace(regex, "");
		}

		return text;
	},

	autoscroll: function(in_milli){
		chrome.storage.sync.get({'autoscroll': false}, function(response){
			if(response.autoscroll){
				$lyrics.$words.stop();
				$lyrics.$words.scrollTop(0);

				$lyrics.$words.bind('scroll mousedown wheel DOMMouseScroll mousewheel keyup keydown', function(e){
					if ( e.which > 0  || e.type == "mousedown" || e.type == "mousewheel"){
						$lyrics.$words.stop();
					}
				});
				$lyrics.$words.scroll();
				$lyrics.$words.animate({ scrollTop: $("#words")[0].scrollHeight}, in_milli);
			}
		});
	},

	$words: null

}

export default $lyrics;