import $utils from '../utils/utils'
import $lyrics from '../utils/lyrics'

// lyrics on youtube 
$(function(){
	function init(){

		if(location.pathname === "/watch"){
			console.log("i'm running");

			$("head").append(`
				<style type="text/css">
					#lyrics {
						padding: 1em 3em 1em 2em;
						margin: 0;
						overflow-y: scroll;
						overflow-x: hidden;
					}
					#show_hide_lyrics {
						text-decoration: none;
						text-align: right;
					}
					#lyrics p{
						line-height: 2em;
					}
				</style>
			`);


			// Only append the lyrics div if it's under the music category
			if($(".watch-extras-section .watch-meta-item").first().find("a").text() === "Music"){

				// Append the lyrics div to the side
				if($("#watch7-sidebar-modules").length > 0)
					$("#watch7-sidebar-modules").prepend('<div id="lyrics"></div>');
				else if($("#watch7-sidebar-contents").length > 0)
					$("#watch7-sidebar-contents").prepend('<div id="lyrics"></div>');

				// Make the lyrics div as tall as the player
				let player_height = $(".player-height").css("height");
				$("#lyrics").css('height', player_height);

				$("#watch-headline-title").append('<a href="#" id="show_hide_lyrics">Hide Lyrics</a>');

				// Try to find the song's info 
				if($(".watch-extras-section .watch-meta-item").last().find(".title").text().trim() === "Music"){

					let song_info = $(".watch-extras-section .watch-meta-item").last().find("ul.watch-info-tag-list");
					let title = $(song_info).text().split("\"")[1];
					let artist = $(song_info).find("a").first().text();

					$lyrics.get_lyrics(artist, title);
				}else{
					// Couldn't find title and artist
					$("#lyrics").html("<h3>Whoops!</h3><p>Couldn't find lyrics, sorry :( </p>");
				}
			}


			// Toggle the lyrics panel when #show_hide_lyrics is clicked
			function show_hide_panel(){
				$("#lyrics").toggle();
				let txt = $("#show_hide_lyrics").text();
				$("#show_hide_lyrics").text(txt === "Hide Lyrics" ? "Show Lyrics" : "Hide Lyrics");
			}

			$(document).on("click", "#show_hide_lyrics", show_hide_panel);
			// Hide panel by default on page load
			$("#show_hide_lyrics").trigger("click");
		}
	}
	init();

	// Listen to youtube's spfdone event to detect page changes
	document.addEventListener("spfdone", init);
	
})

