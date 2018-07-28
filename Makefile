
compiler = closure-compiler.jar
common_files =  src/js/components/lyrics/lyrics.js src/js/components/lyrics/lyrics_helper.js src/js/utils/translate.js src/js/utils/keys.js src/js/components/panel/panel.js src/js/utils/autoscroll.js
play_music_files = src/js/core/content_scripts/pm_ctrl.js src/js/utils/utils.js  
youtube_files = src/js/core/content_scripts/yt_ctrl.js src/js/utils/utils.js  
spotify_files = src/js/core/content_scripts/spotify_ctrl.js src/js/utils/utils.js
background_files = src/js/core/background/background.js src/js/utils/cache.js
flags = --rewrite_polyfills=false --js 

all: compile

# build the content scripts
compile:	pm spotify yt css bg

pm:
	java -jar $(compiler) $(flags) $(common_files) $(play_music_files) --js_output_file compiled/play_music.js

spotify: 
	java -jar $(compiler) $(flags) $(common_files) $(spotify_files) --js_output_file compiled/spotify.js

yt: 
	java -jar $(compiler) $(flags) $(common_files) $(youtube_files) --js_output_file compiled/youtube.js

bg:
	java -jar $(compiler) $(flags) $(background_files) --js_output_file compiled/background.js

css:
	uglifycss src/js/components/panel/panel.css > compiled/panel.min.css
	uglifycss src/ui/options.css > src/ui/options.min.css


deploy:	clean compile
	mkdir lyrical
	cp -f manifest.json lyrical/
	mkdir lyrical/src
	cp -rf src/libs/ lyrical/src/
	cp -rf src/img/ lyrical/src/
	cp -rf compiled/ lyrical/src/
	mkdir lyrical/src/ui
	cp -rf src/ui/*.html lyrical/src/ui/
	cp -rf src/ui/*.min.css lyrical/src/ui/
	cp -rf src/ui/*.js lyrical/src/ui/
	cd lyrical && zip -r ../lyrical.zip *
	rm -rf lyrical

clean:
	rm -rf src/compiled/*
	rm -rf lyrical/*
	rm -rf lyrical
	rm -rf lyrical.zip