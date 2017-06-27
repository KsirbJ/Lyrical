import keys from "./keys"

// Find and pull lyrics from Genius
const $lyrics = {
	init: function(){

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
	check_cache: function(song){
		
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
	 */
	display_lyrics: function(lyrics, url, domain, song){

		// add html tags to lyrics
		lyrics = lyrics.split(/\r?\n/);
		lyrics.forEach(function(element, index, arr){
			if(arr[index].trim() !== "")
				arr[index] = "<p>" + arr[index] + "</p>";
		});

		// Finally, show the lyrics
		$lyrics.$words.html(lyrics);

		// Credit website
		$lyrics.$words.prepend(`<span id="credits">Lyrics from <a href="${url}" target="_blank">${domain}</a></span>`);

		$lyrics.autoscroll(song.duration);
	},


	/**
	 *	Search Genius for lyrics 
	 *
	 *	@param song {object} - The song to find
	 */
	find_lyrics: function(song){
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

		    		//console.log(hits[i].result.title);
		    		//console.log(hits[i].result.primary_artist.name);
		    		
		    		let g_title = hits[i].result.title.trim().toUpperCase();
		    		let g_artist = hits[i].result.primary_artist.name.trim().toUpperCase();
		    		
		    		// replace fancy curly quotes
		    		g_title = g_title.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
		    		g_artist = g_artist.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

		    		if((g_title.indexOf(song.title) !== -1 && g_artist.indexOf(song.artist) !== -1) || 
		    			(title.indexOf(g_title) !== -1 && artist.indexOf(g_artist) !== -1) ){

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
		    			song.callback();
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


	// Function to pull the lyrics page and extract the lyrics from it
	pull_page: function(url, domain, song){
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
			
			let key = song.title+song.artist;
			let compressed = LZString.compressToUTF16(actual_lyrics);
			
			// Cache the lyrics for next time
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

	
	// Init function - Sets up data needed to get lyrics
	get_lyrics: function(song, first_search, callback){	

		if(!$lyrics.init_done){
			$lyrics.init();
			$lyrics.init_done = true;
		}

		// Make copy to avoid changing original
		let my_song = $.extend(true, {}, song);
		// Set cache
		this.$words = $("#words");

		// clean up the title 
		let title = this.clean_text(my_song.title);
		let artist = this.clean_text(my_song.artist);
		title = title.trim().toUpperCase();
		artist = artist.trim().toUpperCase();

		let split_dur = my_song.duration.split(":");
		let in_milli = Number(split_dur[0]) * 60000 + Number(split_dur[1]) * 1000;


		// console.log(title);
		// console.log(artist);
		my_song.title = title;
		my_song.artist = artist;
		my_song.duration = in_milli;
		my_song.first_search = first_search;
		my_song.callback = callback;

		$lyrics.cur_song = my_song;

		this.$words.empty();
		this.$words.html(`<div id="err_msg">Working...<br><img src="${chrome.extension.getURL('img/loader.gif')}"></div>`);

		// Pull the lyrics
		this.check_cache(my_song);
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

	/**
	 *	Autoscroll the lyrics 
	 *
	 *	@param in_milli {int} - The length of the song in milliseconds
	 */
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

	/**
	 *	Highlight a line of lyrics 
	 *
	 * @param index {int} - The line to highlight
	 */
	hightlight: function(index){
		//console.log("index :" + index);

		if(index >= $("#words p").length || index < 0)
			index = 1;

		if($(`#words p:eq(${index})`).length >= 0){
			$("#words p").removeClass("highlight");

			$(`#words p:eq(${index})`).addClass('highlight');
			
			let offset = $(".highlight")[0].offsetTop;
			$lyrics.$words[0].scrollTop = offset - 40;
		}
	},

	// highlight previous line
	prev: function(){
		//console.log("prev : " + $("#words p.highlight").index());
		$lyrics.hightlight($("#words p.highlight").index() - 2);
	},

	// Highlight next line
	next: function(){
		//console.log("next : " + $("#words p.highlight").index());
		$lyrics.hightlight($("#words p.highlight").index());
	},

	$words: null,
	cur_song: null,
	init_done: false

}

export default $lyrics;