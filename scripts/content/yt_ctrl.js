import $lyrics from '../utils/lyrics'

// lyrics on youtube 
$(function(){
	function init(autorun){

		if(location.pathname === "/watch"){
			console.log("Lyrical is running");

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
						position: absolute;
						top: .5em;
						right: .5em;
						border: 1px solid #000;
						padding: 1em;
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

				$("#watch-header").append('<a href="#" id="show_hide_lyrics">Hide Lyrics</a>');

				// Try to find the song's info 
				if($(".watch-extras-section .watch-meta-item").last().find(".title").text().trim() === "Music"){

					let song_info = $(".watch-extras-section .watch-meta-item").last().find("ul.watch-info-tag-list");
					console.log($(song_info).text().match(/(.*)by /));
					let title = $(song_info).text().split("\"")[1];
					let artist = $(song_info).find("a").first().text();
					// If it got the wrong artist
					if(artist === "Google Play" || artist.toUpperCase() === "ITUNES" || artist.indexOf("Listen ad-free") !== -1){
						let song_txt = song_info.text();
						artist = (song_txt.match(/by (.*) \(G/) || $(song_info).text().match(/by (.*) Listen/))[1];
						//artist = song_txt.match(/by (.*) \(G/)[1];
					}

					$lyrics.get_lyrics(artist, title);
				}else{
					// Less accurate method. Try to find song info from the title
					// Assumes "Artist - Song Title" format
					let song_info = $("h1.watch-title-container").text();
					song_info = song_info.split("-"); 
					let artist = song_info[0].trim();
					let title = song_info[1].trim();
					// remove anything in parentheses or brackets
					title = title.replace(/ *\([^)]*\) */g, " ").replace(/ *\[.*?\] */g, " ");

					$lyrics.get_lyrics(artist, title);
				}

				let el = document.getElementById("show_hide_lyrics");
				el.addEventListener("click", show_hide_panel, false);
				// Hide panel by default on page load
				if(!autorun)
					show_hide_panel();
			}
		}

		// Toggle the lyrics panel when #show_hide_lyrics is clicked
		function show_hide_panel(){
			$("#lyrics").toggle();
			let txt = $("#show_hide_lyrics").text();
			$("#show_hide_lyrics").text(txt === "Hide Lyrics" ? "Show Lyrics" : "Hide Lyrics");
		}
	}

	chrome.storage.sync.get({'run_on_yt': true, 'autorun': false}, function(response){
		if(response.run_on_yt){
			init(response.autorun);
			// Listen to youtube's spfdone event to detect page changes
			document.addEventListener("spfdone", function(){
				init(response.autorun);
			});
		}
	});
	


	
})

