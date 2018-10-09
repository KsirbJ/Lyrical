import $utils from '../../utils/utils.js'
import $lyrics from '../../components/lyrics/lyrics.js'
import $panel from '../../components/panel/panel.js'

(function(){
	$(function(){
		const spotify_opts = {
			'run_on_sp': true, 
			'sp_dark': false, 
			'panel_state_sp': 'is_in', 
			'panel_visible_sp': false,
			'sp_mem': true, 
			'sp_as': false
		}
		// pull the user specified options from storage and react accordingly
		chrome.storage.local.get(spotify_opts, 
			function(response){
			if(response.run_on_sp){
				let site = response.sp_mem ? "sp" : null;
				let $mainContainer = null, $player = null;
				let timeout = null, executed = false;
				let observer_attached = false;
				let cur_song = {
					title: "",
					artist: "",
					duration: 0,
					cur_time: 0,
					gotLyrics: false
				}

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
					}else if(!executed){
						clearTimeout(timeout);
						executed = true;
						execute_this();
					}
				}

				function manual_search(){
					$panel.add_search_box(); 
				}

				// When a mutation on the player is observed, check whether the song has changed by comparing the
				// title and artist with the stored version
				function check_playing(){
					let current_title = $(".track-info__name div a ").text();
					let current_artist = $(".track-info__artists span span a:eq(0)").text();					

					if(cur_song.title !== current_title || cur_song.artist !== current_artist){

						cur_song.title = current_title;
						cur_song.artist = current_artist;
						cur_song.duration = $(".playback-bar__progress-time").eq(1).text();
						cur_song.cur_time = $(".playback-bar__progress-time").eq(0).text();

						cur_song.gotLyrics = false;
						console.log("updated - " + current_title + " " + current_artist);
						if($panel.is_visible()){
							$lyrics.get_lyrics(cur_song, true, [$panel.autoscroll, manual_search]);
							cur_song.gotLyrics = true;
						}

						if(!observer_attached){
							setTimeout(function(){
								$utils.create_observer(".track-info__name div a", 
									check_playing, [true, true, true, true]);
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
							cur_song.cur_time = $("#time_container_current").text();
							$lyrics.get_lyrics(cur_song, true, [$panel.autoscroll, manual_search]);
							cur_song.gotLyrics = true;
						}
					}
					$panel.show_hide_panel(e, site);
				}

				// pop the panel in / out on click
				function pop_in_out(e){
					if($panel.is_popped_in()){
						$mainContainer.removeClass("lyrics_visible");
					}else {
						$mainContainer.addClass("lyrics_visible");
					}
					$panel.pop_in_out($panel.is_popped_in() ? '400px' : '100%', e, site);
				}

				function resize_content(){
					if($panel.is_visible() && $panel.is_popped_in()){
				 		if($mainContainer.length > 0 && ! $mainContainer.hasClass('lyrics_visible'))
				 			$mainContainer.addClass("lyrics_visible");
				 	}
				}

				function run(){
					// Selector cache 
					$mainContainer = $(".root"),
						$player = $(".now-playing-bar");

					$(document).on('submit', '#search_form', function(e){
						cur_song.artist = $('#search_form').find("#artist_name").val();
						cur_song.title = $('#search_form').find("#song_name").val();
						cur_song.duration = $(".playback-bar__progress-time").eq(1).text();
						cur_song.cur_time = $(".playback-bar__progress-time").eq(0).text();

						$lyrics.get_lyrics(cur_song, false, [$panel.autoscroll, null]);
						e.preventDefault();
						e.stopPropagation();
					});

					// Add site specific styles
					$("head").append(`
						<style type="text/css">
							.root.lyrics_visible {
								width: 70%;
							}
							.resize-fix {
								width: 28%;
							}
							#lyrics {
								width: inherit;
								height: 100%;
								position: fixed;
								right: 0;
								top: 0;
								margin: 0;
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
							#lyrics a:hover, #lyrics a:active, #lyrics a:hover {
								text-decoration: none !important;
								outline: none !important;
								border: none !important;
							}
							.pop_out_btn {
								width: 30px;
							}
							#show_hide_lyrics {
								padding: 10px;
	    						font-size: 15px;
							}
						</style>
						`);
					
					// add the lyrics div
					$panel.append_panel("#main")
					// add the show-hide-lyrics button
					$panel.prepend_btn(".ExtraControls");
					
					$panel.add_toggle_handler(show_hide_panel);

					$(document).on('click', '.pop_out_btn', pop_in_out);

					// Resize the content on the page 
					$mainContainer.scroll(resize_content);
					window.onhashchange = resize_content();

					// Add handlers
					$panel.add_mode_handler('sp');
					$panel.add_resize_move_hanler(site);

					// Hide panel by default on page load
					if(!response.panel_visible_sp || !response.sp_mem)
						show_hide_panel(new Event('click'), site);
					// pop panel out if it was popped out last time
					if(response.panel_state_sp === "is_out" && response.sp_mem){
						pop_in_out(new Event('click'));
					}
					if(response.sp_dark)
						$panel.go_dark('sp');
					if(response.sp_as)
						$panel.turn_on_autoscroll();

					$panel.register_keybd_shortcut(show_hide_panel, null, 'S');
					check_playing();

					$("#words").on('keydown', function(e){
						switch(e.which) {
					        case 37:
					            $lyrics.prev();
					            e.preventDefault();
					            break;
					        case 39:
					            $lyrics.next();
					            e.preventDefault();
					            break;
					    }			
					});
				}

				wait_and_do(".track-info__name div a", run);
			}


		});	
	});
})();