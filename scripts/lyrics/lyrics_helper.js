// Provides auxiliary functions to help pull lyrics
export class LyricsHelper {
	constructor(){
		this._cur_song = null;
		this._og_song = null;
		this._lyric_panel = null;
	}

	set cur_song(song){
		this._cur_song = song;
		this._cur_song.title = this.cleanText(song.title);
		this._cur_song.artist = this.cleanText(song.artist);
	}

	set og_song(song){
		this._og_song = song;
	}

	get og_song(){
		return this._og_song;
	}

	get cur_song(){
		return this._cur_song;
	}

	set lyric_panel($panel){
		this._lyric_panel = $panel;
	}

	cleanText(text){
		text = text.trim().toLowerCase();
		text = text.replace(/ *\([^)]*\) */gi, " ").replace(/ *\[.*?\] */gi, " ");
		text = text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
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
	}

	/**
	 *	Function to pull a page 
	 *	@param url {string} - The page to pull
	 *	@param type {String} - JSON or text response
	 */
	pullPage(url, type){
		return new Promise((resolve, reject) => {
			let myHeaders = new Headers();
			let myInit = {
				method: 'GET',
				headers: myHeaders,
				mode: 'cors',
				cache: 'default'
			}
			fetch(url, myInit)
			.then(response => {
				if(response.ok){
					type === 'text' ? resolve(response.text()) : resolve(response.json());
				}
				reject(new Error("Couldn't make request :("));

			})
			.catch(function(e){
				reject(e);
			});
		});		
	}

	checkCache(){
		let id = this._cur_song.title + this._cur_song.artist;
		id = id.toUpperCase();
		chrome.runtime.sendMessage(
			{
				message: 'get-song', 
				id: id, 
			}
		);
	}

	/**
	 *	Display the lyrics on the page	
	 *	@param lyrics {string} - The lyrics to display
	 *	@param url {string} - The URL where we got the lyrics
	 *	@param domain {string} - The domain where we got the lyrics
	 */
	displayLyrics(lyrics, url, domain){
		// add html tags to lyrics
		lyrics = lyrics.split(/\r?\n/);
		lyrics.forEach(function(element, index, arr){
			if(arr[index].trim() !== "")
				arr[index] = "<p>" + arr[index] + "</p>";
		});

		// Finally, show the lyrics
		this._lyric_panel.html(lyrics);
		this._lyric_panel.stop();
		this._lyric_panel.scrollTop(0);
		// Credit website
		this._lyric_panel.prepend(`<span id="credits">Lyrics from <a href="${url}" target="_blank">${domain}</a></span>`);

		if(this._cur_song.callback_fcns && this._cur_song.callback_fcns[0])
			this._cur_song.callback_fcns[0](this._cur_song.duration);
	}

	// Cache song
	cacheSong(){
		let key = this._cur_song.title+this._cur_song.artist;
		if(this._og_song){
			key = this._og_song.title+this._og_song.artist;
			this._og_song = null;
		}
		key = key.toUpperCase();
		const compressed = LZString.compressToUTF16(this._cur_song.lyrics);
		const song_for_cache = {
			id: key, 
			lyrics: compressed, 
			url: this._cur_song.url, 
			domain: this.cur_song.domain, 
			num_played: 1, 
			scroll_stamps: []
		};
		chrome.runtime.sendMessage({message: 'store-song', song: song_for_cache});
	}

	/**
	 *	Display a message
	 *	@param msg {String} - The message to show
	 */
	errorMessage(msg){
		this._lyric_panel.html(msg);
	}
}

export const Highlighter = {
	/**
	 *	Highlight a line of lyrics 
	 *  @param index {int} - The line to highlight
	 */
	hightlight(index){
		if(index >= $("#words p").length || index < 0)
			index = 0;

		if($(`#words p:eq(${index})`).length >= 0){
			$("#words p").removeClass("highlight");
			$(`#words p:eq(${index})`).addClass('highlight');	

			const offset = $(".highlight")[0].offsetTop;
			$("#words")[0].scrollTop = offset - 40;
		}
	},

	// highlight previous line
	prev(){
		this.hightlight($("#words p.highlight").index() - 2);
	},

	// Highlight next line
	next(){
		this.hightlight($("#words p.highlight").index());
	}
}