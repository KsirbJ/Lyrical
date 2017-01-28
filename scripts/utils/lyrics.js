import $CORS from 'scripts/utils/CORS'

const $lyrics = {
	
	// Function to pull lyrics from Genius
	get_lyrics: function(artist, title){

		console.log(artist);
		console.log(title);
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

			    		if((g_title.indexOf(title) !== -1 && g_artist.indexOf(artist) !== -1) || 
			    			(title.indexOf(g_title) !== -1 && artist.indexOf(g_artist) !== -1) ){

			    			found = true;

			    			// They have the song, now get the actual lyrics.
			    			let url = hits[i].result.url;
			    			$CORS.makeCorsRequest(url);
			    		}
			    	}
			    	// Looped through all the data and no lyrics found.
			    	if(!found){
			    		$("#words").html("<div id='err_msg'><h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p></div>");

			    		// TODO Search additional lyric databases
			    	}
		      
		  		});
			});
	}

}

export default $lyrics;