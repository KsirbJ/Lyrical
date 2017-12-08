
compiler = closure-compiler.jar
common_files =  scripts/utils/lyrics.js  scripts/lyrics/lyrics.js scripts/lyrics/lyrics_helper.js scripts/utils/translate.js scripts/utils/keys.js scripts/utils/panel.js
play_music_files = scripts/content/pm_ctrl.js scripts/utils/utils.js  
youtube_files = scripts/content/yt_ctrl.js scripts/utils/utils.js  
spotify_files = scripts/content/spotify_ctrl.js scripts/utils/utils.js
background_files = scripts/background/background.js scripts/utils/cache.js
flags = --js

all: compile

# build the content scripts
compile:
	java -jar $(compiler) $(flags) $(common_files) $(play_music_files) --js_output_file scripts/content_compiled/play_music.js
	java -jar $(compiler) $(flags) $(common_files) $(youtube_files) --js_output_file scripts/content_compiled/youtube.js
	java -jar $(compiler) $(flags) $(common_files) $(spotify_files) --js_output_file scripts/content_compiled/spotify.js
	java -jar $(compiler) $(flags) $(background_files) --js_output_file scripts/background_compiled/background.js
	uglifycss ui/panel.css > ui/panel.min.css
	uglifycss ui/options.css > ui/options.min.css

deploy:	clean compile
	mkdir lyrical
	cp -f manifest.json lyrical/
	cp -rf libs/ lyrical/
	cp -rf img/ lyrical/
	mkdir lyrical/scripts
	cp -rf scripts/content_compiled/ lyrical/scripts/
	cp -rf scripts/background_compiled lyrical/scripts/background_compiled/
	mkdir lyrical/ui
	cp -rf ui/*.html lyrical/ui/
	cp -rf ui/*.min.css lyrical/ui/
	cp -rf ui/*.js lyrical/ui/
	cd lyrical && zip -r ../lyrical.zip *
	rm -rf lyrical

clean:
	rm -rf scripts/content_compiled/*
	rm -rf scripts/background_compiled/*
	rm -rf lyrical/*
	rm -rf lyrical
	rm -rf lyrical.zip