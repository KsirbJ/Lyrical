
// Basic functions to create and add the lyrics panel to sites
const $panel = {
	// Append the styles for the lyrics panel to the page
	append_styles: function(){

		$("head").append(`
			<style type="text/css">
				@import url('https://fonts.googleapis.com/css?family=Libre+Franklin|Kalam:400,700');
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
					overflow: hidden;
					-webkit-font-smoothing: subpixel-antialiased;
					transform: translateZ(0) scale(1.0, 1.0);
					backface-visibility: hidden;
					filter: blur(0);
					transform-origin: 50%  53%;
					perspective: 1000px;
					border-top: 1px solid #FFCF90;
					border-bottom: 1px solid #FFCF90;
					border-left: 1px solid #FFCF90;
					margin: 0 0 1em .7em;
				}
				#lyrics p{
					-webkit-font-smoothing: subpixel-antialiased;
					transform: translateZ(0) scale(1.0, 1.0);
					backface-visibility: hidden; 
					filter: blur(0);
					transform-origin: 50%  53%;
					perspective: 1000px;
					font-family: 'Libre Franklin', sans-serif;
				}
				#lyrics.can_drag {
					position: absolute;
					top: 0;
					right: 0;
					background: #fff;
					z-index: 199999000000;
					overflow: hidden;
					max-width: 300px;
					width: 300px;
				}
				.pop_out_btn {
					position: absolute;
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
					margin: 0;
					padding: 5% 3% 5% 0;
					color: #000;
					overflow-y: scroll;
					position: absolute;
					top: 35px;
					right: 0;
					width: 93%;
					height: 85.5%;
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
					position: absolute;
    				top: 0;
    				right: 0;
				}
				#credits {
					position: absolute;
					top: 5px;
					right: 10px;
					font-size: .9em;
				}
				#credits a {
					color: #0000ff;
				}
				#lyrical_icon {
					position: absolute;
					top: 6px;
					right: 6px;
					z-index: 191919191919;
					height: 23px;
				}
				#words::-webkit-scrollbar {
				  width: 11px;
				  height: 10px;
				}
				#words::-webkit-scrollbar-button {
				  width: 0px;
				  height: 0px;
				}
				#words::-webkit-scrollbar-thumb {
				  background: #ffcf90;
				  border: 1px solid #fff;
				  border-radius: 10px;
				}
				#words::-webkit-scrollbar-thumb:hover {
				  background: #ffcf90;
				}
				#words::-webkit-scrollbar-thumb:active {
				  background: #ffcf90;
				}
				#words::-webkit-scrollbar-track {
				  background: #ffffff;
				  border-right: 1px solid #ffcf90;
				  border-left: 1px solid #ffcf90;
				}
				#words::-webkit-scrollbar-track:hover {
				  background: #ffffff;
				}
				#words::-webkit-scrollbar-track:active {
				  background: #ffffff;
				}
				#words::-webkit-scrollbar-corner {
				  background: transparent;
				}
				#lyrical_title {
					font-family: 'Kalam', cursive;
					font-weight: 700;
					color: #fff;
					font-size: 2em;
					position: absolute;
					top: -2px;
					right: 40px;
					margin: 0;
				}
				#show_hide_lyrics {
					display: block;
					padding: .8em;
					overflow: hidden;
					border-radius: 2px;
					box-shadow: 0 1px 4px rgba(0, 0, 0, .35);  
					background-color: #ff9102;
					color: #fff;		  
					text-decoration: none;
					transition: background-color .3s;
				}
				#show_hide_lyrics:hover {
					background-color: #ee792c;
					text-decoration: none;
					transition: background-color .3s;
				}
			</style>
		`);
	},

	// Set up the panel HTML 
	get_panel_html: function(){
		let panel = `<div id="lyrics">
						<div class="btn">
							<a href="#" class="pop_out_btn" id="pop-in-out" data-state="is_in"></a>
							<h2 id="lyrical_title">Lyrical</h2>
							<img src="" id="lyrical_icon" />
						</div>
						<div id="words"><div id="err_msg">Play a song to see lyrics</div></div>
					</div>`;
		return panel;
	},


	// Add the panel to the view
	prepend_panel: function(toWhat){
		$(toWhat).prepend($panel.get_panel_html());	
		let img = chrome.extension.getURL("img/icon-128.png");
		$("#lyrical_icon").attr('src', img);

		$panel.$lyrical_panel = $("#lyrics");
		$panel.$pop_btn = $(".pop_out_btn");		
	},	

	append_panel: function(toWhat){
		$(toWhat).append($panel.get_panel_html());
		let img = chrome.extension.getURL("img/icon-128.png");
		$("#lyrical_icon").attr('src', img);

		$panel.$lyrical_panel = $("#lyrics");
		$panel.$pop_btn = $(".pop_out_btn");		
	},

	// add the show hide lyrics button
	append_btn: function(toWhat){
		$(toWhat).append('<a href="#" id="show_hide_lyrics">Hide Lyrics</a>');
		$panel.$show_hide_btn = $("#show_hide_lyrics");
	},

	prepend_btn: function(toWhat){
		$(toWhat).prepend('<a href="#" id="show_hide_lyrics">Hide Lyrics</a>');
		$panel.$show_hide_btn = $("#show_hide_lyrics");
	},

	// Show or hide the panel
	show_hide_panel: function(e){
		$panel.$lyrical_panel.toggle();
		let txt = $panel.$show_hide_btn.text();
		$panel.$show_hide_btn.text(txt === "Hide Lyrics" ? "Show Lyrics" : "Hide Lyrics");
		e.preventDefault();
		e.stopPropagation();
	},

	// Pop the panel in and out of the page
	pop_in_out: function(player_height, e){	
		$panel.$lyrical_panel.toggleClass("can_drag").toggleClass("resize-drag");
		let state = $panel.$pop_btn.attr('data-state');
		$panel.$pop_btn.attr('data-state', state === 'is_in' ? 'is_out' : 'is_in' );
		$panel.$lyrical_panel.removeAttr("style").removeAttr("data-x").removeAttr("data-y").css('height', player_height);
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
	},

	// check whether the panel is visible
	is_visible: function(){
		return ($panel.$show_hide_btn.text() === "Hide Lyrics");
	},

	// check if the panel is popped in or out
	is_popped_in: function(){
		return ($panel.$pop_btn.attr('data-state') === "is_in");
	},

	// Used for selector cache
	$lyrical_panel: null,
	$show_hide_btn: null,
	$pop_btn: null

}

export default $panel;