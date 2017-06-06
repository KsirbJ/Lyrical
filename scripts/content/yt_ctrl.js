import $lyrics from '../utils/lyrics'
import $utils from '../utils/utils'
import $panel from '../utils/panel'

// lyrics on youtube 
$(function(){

	// Tracks whether panel load has been initiated
	let spf_simulated = false;
	let timeout = null;
	let executed = false;

	// Info about the currently playing song
	let cur_song = {
		artist: "",
		title: "",
		gotLyrics: false
	}


	// Submit handler for search form
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

	// For new youtube - Run this instead of spfdone
	function check_for_panel(){
		if($("#lyrics").length === 0 && !spf_simulated){

			spf_simulated = true;
			$("#show_hide_lyrics").remove();
			chrome.storage.sync.get({'run_on_yt': true, 'autorun': false, 'auto_pop': false, 'panel_state': 'is_in', 'panel_visible': false}, 
			(response) => {

				if(response.run_on_yt){
					if(response.panel_state === 'is_out')
						response.auto_pop = true;
					if(response.panel_visible)
						response.autorun = true;
					
					wait_and_do("h1.title.ytd-video-primary-info-renderer", "#items.ytd-watch-next-secondary-results-renderer",
			"#watch-header", ".watch-extras-section", init, response.autorun, response.auto_pop );
				}

			});
		}		
		
	}

	/**
	 * 	Wait for 2 elements to be available before running lyrical
	 *
	 *	@param wait1a,1b,2a,2b {string} - The elements to wait for
	 *	@param execute_this {function} - The function to execute when the elements are available
	 */
	function wait_and_do(wait1a, wait1b, wait2a, wait2b, execute_this, param1, param2){
		if(location.pathname === "/watch"){
			if(($(wait1a).length === 0 || $(wait1b).length === 0  && !executed) && 
				($(wait2a).length === 0 || $(wait2b).length === 0  && !executed)){
				timeout = setTimeout(function(){
					wait_and_do(wait1a, wait1b, wait2a, wait2b, execute_this, param1, param2);
				}, 100);
			}else{
				clearTimeout(timeout);
				executed = true;
				execute_this();
			}
		}
	}

	function init(autorun, auto_pop){

		cur_song.gotLyrics = false;

		$(window).off('keydown');

		// Listen for page changes on youtube material 
		if($("#playlist #container").length > 0){
			$utils.create_observer("#items.iron-list", check_for_panel);
		}else if($("#page-manager").length > 0){
			$utils.create_observer("#items", check_for_panel);
		}

		// Only append the lyrics panel if it's under the music category
		if($(".watch-extras-section").find(".watch-info-tag-list a:contains('Music')").text() === "Music"  ||
			$(".ytd-page-manager").length > 0){

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
					#lyrics p {
						line-height: 2em;
						font-size: 13px;
					}

				`);
			// add global panel styles
			$panel.append_styles();

			// Append the lyrics panel to the side
			if($("#watch7-sidebar-modules").length > 0)
				$panel.prepend_panel("#watch7-sidebar-modules");
			else if($("#watch7-sidebar-contents").length > 0)
				$panel.prepend_panel("#watch7-sidebar-contents");
			else if( $("#items.ytd-watch-next-secondary-results-renderer").length > 0 )
				$panel.prepend_panel("#items.ytd-watch-next-secondary-results-renderer");

			// Make the lyrics div as tall as the Youtube player
			let player_height = $(".player-height").css("height");
			$("#lyrics").css('height', player_height);

			// add the show-hide-lyrics button 
			if($(".ytd-page-manager").length > 0){
				$panel.insert_btn_after("h1.title.ytd-video-primary-info-renderer");
			}
			else
				$panel.append_btn("#watch-header");

			// Hide panel by default on page load
			if(!autorun)
				$panel.show_hide_panel(new Event('click'));
			if(auto_pop){
				$panel.pop_in_out(player_height, new Event('click'));
				if(!autorun) $panel.$lyrical_panel.toggle();
			}

			// Try to find the song's info 
			if($(".watch-extras-section .watch-meta-item").find(".title:contains('Music')").text().trim() === "Music"){

				let song_info = $(".watch-extras-section .watch-meta-item").find(".title:contains('Music')").parent().find("ul.watch-info-tag-list");

				// Find the title
				let title = $(song_info).text().split("\"")[1];

				// find the artist and clean it up
				let artist = $(song_info).find("a").first().text();

				// If it got the wrong artist use an alternative method to find it
				if(artist === "Google Play" || artist.toUpperCase() === "ITUNES" || artist.indexOf("Listen ad-free") !== -1){
					let song_txt = song_info.text();
					artist = (song_txt.match(/by (.*) \(G/) || $(song_info).text().match(/by (.*) Listen/))[1];
				}

				cur_song.title = title;
				cur_song.artist = artist;
				
				// get the lyrics - only pull it if the panel is open
				if($panel.is_visible()){
					$lyrics.get_lyrics(artist, title, true, manual_search);
					cur_song.gotLyrics = true;
				}
			}else{
				// Less accurate method. Try to find song info from the title
				// Assumes "Artist - Song Title", "Artist | song title", or "Artist : song title" format
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

					if($panel.is_visible()){
						$lyrics.get_lyrics(artist, title, true, manual_search);
						cur_song.gotLyrics = true;
					}
				}catch(err){
					// Couldn't figure out song info, let user enter it manually
					$panel.add_search_box();
				}

			}

			// listen for clicks on the show-hide button
			$panel.add_toggle_handler(toggle_panel);

			// listen for clicks on the pop-in-out button
			document.getElementById("pop-in-out").addEventListener("click", function(e){
				$panel.pop_in_out(player_height, e);
			}, false);

			$panel.register_keybd_shortcut(toggle_panel, null, 'S');
		}
		spf_simulated = false;
		
	}
	
	function toggle_panel(e){
		// If the user opens the panel and we didn't get the lyrics yet, pull it.
		if(!cur_song.gotLyrics && cur_song.title !== ""){
			$lyrics.get_lyrics(cur_song.artist, cur_song.title, true, manual_search);
			cur_song.gotLyrics = true;
		}
		$panel.show_hide_panel(e);
	}

	// On load pull the user specified options, and run extension accordingly
	chrome.storage.sync.get({'run_on_yt': true, 'autorun': false, 'auto_pop': false}, (response) => {
		if(response.run_on_yt){
			wait_and_do("h1.title.ytd-video-primary-info-renderer", "#items.ytd-watch-next-secondary-results-renderer",
			"#watch-header", ".watch-extras-section", init, response.autorun, response.auto_pop );
		}
	});


	// Listen to youtube's spfdone event to detect page changes
	document.addEventListener("spfdone", function(){
		chrome.storage.sync.get({'run_on_yt': true, 'autorun': false, 'auto_pop': false, 'panel_state': 'is_in', 'panel_visible': false}, 
		(response) => {

			if(response.run_on_yt){
				if(response.panel_state === 'is_out')
					response.auto_pop = true;
				if(response.panel_visible)
					response.autorun = true;
				wait_and_do("h1.title.ytd-video-primary-info-renderer", "#items.ytd-watch-next-secondary-results-renderer",
			"#watch-header", ".watch-extras-section", init, response.autorun, response.auto_pop );
			}

		});
	});
	

});

