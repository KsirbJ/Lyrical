import $lyrics from '../utils/lyrics'
import $panel from '../utils/panel'

// lyrics on youtube 
$(function(){
	function init(autorun, auto_pop){

		if(location.pathname === "/watch"){
			console.log("Lyrical is running");

			// Only append the lyrics panel if it's under the music category
			if($(".watch-extras-section .watch-meta-item").first().find("a").text() === "Music"){

				// Append youtube specific panel styles
				$('body').append(`
					<style type="text/css">
						#show_hide_lyrics {
							text-decoration: none;
							position: absolute;
							top: .5em;
							right: .5em;
							border: 1px solid #000;
							padding: 1em;
						}
						#lyrics p {
							line-height: 2em;
						}

					`)
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

				// Add the pop-in-out button to the panel
				$("#lyrics").prepend('<a href="#" class="pop_out_btn">Pop out</a>');

				// add the show-hide-lyrics button 
				$("#watch-header").append('<a href="#" id="show_hide_lyrics">Hide Lyrics</a>');

				// Try to find the song's info 
				if($(".watch-extras-section .watch-meta-item").last().find(".title").text().trim() === "Music"){

					let song_info = $(".watch-extras-section .watch-meta-item").last().find("ul.watch-info-tag-list");

					let title = $(song_info).text().split("\"")[1];
					let artist = $(song_info).find("a").first().text();

					// If it got the wrong artist use an alternative method to find it
					if(artist === "Google Play" || artist.toUpperCase() === "ITUNES" || artist.indexOf("Listen ad-free") !== -1){
						let song_txt = song_info.text();
						artist = (song_txt.match(/by (.*) \(G/) || $(song_info).text().match(/by (.*) Listen/))[1];
					}

					// get the lyrics
					$lyrics.get_lyrics(artist, title);
				}else{
					// Less accurate method. Try to find song info from the title
					// Assumes "Artist - Song Title" format
					let song_info = $("h1.watch-title-container").text();
					song_info = (song_info.split("-") || song_info.split("|")); 
					let artist = song_info[0].trim();
					let title = song_info[1].trim();
					// remove anything in parentheses or brackets
					title = title.replace(/ *\([^)]*\) */g, " ").replace(/ *\[.*?\] */g, " ");

					$lyrics.get_lyrics(artist, title);
				}

				// listen for clicks on the show-hide button
				let el = document.getElementById("show_hide_lyrics");
				el.addEventListener("click", $panel.show_hide_panel, false);

				// Hide panel by default on page load
				if(!autorun)
					$panel.show_hide_panel();
				if(auto_pop)
					$panel.pop_in_out(player_height);

				// listen for clicks on the pop-in-out button
				$(document).on('click', '.pop_out_btn', function(){
					$panel.pop_in_out(player_height);
				});
			}
		}
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
