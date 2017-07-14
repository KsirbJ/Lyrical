import Translator from '../utils/translate'
// Basic functions to create and add the lyrics panel to sites
const $panel = {
	// Append the styles for the lyrics panel to the page
	append_styles: function(){
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
			minWidth: 200,
			maxWidth: 400,
			minHeight: 80
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