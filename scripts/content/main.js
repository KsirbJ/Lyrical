$(function(){
	$("head").append(`
		<style type="text/css">
			#mainContainer {
				width: 75%;
			}
			#lyrics {
				width: 22%;
				height: 100%;
				position: absolute;
				right: 0;
				top: 0;
				padding: 1em 2em 1em .5em;
				margin: 0;
			}
			#show_hide_lyrics {
				text-decoration: none;
			}
		</style>
		`);
	$("#mainPanel").append('<div id="lyrics">Ya ya ya</div>');
	$("#material-one-right").prepend('<a href="#" id="show_hide_lyrics"> Hide Lyrics </a>')
});