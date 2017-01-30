import $lyrics from '../utils/lyrics'
import $panel from '../utils/panel'

// lyrics on youtube 
$(function(){
	// Info about the currently playing song
	let cur_song = {
		artist: "",
		title: "",
		gotLyrics: false
	}

	function init(autorun, auto_pop){

		if(location.pathname === "/watch"){
			console.log("Lyrical is running");

			// Only append the lyrics panel if it's under the music category
			if($(".watch-extras-section .watch-meta-item").first().find("a").text() === "Music"){

				// Append youtube specific panel styles
				$('body').append(`
					<style type="text/css">
						#show_hide_lyrics {
							position: absolute;
							top: .5em;
							right: .5em;
						}
						#lyrics p {
							line-height: 2em;
						}

					`);
				// add global panel styles
				$panel.append_styles();

				// Append the lyrics panel to the side
				if($("#watch7-sidebar-modules").length > 0)
					$panel.prepend_panel("#watch7-sidebar-modules");
				else if($("#watch7-sidebar-contents").length > 0)
					$panel.prepend_panel("#watch7-sidebar-contents");

				// Make the lyrics div as tall as the player
				let player_height = $(".player-height").css("height");
				$("#lyrics").css('height', player_height);

				// add the show-hide-lyrics button 
				$("#watch-header").append('<a href="#" id="show_hide_lyrics">Hide Lyrics</a>');

				// Try to find the song's info 
				if($(".watch-extras-section .watch-meta-item").last().find(".title").text().trim() === "Music"){

					let song_info = $(".watch-extras-section .watch-meta-item").last().find("ul.watch-info-tag-list");

					// Find the title and clean it up
					title = $(song_info).text().split("\"")[1];
					title = clean_title(title);

					// find the artist and clean it up
					let artist = $(song_info).find("a").first().text();

					// If it got the wrong artist use an alternative method to find it
					if(artist === "Google Play" || artist.toUpperCase() === "ITUNES" || artist.indexOf("Listen ad-free") !== -1){
						let song_txt = song_info.text();
						artist = (song_txt.match(/by (.*) \(G/) || $(song_info).text().match(/by (.*) Listen/))[1];
					}

					cur_song.title = title;
					cur_song.artist = artist;
					// get the lyrics
					if($panel.is_visible()){
						$lyrics.get_lyrics(artist, title);
						cur_song.gotLyrics = true;
					}
				}else{
					// Less accurate method. Try to find song info from the title
					// Assumes "Artist - Song Title"  or "Artist | song title" format
					try{
						let song_info = $("h1.watch-title-container").text();
						song_info = (song_info.split("-") || song_info.split("|")); 
						let artist = song_info[0].trim();
						let title = song_info[1].trim();
						// clean up the title
						title = clean_title(title);

						cur_song.title = title;
						cur_song.artist = artist;

						if($panel.is_visible()){
							$lyrics.get_lyrics(artist, title);
							cur_song.gotLyrics = true;
						}
					}catch(err){
						$("#words").html("<div id='err_msg'><h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p></div>");
						console.log(err);

					}

				}

				// listen for clicks on the show-hide button
				let el = document.getElementById("show_hide_lyrics");
				el.addEventListener("click", function(e){toggle_panel(e)}, false);

				// Hide panel by default on page load
				if(!autorun)
					$panel.show_hide_panel(new Event('click'));
				if(auto_pop)
					$panel.pop_in_out(player_height, new Event('click'));

				// listen for clicks on the pop-in-out button
				document.getElementById("pop-in-out").addEventListener("click", function(e){
					$panel.pop_in_out(player_height, e);
				}, false);

				$panel.register_keybd_shortcut(toggle_panel, null, 'S');
			}
		}
	}

	// Clean up the title text
	function clean_title(title){

		// remove anything in parentheses or brackets
		title = title.replace(/ *\([^)]*\) */gi, " ").replace(/ *\[.*?\] */gi, " ");

		// remove any featuring x from the title because this causes issues
		let ft = null;
		if(title.toLowerCase().indexOf("featuring") !== -1 )
			ft = "featuring";
		else if(title.toLowerCase().indexOf("feat") !== -1)
			ft = "feat";
		else if(title.toLowerCase().indexOf("ft.") !== -1)
			ft = "ft.";

		if(ft){
			let regex = new RegExp(ft + '.*$', 'i');
			title = title.replace(regex, "");
		}

		return title;
	}

	function toggle_panel(e){
		// If the user opens the panel and we didn't get the lyrics yet, pull it.
		if(!cur_song.gotLyrics){
			$lyrics.get_lyrics(cur_song.artist, cur_song.title);
			cur_song.gotLyrics = true;
		}
		$panel.show_hide_panel(e);
	}

	// On load pull the user specified options, and run extension accordingly
	chrome.storage.sync.get({'run_on_yt': true, 'autorun': false, 'auto_pop': false}, function(response){
		if(response.run_on_yt){
			init(response.autorun, response.auto_pop);

			// Listen to youtube's spfdone event to detect page changes
			document.addEventListener("spfdone", function(){
				init(response.autorun, response.auto_pop);
			});
		}
	});
	


	
})

