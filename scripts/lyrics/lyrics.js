'use strict'

import keys from "../utils/keys.js"
import {LyricsHelper, Highlighter} from "./lyrics_helper.js"

const GENIUS_TOKEN = keys.genius;

// Find and display lyrics from Genius.com
class GeniusLyrics {
	constructor(lyric_helper){
		this._helper = lyric_helper;
	}

	/**
	 *	Search Genius for lyrics 
	 *	@param song {object} - The song to find
	 */
	find(){
		const song = this._helper.cur_song;
		const url = 'https://api.genius.com/search?access_token=' + GENIUS_TOKEN + '&q=' + 
			encodeURIComponent(song.title) + "%20" + encodeURIComponent(song.artist);

		this._helper.pullPage(url, 'json')
		.then(data => {
    		// Go through the data returned by Genius and check whether they have lyrics for this song.
	    	let hits = data.response.hits || 0;
	    	let found = false;
	    	for(let i = 0; i < hits.length && !found; ++i){
	    		
	    		let g_title = hits[i].result.title.trim().toLowerCase();
	    		let g_artist = hits[i].result.primary_artist.name.trim().toLowerCase();
	    		
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
	    			this.pull();
	    		}
	    	}
	    	// Looped through all the data and no lyrics found.
	    	if(!found){
	    		if(song.first_search){
	    			this._helper.og_song = song;
	    			song.callback_fcns[1]();
	    		}
	    		else
		    		this._helper.errorMessage(
		    			"<div id='err_msg'><h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p></div>");
	    	}      
		})
		.catch(e => {
	  		this.error(e);
		});
	}

	/**
	 * Function to pull the lyrics page and extract the lyrics from it
	 * @param url {string} - The page to pull
	 * @param song {Object} - The song we're working on
	 */
	pull(){
		const song = this._helper._cur_song;
		this._helper.pullPage(song.url, 'text')
		.then(text => {
			// find the lyrics
			let parser = new DOMParser();
			let doc = parser.parseFromString(text, 'text/html');
			let actual_lyrics = $(doc).find(".lyrics").text();
			song.lyrics = actual_lyrics;
			song.domain = "genius";
			// Display lyrics
			this._helper.displayLyrics(actual_lyrics, song.url, song.domain);
			// Cache		
			this._helper.cacheSong();
	
			parser = doc = actual_lyrics = null;
		}).catch(e => {
			this.error(e, this._$lyrics);
		});
	}

	error(e){
		this._helper.errorMessage(`<div id='err_msg'><h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p>
				${e.message === "Couldn't make Genius request :(" ? `<p>Lyrical couldn't pull the lyrics from Genius. 
				This could be caused by a VPN, Proxy, or Firewall</p>`: ""}</div>`);
	  	console.error(e.message);
	}
}

// Controller
const $lyrics = {	
	_genius: null,
	_helper: new LyricsHelper(),
	_init_done: false,

	init(){
		chrome.runtime.onMessage.addListener(((request, sender) => {
			if(request.message !== null){
				let lyrics = LZString.decompressFromUTF16(request.message.lyrics);
				this._helper.displayLyrics(lyrics, request.message.url, request.message.domain);
			}else{
				this._genius.find();
			}
		}).bind(this));
	},

	/**
	 *	Controller - Find lyrics
	 *	@param song {Object} - The song to get lyrics for
	 *	@param  first_search {boolean} - If this is the first search for the lyrics
	 *	@param callback_fcns {Array} (optional) - An array of callback functions 
	 */
	get_lyrics(song, first_search, callback_fcns){	
		if(!this._genius || !this._init_done){
			this.init();
			this._init_done = true;
		}

		this._helper.lyric_panel = $("#words");
		this._genius = new GeniusLyrics(this._helper);

		let my_song = $.extend(true, {}, song);
		my_song.first_search = first_search;
		my_song.callback_fcns = callback_fcns;
		this._helper.cur_song = my_song;

		this._helper.errorMessage(
			`<div id="err_msg">Working...<br><img src="${chrome.extension.getURL('img/loader.gif')}"></div>`);

		// Pull the lyrics
		this._helper.checkCache();
	},

	// To keep API same for now
	hightlight(index){
		Highlighter.hightlight(index);
	},

	next(){
		Highlighter.next();
	},

	prev(){
		Highlighter.prev();
	}
}

export default $lyrics;