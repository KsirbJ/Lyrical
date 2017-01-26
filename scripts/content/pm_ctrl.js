import $utils from '../utils/utils'
import $lyrics from '../utils/lyrics'
import $panel from '../utils/panel'

// Lyrics on google play music
$(function(){
	// pull the user specified options from storage and react accordingly
	chrome.storage.sync.get({'run_on_gp': true, 'autorun': false, 'auto_pop': false}, function(response){
		if(response.run_on_gp){

			// Add site specific styles
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
					}
					#show_hide_lyrics {
						text-decoration: none;
					}
				</style>
				`);
			// add global styles
			$panel.append_styles();
			// add the lyrics div
			$("#mainPanel").append('<div id="lyrics"><div id="words">Play a song...</div></div>');
			// add the show-hide-lyrics button
			$("#material-one-right").prepend('<a href="#" id="show_hide_lyrics">Hide Lyrics</a>');
			$("#mainContainer").toggleClass("lyrics_visible");
			// add the pop-in-out button
			$("#lyrics").prepend('<a href="#" class="pop_out_btn">Pop out</a>');

			// have we already attached a mutation observer?
			let observer_attached = false;
			// The currently playing song
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
				$("#mainContainer").toggleClass("lyrics_visible");
				$panel.show_hide_panel();
			}
			$(document).on("click", "#show_hide_lyrics", show_hide_panel);

			// pop the panel in / out on click
			function pop_in_out(){
				$("#mainContainer").toggleClass("lyrics_visible");
				$panel.pop_in_out('100%');
			}
			$(document).on('click', '.pop_out_btn', pop_in_out);

			// Hide panel by default on page load
			if(!response.autorun)
				show_hide_panel();
			// pop panel out if option is selected
			if(response.auto_pop)
				pop_in_out();
		}
	});	
});