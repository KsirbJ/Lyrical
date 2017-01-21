GOOGLE_COMPILER='closure-compiler.jar'

java -jar 'closure-compiler.jar' --js scripts/content/main.js --js scripts/utils/CORS.js --js_output_file scripts/content_compiled/play_music.js