import $utils from '../../utils/utils.js'
import $lyrics from '../../components/lyrics/lyrics.js'
import $panel from '../../components/panel/panel.js'

(function(){
	$(function(){
		let spf_simulated = false;	
		let timeout = null;	
		let executed = false; 
		let nav_obs_attached = false;
		let mode_obs_attached = false;
		let this_is_music = false;
		let player_height = "0px";
		let params = null;
		let site = null;

		let cur_song = {
			artist: "",
			title: "",
			duration: 0,
			cur_time: 0,
			gotLyrics: false
		}

		const yt_options = {
			'run_on_yt': true, 
			'run_all': false, 
			'yt_mem': true,
			'yt_as': false,
			'yt_dark': false, 
			'panel_state_yt': 'is_in', 
			'panel_visible_yt': false
		}

		// Submit handler for search form
		$(document).on('submit', '#search_form', function(e){
			cur_song.artist = $('#search_form').find("#artist_name").val();
			cur_song.title = $('#search_form').find("#song_name").val();
			cur_song.duration = $(".ytp-time-display .ytp-time-duration").text();
			cur_song.cur_time = $(".ytp-time-display .ytp-time-current").text();

			$lyrics.get_lyrics(cur_song, false, [$panel.autoscroll, null]);
			e.preventDefault();
			e.stopPropagation();
		});

		function manual_search(){
			$panel.add_search_box(); 
		}

		function heightFix(){
			// Make the lyrics div as tall as the Youtube player
			player_height = $(".player-height").css("height");
			if(player_height !== undefined && player_height !== "0px"){
				$("#lyrics").css('height', player_height);
			}else{
				player_height = $("#player").css("height"); // (NEW YT)
				if(player_height === "0px")
					player_height = '360px';
				$("#lyrics").css('height', player_height);
			}
			// Backup's backup
			if($("#lyrics").css('height') === "0px")
				$("#lyrics").css('height', '360px');
		}

		function check_for_panel(){
			if(location.pathname === "/watch" && $("#lyrics").length === 0 && !spf_simulated){
				spf_simulated = true;
				$("#show_hide_lyrics").remove(); // Prevents duplicate buttons
				chrome.storage.local.get(yt_options, (response) => {				
					params = response;
					if(response.run_on_yt){
						
						wait_and_do("h1.title.ytd-video-primary-info-renderer", "#items.ytd-watch-next-secondary-results-renderer", "#more .more-button",
				"#watch-header", ".watch-extras-section", init);

					}
					spf_simulated = false;
				});
			}		
			
		}

		/**
		 * 	Wait for 2 elements to be available before running lyrical
		 *
		 *	@param wait1a,1b,2a,2b {string} - The elements to wait for
		 *	@param execute_this {function} - The function to execute when the elements are available
		 */
		function wait_and_do(wait1a, wait1b, wait2a, wait1c, wait2b, execute_this){
			if(location.pathname === "/watch" && !executed){
				if(($(wait1a).length === 0 || $(wait1b).length === 0 || $(wait1c).length === 0) && 
					($(wait2a).length === 0 || $(wait2b).length === 0)){

					timeout = setTimeout(function(){
						wait_and_do(wait1a, wait1b, wait1c, wait2a, wait2b, execute_this);
					}, 100);

				}else if($("#lyrics").length === 0){

					executed = true;
					clearTimeout(timeout);
					execute_this();
					executed = false;

				}		
			}

			// Listen for transition from main or search pages to watch page
			if(!nav_obs_attached && $(".ytd-page-manager").length > 0){
				$utils.create_observer("title", check_for_panel, [true, true, false, true]);
				nav_obs_attached = true;
			}
		}

		// Confirm that the current video is under the music category 
		function check_if_music() {
			$("#more .more-button").click();			
			setTimeout(function(){
				if($(".ytd-metadata-row-container-renderer #content a:contains('Music')")
					.text().includes("Music")) {
					this_is_music = true;
					init();
					this_is_music = false;
				}	
				$("#less .less-button").click();		
			}, 100);
		}

		// Toggle panel's dark mode when the page's dark mode is toggled
		function toggle_dark_mode(){
			if($('body').attr('dark') === "true" || $('html').attr('dark') === "true"){
				$panel.go_dark('yt');
			}else{
				$panel.go_light('yt');
			}

			if(!mode_obs_attached){
				$utils.create_observer('body', toggle_dark_mode, [true, false, true, false]);
				mode_obs_attached = true;
			}
		}

		function init() {
			cur_song.gotLyrics = false;
			site = params.yt_mem ? "yt" : null;

			$(window).off('keydown');

			// Only append the lyrics panel if it's under the music category
			if(this_is_music || params.run_all){

				// Append youtube specific panel styles
				$('body').append(`
					<style type="text/css">
						#container.ytd-video-primary-info-renderer {
							position: relative;
						}
						#show_hide_lyrics {
							position: absolute;
							top: .5em;
							right: .5em;
							font-size: 14px;
						}
						#container #show_hide_lyrics {
							position: absolute;
							top: -1em !important;
							right: .5em;
							font-size: 14px;
						}
					</style>
					`);

				// Append the lyrics panel to the side
				if($("#watch7-sidebar-contents").length > 0)
					$panel.prepend_panel("#watch7-sidebar-contents");
				else if( $("#items.ytd-watch-next-secondary-results-renderer")
					.length > 0 ){
					$panel.prepend_panel("#items.ytd-watch-next-secondary-results-renderer");
				}

				// add the show-hide-lyrics button 
				if($(".ytd-page-manager").length > 0){ 
					$panel.insert_btn_after("h1.title.ytd-video-primary-info-renderer");
				}

				// Fix height issues
				heightFix();
				// Hide panel by default on page load
				if(!params.panel_visible_yt || !params.yt_mem)
					$panel.show_hide_panel(new Event('click'));
				if(params.panel_state_yt === "is_out" && params.yt_mem){
					$panel.pop_in_out(player_height, new Event('click'), site);
				}
				if(params.yt_as)
					$panel.turn_on_autoscroll();

				// Run 
				$panel.add_mode_handler('yt');
				$panel.add_resize_move_hanler(site);
				
				// Should we auto-detect dark mode?
				chrome.storage.local.get({'yt_detect_mode': true}, (response) => {
					if(response.yt_detect_mode && $(".ytd-page-manager").length > 0 ) // NEW YT
						toggle_dark_mode();	
					else{
						if(params.yt_dark)
							$panel.go_dark('yt');
					}
				});
				

				// Try to find the song's info 
				// Less accurate method. Try to find song info from the title
				// Assumes "Artist - Song Title", "Artist | song title", or "Artist : song title" format
				// Only method that works on new YT
				try{
					let song_info = $("h1.watch-title-container").text();
					if(song_info === "")
						song_info = $("h1.title.ytd-video-primary-info-renderer").text();
					// try to split song in all possible ways, then choose correct one
					let s1 = song_info.split(/\|(.+)/), s2 = song_info.split(/-(.+)/), s3 = song_info.split(/:(.+)/);
					song_info = (s1.length > 1) ? s1 : (s2.length > 1) ? s2 : (s3.length > 1) ? s3 : null; 
					if(!song_info)
						throw new Error("Couldn't parse song info :(");
					let artist = song_info[0].trim();
					let title = song_info[1].trim();

					cur_song.title = title;
					cur_song.artist = artist;
					cur_song.duration = $(".ytp-time-display .ytp-time-duration").text();

					if($panel.is_visible()){
						$lyrics.get_lyrics(cur_song, true, [$panel.autoscroll, manual_search]);
						cur_song.gotLyrics = true;
					}
				}catch(err){
					// Couldn't figure out song info, let user enter it manually
					$panel.add_search_box();
				}


				// listen for clicks on the show-hide button
				$panel.add_toggle_handler(toggle_panel);

				// listen for clicks on the pop-in-out button
				document.getElementById("pop-in-out").addEventListener("click", function(e){
					$panel.pop_in_out(player_height, e, site);
					return false;
				});

				$panel.register_keybd_shortcut(toggle_panel, null, 'S');

			}else if($(".ytd-page-manager").length > 0)	{
				check_if_music();
				return;
			}	

			// Listen for arrow key press
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
		
		// Toggle the lyrics panel
		function toggle_panel(e){
			if($panel.is_popped_in()){
				heightFix();
			}
			// If the user opens the panel and we didn't get the lyrics yet, pull it.
			if(!cur_song.gotLyrics && cur_song.title !== ""){
				cur_song.cur_time = $(".ytp-time-display .ytp-time-current").text();
				$lyrics.get_lyrics(cur_song, true, [$panel.autoscroll, manual_search]);
				cur_song.gotLyrics = true;
			}
			$panel.show_hide_panel(e, site);
		}

		// On load pull the user specified options, and run extension accordingly
		chrome.storage.local.get(yt_options, (response) => {
			if(response.run_on_yt){
				params = response;
				wait_and_do("h1.title.ytd-video-primary-info-renderer", "#items.ytd-watch-next-secondary-results-renderer", "#more .more-button",
				"#watch-header", ".watch-extras-section", init);
			}
		});	

	});
})();


