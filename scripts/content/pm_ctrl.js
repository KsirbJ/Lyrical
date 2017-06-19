import $utils from '../utils/utils'
import $lyrics from '../utils/lyrics'
import $panel from '../utils/panel'

// Lyrics on google play music
$(function(){

	// Selector cache 
	let $mainContainer = $("#mainContainer"),
		$player = $("#player");

	// pull the user specified options from storage and react accordingly
	chrome.storage.sync.get({'run_on_gp': true, 'autorun': false, 'auto_pop': false}, function(response){
		if(response.run_on_gp){

			$(document).on('submit', '#search_form', function(e){
				let artist = $('#search_form').find("#artist_name").val();
				let song = $('#search_form').find("#song_name").val();

				$lyrics.get_lyrics(cur_song, false, null);
				e.preventDefault();
				e.stopPropagation();
			});

			function manual_search(){
				$panel.add_search_box(); 
			}

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
					#lyrics #words {
						padding-right: 40px;
						width: 85%;
					}
				</style>
				`);
			// add global styles
			$panel.append_styles();
			// add the lyrics div
			$panel.append_panel("#mainPanel")
			// add the show-hide-lyrics button
			$panel.prepend_btn("#material-one-right");

			// have we already attached a mutation observer?
			let observer_attached = false;
			// The currently playing song
			let cur_song = {
				title: "",
				artist: "",
				duration: 0,
				cur_time: 0,
				gotLyrics: false
			}
			
			// When a mutation on the player is observed, check whether the song has changed by comparing the
			// title and artist with the stored version
			function check_playing(){
				if($player.hasClass("active")){
					let current_title = $("#currently-playing-title").text();
					let current_artist = $("#player-artist").text();
					let duration = $("#time_container_duration").text();

					if(cur_song.title !== current_title || cur_song.artist !== current_artist){

						cur_song.title = current_title;
						cur_song.artist = current_artist;
						cur_song.duration = duration;
						cur_song.cur_time = $("#time_container_current").text();
						cur_song.gotLyrics = false;

						console.log("updated - " + current_title + " " + current_artist);
						if($panel.is_visible()){
							$lyrics.get_lyrics(cur_song, true, manual_search);
							cur_song.gotLyrics = true;
						}

						if(!observer_attached){
							$utils.create_observer("#playerSongInfo", check_playing);
							observer_attached = true;
						}
					}

				}
			}

			
			
			// initialize observer
			$utils.create_observer("#player", check_playing);


			// Toggle the lyrics panel when #show_hide_lyrics is clicked
			function show_hide_panel(e){
				if($panel.is_visible()){
					$mainContainer.removeClass("lyrics_visible");
				}else {
					if($panel.is_popped_in()) $mainContainer.addClass("lyrics_visible");
					if(!cur_song.gotLyrics && cur_song.artist !== ""){
						cur_song.cur_time = $("#time_container_current").text();
						$lyrics.get_lyrics(cur_song, true, manual_search);
						cur_song.gotLyrics = true;
					}
				}
				$panel.show_hide_panel(e);
			}
			$panel.add_toggle_handler(show_hide_panel);

			// pop the panel in / out on click
			function pop_in_out(e){
				if($panel.is_popped_in()){
					$mainContainer.removeClass("lyrics_visible");
				}else {
					$mainContainer.addClass("lyrics_visible");
				}
				$panel.pop_in_out('100%', e);
			}
			$(document).on('click', '.pop_out_btn', pop_in_out);

			// Resize the content on the page 
			$mainContainer.scroll(resize_content);
			window.onhashchange = resize_content();
			

			function resize_content(){
				if($panel.is_visible() && $panel.is_popped_in()){
			 		if($mainContainer.length > 0 && ! $mainContainer.hasClass('lyrics_visible'))
			 			$mainContainer.addClass("lyrics_visible");
			 	}
			}

			// Hide panel by default on page load
			if(!response.autorun)
				show_hide_panel(new Event('click'));
			// pop panel out if option is selected
			if(response.auto_pop){
				pop_in_out(new Event('click'));
				if(!response.autorun) $panel.$lyrical_panel.toggle();
			}

			$("#lyrics").find("#words").on('keydown', function(e){
				switch(e.which) {
			        case 37:
			        	e.preventDefault();
			            e.stopPropagation();
			            e.stopImmediatePropagation();
			            $lyrics.prev();
			            break;
			        case 39:
			            e.preventDefault();
			            e.stopPropagation();
			            e.stopImmediatePropagation();
			            $lyrics.next();
			            break;
			    }
				
				
			});

			$panel.register_keybd_shortcut(show_hide_panel, null, 'S');
		}
	});	
});