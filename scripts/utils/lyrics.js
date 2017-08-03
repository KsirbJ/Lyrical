import keys from "./keys"

// Find and pull lyrics from Genius
const $lyrics = {
	// initialize the message handler
	init_handler(){
		chrome.runtime.onMessage.addListener(function(request, sender){
			//console.log(request);
			if(request.message !== null){
				let lyrics = LZString.decompressFromUTF16(request.message.lyrics);
				$lyrics.display_lyrics(lyrics, request.message.url, request.message.domain, $lyrics.cur_song);
				//console.log("Lyrics from storage");
			}else{
				$lyrics.find_lyrics($lyrics.cur_song);
			}
		});
	},
	
	/**
	 *	Check if the lyrics are cached
	 *	
	 *	@param song {Object} - The song to find the lyrics for
	 */
	check_cache(song){
		let id = song.title + song.artist;
		chrome.runtime.sendMessage(
			{
				message: 'get-song', 
				id: id, 
			}
		);
	},

	/**
	 *	Display the lyrics on the page
	 *	
	 *	@param lyrics {string} - The lyrics to display
	 *	@param url {string} - The URL where we got the lyrics
	 *	@param domain {string} - The domain where we got the lyrics
	 *	@param song {Object} - The song we're working with
	 */
	display_lyrics(lyrics, url, domain, song){

		// add html tags to lyrics
		lyrics = lyrics.split(/\r?\n/);
		lyrics.forEach(function(element, index, arr){
			if(arr[index].trim() !== "")
				arr[index] = "<p>" + arr[index] + "</p>";
		});

		// Finally, show the lyrics
		$lyrics.$words.html(lyrics);

		// Kill any animations and scroll to the top
		$lyrics.$words.stop();
		$lyrics.$words.scrollTop(0);

		// Credit website
		$lyrics.$words.prepend(`<span id="credits">Lyrics from <a href="${url}" target="_blank">${domain}</a></span>`);

		song.callback_fcns[0](song.duration);
	},


	/**
	 *	Search Genius for lyrics 
	 *
	 *	@param song {object} - The song to find
	 */
	find_lyrics(song){
		let access_token = keys.genius;

		fetch('https://api.genius.com/search?access_token=' + access_token + '&q=' + 
			encodeURIComponent(song.title) + "%20" + encodeURIComponent(song.artist)).then(
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

		    		// console.log(hits[i].result.title);
		    		// console.log(hits[i].result.primary_artist.name);
		    		
		    		let g_title = hits[i].result.title.trim().toUpperCase();
		    		let g_artist = hits[i].result.primary_artist.name.trim().toUpperCase();
		    		// console.log("title: " + g_title);
		    		// console.log("artist: " + g_artist);
		    		
		    		// replace fancy curly quotes
		    		g_title = g_title.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
		    		g_artist = g_artist.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

		    		if((g_title.indexOf(song.title) !== -1 && g_artist.indexOf(song.artist) !== -1) || 
		    			(song.title.indexOf(g_title) !== -1 && song.artist.indexOf(g_artist) !== -1)  || 
		    			(song.artist.includes(g_title) && song.title.includes(g_artist))){

		    			found = true;

		    			// They have the song, now get the actual lyrics.
		    			let url = hits[i].result.url;
		    			song["url"] = url;

		    			$lyrics.pull_page(url, "Genius", song);
		    		}
		    	}
		    	// Looped through all the data and no lyrics found.
		    	if(!found){
		    		if(song.first_search)
		    			song.callback_fcns[1]();
		    		else
			    		$lyrics.$words.html("<div id='err_msg'><h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p></div>");
		    	}
	      
		}).catch(function(e){
	  		$lyrics.$words.html(`<div id='err_msg'><h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p>
				${e.message === "Couldn't make Genius request :(" ? `<p>Lyrical couldn't pull the lyrics from Genius. 
				This could be caused by a VPN, Proxy, or Firewall</p>`: ""}</div>`);
	  		console.error(e.message);
		});
	},


	/**
	 * Function to pull the lyrics page and extract the lyrics from it
	 *
	 * @param url {string} - The page to pull
	 * @param domain {string} - The domain of the page
	 * @param song {Object} - The song we're working on
	 */
	pull_page(url, domain, song){
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

			$lyrics.display_lyrics(actual_lyrics, url, domain, song);
			
			// Cache the lyrics for next time
			let key = song.title+song.artist;
			if($lyrics.og_song){
				key = $lyrics.og_song.title+$lyrics.og_song.artist;
				$lyrics.og_song = null;
			}
			let compressed = LZString.compressToUTF16(actual_lyrics);
			let cache_song = {id: key, lyrics: compressed, url: url, domain: domain, num_played: 1, scroll_stamps: []};
			chrome.runtime.sendMessage({message: 'store-song', song: cache_song});
			
			parser = null
			doc = null;


		}).catch(function(e){
			$lyrics.$words.html(`<div id='err_msg'><h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p>
					${e.message === "Couldn't make request :(" ? `<p>Lyrical couldn't pull the lyrics from Genius. 
					This could be caused by a VPN, Proxy, or Firewall</p>`: ""}</div>`);
			console.error("Fetch error: " + e.message);
		});
	},

	
	/**
	 *	Init function - Sets up data needed to get lyrics
	 *
	 *	@param song {Object} - The song to get lyrics for
	 *	@param  first_search {boolean} - If this is the first search for the lyrics
	 *	@param callback_fcns {Array} (optional) - An array of callback functions 
	 */
	get_lyrics(song, first_search, callback_fcns){	

		if(!$lyrics.init_done){
			$lyrics.init_handler();
			$lyrics.init_done = true;
		}

		// Make copy to avoid changing original
		let my_song = $.extend(true, {}, song);
		// Set cache
		this.$words = $("#words");

		// clean up the title and artist text
		let title = this.clean_text(my_song.title);
		let artist = this.clean_text(my_song.artist);
		title = title.trim().toUpperCase();
		artist = artist.trim().toUpperCase();

		// console.log(title);
		// console.log(artist);
		my_song.title = title;
		my_song.artist = artist;
		my_song.first_search = first_search;
		my_song.callback_fcns = callback_fcns;

		// console.log(my_song.title);
		// console.log(my_song.artist);

		if(!first_search)
			$lyrics.og_song = $lyrics.cur_song;
		$lyrics.cur_song = my_song;

		this.$words.empty();
		this.$words.html(`<div id="err_msg">Working...<br><img src="${chrome.extension.getURL('img/loader.gif')}"></div>`);

		// Pull the lyrics
		this.check_cache(my_song);
	},


	/**
	 *	Clean up text
	 *
	 *	@param text {string} - The text to clean up
	 *	@return {string} the clean text 
	 */
	clean_text(text){
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

	/**
	 *	Highlight a line of lyrics 
	 *
	 * @param index {int} - The line to highlight
	 */
	hightlight(index){
		if(index >= $("#words p").length || index < 0)
			index = 0;

		if($(`#words p:eq(${index})`).length >= 0){
			$("#words p").removeClass("highlight");

			$(`#words p:eq(${index})`).addClass('highlight');
			
			let offset = $(".highlight")[0].offsetTop;
			$lyrics.$words[0].scrollTop = offset - 40;
		}
	},

	// highlight previous line
	prev(){
		//console.log("prev : " + $("#words p.highlight").index());
		$lyrics.hightlight($("#words p.highlight").index() - 2);
	},

	// Highlight next line
	next(){
		//console.log("next : " + $("#words p.highlight").index());
		$lyrics.hightlight($("#words p.highlight").index());
	},

	$words: null,
	cur_song: null,
	init_done: false,
	og_song: null

}

export default $lyrics;