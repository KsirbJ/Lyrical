
## script to build the Lyrical extension ##

COMPILER='closure-compiler.jar'

PLAY_MUSIC_FILES='--js scripts/content/pm_ctrl.js --js scripts/utils/lyrics.js --js scripts/utils/utils.js --js scripts/utils/CORS.js'

# build the Google Play Music content script
java -jar $COMPILER $PLAY_MUSIC_FILES --js_output_file scripts/content_compiled/play_music.js
