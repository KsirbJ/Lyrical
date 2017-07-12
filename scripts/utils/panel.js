import Translator from '../utils/translate'
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
					z-index: 199999000000;
					width: 300px;
					top: 0; 
					right: 0;
				}
				.pop_out_btn {
					position: absolute;
					top: 0;     
					left: 0;
    				background: #FFCF90;
    				color: #fff;
    				display: inline-block;
    				height: 35px;
    				transition: all .4s linear;
				}
				.pop_out_btn[data-state="is_in"]:before {
					content: "⇱";
					font-size: 25px;
					font-weight: 800;
    				padding: 0 .2em;
				}
				.pop_out_btn[data-state="is_out"]:before {
					content: "⇲";
					font-size: 25px;
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
					padding: 5% 3% 5% 3%;
					color: #000;
					overflow-y: scroll;
					position: absolute;
					top: 35px;
					right: 0;
					left: 0;
					height: 85.5%;
				}
				#err_msg {
					padding-top: 30%;
					margin: 0 auto;
					text-align: center;
				}
				.btn_bar {
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
					right: 32px;
					margin: 0;
					font-size: 26px;
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
				#close_btn {
					color: #ff0000;
					position: absolute;
					right: 5px;
				    top: 1px;
				    font-size: 25px;
				    transition: color .4s linear;
				}
				#close_btn:hover {
					cursor: pointer;
					color: #fff;
				}
				#translate_icon {
					position: absolute;
					left: 35px;
					height: 25px;
					z-index: 1919;
					top: 5px;
				}
				#translate_icon:hover {
					cursor: pointer;
				}
				#search_form {
					margin: 0 auto;
					padding-top: 30%;
				}
				#search_form input[type=text] {
					outline: none;
					border: none;
					border-bottom: 1px solid #ff9102;
					background: transparent !important;
					height: 1.6rem;
					width: 95%;
					font-size: 1em;
					margin: 0 0 15px 0;
					padding: 0;
					box-shadow: none;
					transition: all 0.3s;
				}
				#search_form input[type=text]:focus {
					border-bottom: 1px solid #ff9102;
					box-shadow: 0 1px 0 0 #ff9102;
				}
				#search_song {
				    display: block;
					padding: .8em;
					overflow: hidden;
					border-radius: 2px;
					box-shadow: 0 1px 4px rgba(0, 0, 0, .35);  
					background-color: #ff9102;
					color: #fff;		  
					text-decoration: none;
					transition: background-color .3s;
					width: 95%;
				}
				#search_song:hover {
				    background-color: #ee792c;
				    transition: background-color .3s;
				}
				label {
					font-size: .9em;
					color: #ff9102;
				}
				#words p.highlight {
					background: #ADD8E6;
				    padding: 10px;
				    margin: 0;
				}
				#words:focus {
					border: none !important;
					outline: none !important;
				}
				.resize-fix.can_drag {
					position: fixed !important;
					z-index: 2147483647;
					height: 400px;
					width: 400px;
					right: 0 !important;
				}
				.resize-fix {
					position: static !important;
				}
				#lyrics.dark-mode {
					color: #fff;
					background: rgb(17, 17, 17);
					border-color: rgb(35,35,35);
				}
				#lyrics.dark-mode .btn_bar {
					background: rgb(35,35,35);
				}
				#lyrics.dark-mode .pop_out_btn {
					background: inherit;
				}
				.dark-mode #words::-webkit-scrollbar-thumb {
					background: rgb(35,35,35);
					border: 1px solid #fff;
					border-radius: 10px;
				}
				.dark-mode #words::-webkit-scrollbar-thumb:hover {
					background: rgb(35,35,35);
				}
				.dark-mode #words::-webkit-scrollbar-thumb:active {
					background: rgb(35,35,35);
				}
				.dark-mode #words::-webkit-scrollbar-track {
					background: #ffffff;
					border-right: 1px solid rgb(35,35,35);
					border-left: 1px solid rgb(35,35,35);
				}
				.dark-mode #words {
					color: inherit;
					background: inherit;
				}
			</style>
		`);
	},

	// set the img src, and set up selector cache
	set_up_items: function(){
		let img = chrome.extension.getURL("img/translate-icon.png");
		$("#translate_icon").attr('src', img);
		$("#translate_icon").click((e) => {Translator.show_hide(e)});
		Translator.init_js();
		$("#lyrics").resizable({
			containment: "document",
			handles: "e, se, s, sw, w",
			minWidth: 100,
			maxWidth: 400
		});
		$(".resize-fix").draggable({
			containment: "document",   
		});
		$("#lyrics").resizable("disable");
		$(".resize-fix").draggable("disable");


		$panel.$lyrical_panel = $("#lyrics");
		$panel.$pop_btn = $(".pop_out_btn");
		$panel.$lyrical_wrapper = $(".resize-fix");

		// Hack for arrow key lyric selection
		$("#lyrics, .resize-fix, .btn_bar, #words, #words p").click(function(e){ 
			if($("#search_form").length === 0) 
				$("#words")[0].focus();
		});
	},

	// Set up the panel HTML 
	get_panel_html: function(){
		let panel = `<div class="resize-fix"><div id="lyrics">
						<div class="btn_bar">
							<a href="#" class="pop_out_btn" id="pop-in-out" data-state="is_in" title="Pop in/out the lyrics panel"></a>
							<img src="" id="translate_icon" title="Translate lyrics to another language"/>
							${Translator.get_css()}
							${Translator.get_html()}
							<h2 id="lyrical_title">Lyrical</h2>
							<span id="close_btn" title="Hide lyrics panel">&#10006;</span>
						</div>
						<div id="words" tabindex="0"><div id="err_msg">Play a song to see lyrics</div></div>
					</div></div>`;
		return panel;
	},


	// Add the panel to the view
	prepend_panel: function(toWhat){
		$(toWhat).prepend($panel.get_panel_html());	
		$panel.set_up_items();	
	},	

	append_panel: function(toWhat){
		$(toWhat).append($panel.get_panel_html());
		$panel.set_up_items();		
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

	insert_btn_after: function(what){
		$(what).after('<a href="#" id="show_hide_lyrics">Hide Lyrics</a>');
		$panel.$show_hide_btn = $("#show_hide_lyrics");
	},

	// Show or hide the panel
	show_hide_panel: function(e){
		$panel.$lyrical_panel.toggle();
		let txt = $panel.$show_hide_btn.text();
		$panel.$show_hide_btn.text(txt === "Hide Lyrics" ? "Show Lyrics" : "Hide Lyrics");
		// rememeber the panel state
		txt = $panel.$show_hide_btn.text();
		chrome.storage.sync.set({'panel_visible': (txt === "Hide Lyrics" ? true : false) });
		e.preventDefault();
		e.stopPropagation();
	},

	// Pop the panel in and out of the page
	pop_in_out: function(player_height, e){	
		// Hackiness to keep styles consistent
		$panel.$lyrical_panel.toggleClass("can_drag");
		$panel.$lyrical_wrapper.toggleClass("can_drag");

		// Use panel state to determine which rules to apply
		let state = $panel.$pop_btn.attr('data-state');
		let action = state === "is_in" ? "enable" : "disable";
		
		$panel.$lyrical_panel.resizable(action);
		$panel.$lyrical_wrapper.removeAttr("style");
		if(state === "is_in")
			$panel.$lyrical_wrapper.css({"top": "0", "right": "0"});
		else
			$panel.$lyrical_wrapper.css({"top": "0", "left": "0"});

		$panel.$lyrical_wrapper.draggable(action);
		$panel.$pop_btn.attr('data-state', state === 'is_in' ? 'is_out' : 'is_in' );
		$panel.$lyrical_panel.removeAttr("style").removeAttr("data-x").removeAttr("data-y").css('height', player_height);

		$("#words")[0].focus();
		// save the new state of the panel
		state = $panel.$pop_btn.attr('data-state');
		chrome.storage.sync.set({'panel_state': state});
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

	add_search_box: function(){
		$panel.$lyrical_panel.find("#words").empty();
		$panel.$lyrical_panel.find("#words").append(`
			<form name="search_form" id="search_form" >
				<h3> Whoops! </h3>
				<p> Lyrical couldn't identify this song. Try searching for it manually</p>
				<label for="artist_name">Artist</label>
				<input type="text" required="required" id="artist_name">
				<br/>
				<label for="song_name">Song Name</label>
				<input type="text" required="required" id="song_name">
				<br/>
				<input type="submit" value="Get Lyrics" id="search_song">
			</form>
			`);
	},

	// check whether the panel is visible
	is_visible: function(){
		return ($panel.$show_hide_btn.text() === "Hide Lyrics");
	},

	// check if the panel is popped in or out
	is_popped_in: function(){
		return ($panel.$pop_btn.attr('data-state') === "is_in");
	},

	// register a handler for the open / close button
	add_toggle_handler: function(call_this){
		document.getElementById("show_hide_lyrics").addEventListener("click", function(e){call_this(e)}, false);
		document.getElementById("close_btn").addEventListener("click", function(e){call_this(e)}, false);
	},

	go_dark(){
		if(!$panel.$lyrical_panel.hasClass('dark-mode')){
			$panel.$lyrical_panel.addClass('dark-mode');
		}
		
	},

	go_light(){
		$panel.$lyrical_panel.removeClass('dark-mode');
	},

	// Used for selector cache
	$lyrical_panel: null,
	$show_hide_btn: null,
	$pop_btn: null,
	$lyrical_wrapper: null

}

export default $panel;