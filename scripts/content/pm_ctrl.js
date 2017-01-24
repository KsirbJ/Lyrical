import $utils from '../utils/utils'
import $lyrics from '../utils/lyrics'

// Lyrics on google play music
$(function(){
	chrome.storage.sync.get({'run_on_gp': true, 'autorun': false}, function(response){
		if(response.run_on_gp){

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
						padding: 1em 3em 1em 2em;
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
						$lyrics.get_lyrics(current_artist, current_title);

						if(!observer_attached){
							$utils.create_observer("playerSongInfo", check_playing);
							observer_attached = true;
						}
					}

				}
			}

			
			
			// initialize observer
			$utils.create_observer("player", check_playing);




			// Toggle the lyrics panel when #show_hide_lyrics is clicked
			function show_hide_panel(){
				$("#lyrics").toggle();
				$("#mainContainer").toggleClass("lyrics_visible");
				let txt = $("#show_hide_lyrics").text();
				$("#show_hide_lyrics").text(txt === "Hide Lyrics" ? "Show Lyrics" : "Hide Lyrics");
			}

			$(document).on("click", "#show_hide_lyrics", show_hide_panel);

			// Hide panel by default on page load
			if(!response.autorun)
				$("#show_hide_lyrics").trigger("click");
		}
	});
	
});