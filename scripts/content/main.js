import $CORS from '../utils/CORS'


$(function(){

	

	console.log($CORS);
	$("head").append(`
		<style type="text/css">
			#mainContainer.lyrics_visible {
				width: 75%;
			}
			#lyrics {
				width: 22%;
				height: 100%;
				position: absolute;
				right: 0;
				top: 0;
				padding: 1em 3em 1em .5em;
				margin: 0;
				overflow: scroll;
			}
			#show_hide_lyrics {
				text-decoration: none;
			}
		</style>
		`);
	$("#mainPanel").append('<div id="lyrics"></div>');
	$("#material-one-right").prepend('<a href="#" id="show_hide_lyrics">Hide Lyrics</a>');
	$("#mainContainer").toggleClass("lyrics_visible");

	// have we already attached a mutation observer?
	let observer_attached = false;


	let cur_song = {
		title: "",
		artist: ""
	}
	// When a mutation on the player is observed, check whether the song has changed by comparing the
	// title and artist with the stored version
	function check_playing(){
		if($("#player").hasClass("active")){
			let current_title = $("#currently-playing-title").text();
			let current_artist = $("#player-artist").text();

			if(cur_song.title !== current_title || cur_song.artist !== current_artist){

				cur_song.title = current_title;
				cur_song.artist = current_artist;
				console.log("updated - " + current_title + " " + current_artist);
				get_lyrics(current_artist, current_title);

				if(!observer_attached){
					create_observer("playerSongInfo", check_playing);
					observer_attached = true;
				}
			}

		}
	}

	/**
	 *	Create a Mutation Observer
	 *	@param	The id of the element to observe
	 *	@param	The function to call when a mutation is observed
	 */
	function create_observer(target, call_this_function){
			let observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					call_this_function();
				});    
			});

			let observerConfig = {
				attributes: true, 
				childList: true, 
				characterData: false
			};

			let targetNode = document.getElementById(target);
			observer.observe(targetNode, observerConfig);
	}
	
	// initialize observer
	create_observer("player", check_playing);

	function get_lyrics(artist, title){
		$("#lyrics").empty();
		let access_token = "6xTujcUZfJUiPAssUT1jMwkkeeYWhMzLAOgXc5fPaWAdY0tz-UzE-EyrtYcOjoWo";

		fetch('https://api.genius.com/search?access_token=' + access_token + '&q=' + 
			encodeURIComponent(title) + encodeURIComponent(artist)).then(function (response) {
		    	response.json().then(function (data) {
			    	let hits = data.response.hits || 0;
			    	let not_found = true;
			    	for(let i = 0; i < hits.length && not_found; ++i){

			    		console.log(hits[i].result.title);
			    		console.log(hits[i].result.primary_artist.name);

			    		if(hits[i].result.title === title && hits[i].result.primary_artist.name == artist){
			    			
			    			not_found = false;

			    			// get the actual lyrics
			    			let path = hits[i].result.id;
			    			fetch('https://api.genius.com/songs/' + path + '?access_token=' + access_token).then( function(response){
			    				response.json().then(function(data){
			    					let url = data.response.song.url;
			    					$CORS.makeCorsRequest(url);
			    				})
			    			})

			    		}
			    	}
		      
		  		});
		  	}
		);
	}



	function show_hide_panel(){
		$("#lyrics").toggle();
		$("#mainContainer").toggleClass("lyrics_visible");
		let txt = $("#show_hide_lyrics").text();
		$("#show_hide_lyrics").text(txt === "Hide Lyrics" ? "Show Lyrics" : "Hide Lyrics");
	}

	$(document).on("click", "#show_hide_lyrics", show_hide_panel);
});