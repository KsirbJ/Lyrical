
// Basic functions to create and add the lyrics panel to sites
const $panel = {

	// Append the styles for the lyrics panel to the page
	append_styles: function(){
		$("head").append(`
			<style type="text/css">
				html, body {
					cursor: default;
				}
				a {
					text-decoration: none;
				}
				a:hover {
					text-decoration: none;
				}
				#lyrics {
					background: #fff;
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
					position: fixed;
					top: 0;     
					left: 0;
    				background: #FFCF90;
    				color: #fff;
    				display: inline-block;
    				height: 35px;
				}
				.pop_out_btn[data-state="is_in"]:before {
					content: "⇱";
					font-size: 2em;
					font-weight: 800;
    				padding: 0 .2em;
				}
				.pop_out_btn[data-state="is_out"]:before {
					content: "⇲";
					font-size: 2em;
					font-weight: 800;
    				padding: 0 .2em;
				}
				.pop_out_btn:hover{
					background: #fff;
					color: #FFCF90;
				}
				#words {
					background: #fff;
					margin-top: 1em;
					padding-top: 1em;
				}
				#err_msg {
					padding-top: 30%;
					margin: 0 auto;
					text-align: center;
				}
				.btn {
					width: 100%;
					height: 35px;
					background: #FFCF90;
					position: fixed;
    				top: 0;
    				right: 0;
				}
				#credits {
					position: fixed;
					top: 10px;
					right: 25px;
				}
				#credits a {
					color: #0000ff;
				}
				#show_hide_lyrics {
					border: 1px solid #000;
					padding: 1em;
					background: #fff;
					text-decoration: none;
				}

			</style>
		`);
	},

	// Add the panel to the view
	prepend_panel: function(toWhat){
		$(toWhat).prepend(`<div id="lyrics">
			<div class="btn"><a href="#" class="pop_out_btn" id="pop-in-out" data-state="is_in"></a></div>
			<div id="words"><div id="err_msg">Play a song to see lyrics</div></div>
			</div>`);
	},

	append_panel: function(toWhat){
		$(toWhat).append(`<div id="lyrics">
			<div class="btn"><a href="#" class="pop_out_btn" id="pop-in-out" data-state="is_in"></a></div>
			<div id="words"><div id="err_msg">Play a song to see lyrics</div></div>
			</div>`);
	},

	// Show or hide the panel
	show_hide_panel: function(e){
		$("#lyrics").toggle();
		let txt = $("#show_hide_lyrics").text();
		$("#show_hide_lyrics").text(txt === "Hide Lyrics" ? "Show Lyrics" : "Hide Lyrics");
		e.preventDefault();
		e.stopPropagation();
	},

	// Pop the panel in and out of the page
	pop_in_out: function(player_height, e){	
		$("#lyrics").toggleClass("can_drag").toggleClass("resize-drag");
		let state = $(".pop_out_btn").attr('data-state');
		$(".pop_out_btn").attr('data-state', state === 'is_in' ? 'is_out' : 'is_in' );
		$("#lyrics").removeAttr("style").removeAttr("data-x").removeAttr("data-y").css('height', player_height);
		e.preventDefault();
		e.stopPropagation();
	}, 

	// Register a keyboard shortcut to open / close the panel
	register_keybd_shortcut: function(execute_this, with_this_param, for_shortcut_letter){
		
		$(window).on('keydown', function(e){
			if(e.ctrlKey && e.shiftKey && e.keyCode == for_shortcut_letter.charCodeAt(0)){
				if(with_this_param)
					execute_this(with_this_param, new Event('click'));
				else
					execute_this(new Event('click'));
				e.preventDefault();
				e.stopPropagation();
			}
		})
	}

}

export default $panel;