
compiler = closure-compiler.jar
common_files = scripts/utils/lyrics.js scripts/utils/panel.js
play_music_files = scripts/content/pm_ctrl.js scripts/utils/utils.js  
youtube_files = scripts/content/yt_ctrl.js 
flags = --js

all: compile

# build the content scripts
compile:
	java -jar $(compiler) $(flags) $(play_music_files)  $(common_files) --js_output_file scripts/content_compiled/play_music.js
	java -jar $(compiler) $(flags) $(youtube_files) $(common_files) --js_output_file scripts/content_compiled/youtube.js
	cp scripts/utils/resize_drag.js scripts/content_compiled/

deploy:	compile
	mkdir lyrical
	cp manifest.json lyrical/
	cp -r libs/ lyrical/
	cp -r img/ lyrical/
	mkdir lyrical/scripts
	cp -r scripts/background lyrical/scripts/
	cp -r scripts/content_compiled/ lyrical/scripts/
	cp -r ui/ lyrical/ui
	cd lyrical
	zip -r ../lyrical.zip *

clean:
	rm -r scripts/content_compiled/*
	rm -r lyrical/*
	rm -r lyrical