

const $panel = {
	// Append the styles for the lyrics panel to the page
	append_styles: function(){
		$("head").append(`
			<style type="text/css">
				html, body {
					cursor: default;
				}
				#lyrics {
					padding: 1em 3em 1em 2em;
					margin: 0;
					overflow-y: scroll;
					-webkit-font-smoothing: subpixel-antialiased;
					transform: translateZ(0) scale(1.0, 1.0);
					backface-visibility: hidden;
					filter: blur(0);
					transform-origin: 50%  53%;
					perspective: 1000px;
				}
				#lyrics p{
					-webkit-font-smoothing: subpixel-antialiased;
					transform: translateZ(0) scale(1.0, 1.0);
					backface-visibility: hidden; 
					filter: blur(0);
					transform-origin: 50%  53%;
					perspective: 1000px;
				}
				#lyrics.can_drag {
					position: absolute;
					top: 0;
					right: 0;
					border: 1px solid #000;
					background: #fff;
					z-index: 199999000000;
					overflow: auto;
					max-width: 300px;
				}
				.pop_out_btn {
					position: absolute;
					top: .5em; 
					left: .5em;
				}

			</style>
		`);
	},

	// Add the panel to the view
	prepend_panel: function(toWhat){
		$(toWhat).prepend('<div id="lyrics"><div id="words"></div></div>');
	},

	// Show or hide the panel
	show_hide_panel: function(){
		$("#lyrics").toggle();
		let txt = $("#show_hide_lyrics").text();
		$("#show_hide_lyrics").text(txt === "Hide Lyrics" ? "Show Lyrics" : "Hide Lyrics");
	},

	// Pop the panel in and out of the page
	pop_in_out: function(player_height){	
		$("#lyrics").toggleClass("can_drag").toggleClass("resize-drag");
		let txt = $(".pop_out_btn").text();
		$(".pop_out_btn").text(txt === "Pop out" ? "Pop in" : "Pop out");
		$("#lyrics").removeAttr("style").removeAttr("data-x").removeAttr("data-y").css('height', player_height);
	}

}

export default $panel;