import $utils from '../utils/utils'
import $lyrics from '../utils/lyrics'
import $panel from '../utils/panel'

// Lyrics on Spotify
$(function(){
	let timeout = null;
	let executed = false;

	// pull the user specified options from storage and react accordingly
	chrome.storage.sync.get({'run_on_sp': true, 'autorun': false, 'auto_pop': false}, function(response){
		if(response.run_on_sp){

			/**
			 * Wait for a part of the page to load before initializing lyrical
			 *
			 * @param wait_on {string} - A selector of an element to wait on
			 * @param execute_this {function} - The function to execute when the element is found
			 */
			function wait_and_do(wait_on, execute_this){
				if($(wait_on).length === 0 && !executed){
					timeout = setTimeout(function(){
						wait_and_do(wait_on, execute_this);
					}, 100);
				}else{
					clearTimeout(timeout);
					executed = true;
					execute_this();
				}
			}

			function run(){
				// Selector cache 
				let $mainContainer = $(".root"),
					$player = $(".now-playing-bar");

				$(document).on('submit', '#search_form', function(e){
					let artist = $('#search_form').find("#artist_name").val();
					let song = $('#search_form').find("#song_name").val();

					$lyrics.get_lyrics(artist, song, false, null);
					e.preventDefault();
					e.stopPropagation();
				});

				function manual_search(){
					$panel.add_search_box(); 
				}

				// Add site specific styles
				$("head").append(`
					<style type="text/css">
						.root.lyrics_visible {
							width: 70%;
						}
						#lyrics {
							width: 28%;
							height: 100%;
							position: fixed;
							right: 0;
							top: 0;
						}
						#lyrical_title {
							top: 4px !important;
						}
						#words {
							width: 97% !important;
						}
						#words p {
							font-size: 14px !important;
							line-height: 25px !important;
						}
						.now-playing-bar__right__inner {
							width: auto !important;
						}
						#lyrics .dropdown-menu {
							line-height: 25px !important;
						}
						#lyrics .dropdown-menu a {
							color: #000;
						}
						#lyrics a:hover, #lyrics a:active {
							text-decoration: none !important;
						}
					</style>
					`);

				// add global styles
				$panel.append_styles();
				// add the lyrics div
				$panel.append_panel("#main")
				// add the show-hide-lyrics button
				$panel.prepend_btn(".extra-controls");

				// have we already attached a mutation observer?
				let observer_attached = false;
				// The currently playing song
				let cur_song = {
					title: "",
					artist: "",
					gotLyrics: false
				}
				
				// When a mutation on the player is observed, check whether the song has changed by comparing the
				// title and artist with the stored version
				function check_playing(){
					let current_title = $(".track-info__name div a ").text();
					let current_artist = $(".track-info__artists span span a").text();

					if(cur_song.title !== current_title || cur_song.artist !== current_artist){

						cur_song.title = current_title;
						cur_song.artist = current_artist;
						cur_song.gotLyrics = false;
						console.log("updated - " + current_title + " " + current_artist);
						if($panel.is_visible()){
							$lyrics.get_lyrics(current_artist, current_title, true, manual_search);
							cur_song.gotLyrics = true;
						}

						if(!observer_attached){
							setTimeout(function(){
								$utils.create_observer(".track-info__name div a", check_playing);
								observer_attached = true;
							}, 500);
							
						}
					}

				
				}

				// Toggle the lyrics panel when #show_hide_lyrics is clicked
				function show_hide_panel(e){
					if($panel.is_visible()){
						$mainContainer.removeClass("lyrics_visible");
					}else {
						if($panel.is_popped_in()) $mainContainer.addClass("lyrics_visible");
						if(!cur_song.gotLyrics && cur_song.artist !== ""){
							$lyrics.get_lyrics(cur_song.artist, cur_song.title, true, manual_search);
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

				$panel.register_keybd_shortcut(show_hide_panel, null, 'S');

				check_playing();
			}


			wait_and_do(".track-info__name div a", run);
		}


	});	
});