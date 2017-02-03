
// Find and pull lyrics from Genius and Metro Lyrics
const $lyrics = {

	// Function to pull the lyrics page and extract the lyrics from it
	pull_page: function(url, domain){
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
			$("#words").append(actual_lyrics);

			parser = null
			doc = null;

			// Credit website
			$("#words").prepend(`<span id="credits">Lyrics from <a href="${url}" target="_blank">${domain}</a></span>`);
		}).catch(function(e){
			console.error("Fetch error: " + e.message);
		});
	},
	
	// Function to pull lyrics from Genius
	get_lyrics: function(artist, title){

		console.log(artist);
		console.log(title);

		// clean up the title 
		title = $lyrics.clean_title(title);

		$("#words").empty();
		let access_token = "6xTujcUZfJUiPAssUT1jMwkkeeYWhMzLAOgXc5fPaWAdY0tz-UzE-EyrtYcOjoWo";

		fetch('https://api.genius.com/search?access_token=' + access_token + '&q=' + 
			encodeURIComponent(title) + "%20" + encodeURIComponent(artist)).then(function (response) {
		    	response.json().then(function (data) {

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

			    			$lyrics.pull_page(url, "Genius");
			    		}
			    	}
			    	// Looped through all the data and no lyrics found.
			    	if(!found){
			    		$("#words").html("<div id='err_msg'><h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p></div>");

			    		// TODO Search additional lyric databases
			    	}
		      
		  		});
			});
	},

		// Clean up the title text
	clean_title: function(title){

		// remove anything in parentheses or brackets
		title = title.replace(/ *\([^)]*\) */gi, " ").replace(/ *\[.*?\] */gi, " ");
		// remove curly quotes
		title = title.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

		// remove any featuring x from the title because this causes issues
		let ft = null;
		if(title.toLowerCase().indexOf("featuring") !== -1 )
			ft = "featuring";
		else if(title.toLowerCase().indexOf("feat") !== -1)
			ft = "feat";
		else if(title.toLowerCase().indexOf("ft.") !== -1)
			ft = "ft.";

		if(ft){
			let regex = new RegExp(ft + '.*$', 'i');
			title = title.replace(regex, "");
		}

		return title;
	}

}

export default $lyrics;