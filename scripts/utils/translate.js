// This file contains the base code for translating lyrics to another language
import keys from "../utils/keys.js"

const Translator = {
	// contains the list of supported languages and their code
	languages: {
		"Azerbaijan":	"az",
		"Maltese":	"mt",
		"Albanian":	"sq",
		"Macedonian":	"mk",
		"Amharic":	"am",
		"Maori":	"mi",
		"English": "en",
		"Marathi":	"mr",
		"Arabic":	"ar",
		"Mari":	"mhr",
		"Armenian":	"hy",	
		"Mongolian":	"mn",
		"Afrikaans":	"af",	
		"German":	"de",
		"Basque":	"eu",
		"Nepali":	"ne",
		"Bashkir":	"ba",	
		"Norwegian":	"no",
		"Belarusian":	"be",	
		"Punjabi":	"pa",
		"Bengali":	"bn",	
		"Papiamento":	"pap",
		"Bulgarian":	"bg",
		"Persian":	"fa",
		"Bosnian":	"bs",
		"Polish":	"pl",
		"Welsh":	"cy",	
		"Portuguese":	"pt",
		"Hungarian":	"hu",	
		"Romanian":	"ro",
		"Vietnamese":	"vi",	
		"Russian":	"ru",
		"Haitian (Creole)":	"ht",	
		"Cebuano":	"ceb",
		"Galician":	"gl",
		"Serbian":	"sr",
		"Dutch":	"nl",
		"Sinhala":	"si",
		"Hill Mari":	"mrj",
		"Slovakian":	"sk",
		"Greek":	"el",
		"Slovenian":	"sl",
		"Georgian":	"ka",
		"Swahili":	"sw",
		"Gujarati":	"gu",	
		"Sundanese":	"su",
		"Danish":	"da",	
		"Tajik": "tg",
		"Hebrew": "he",
		"Thai": "th",
		"Yiddish": "yi",	
		"Tagalog": "tl",
		"Indonesian": "id",	
		"Tamil": "ta",
		"Irish": "ga	",
		"Tatar": "tt",
		"Italian": "it",	
		"Telugu": "te",
		"Icelandic": "is",	
		"Turkish": "tr",
		"Spanish": "es",	
		"Udmurt": "udm",
		"Kazakh":	"kk",	
		"Uzbek":	"uz",
		"Kannada":	"kn",	
		"Ukrainian":	"uk",
		"Catalan":	"ca",	
		"Urdu":	"ur",
		"Kyrgyz":	"ky",	
		"Finnish":	"fi",
		"Chinese":	"zh",	
		"French":	"fr",
		"Korean":	"ko",	
		"Hindi":	"hi",
		"Xhosa":	"xh",	
		"Croatian":	"hr",
		"Latin":	"la",	
		"Czech":	"cs",
		"Latvian":	"lv",	
		"Swedish":	"sv",
		"Lithuanian":	"lt",	
		"Scottish":	"gd",
		"Luxembourgish":	"lb",	
		"Estonian":	"et",
		"Malagasy":	"mg",	
		"Esperanto":	"eo",
		"Malay":	"ms",	
		"Javanese":	"jv",
		"Malayalam":	"ml",	
		"Japanese":	"ja"
	},

	// base html for the translate popup
	get_html: function(){
		let html = `<ul class="dropdown-menu">
						<a href="#" id="close_translator">&#10006;</a>
						<p>Translate lyrics to...</p>
						<span id="form">
							<input list="languages" type="text" id="lang_chooser" placeholder="Enter a language..." tabindex="0">
							<datalist id="languages">`;
							for(language in this.languages){
								html += `<option value="${language}" data-val="${this.languages[language]}" >`;
							}
							html += `</datalist>
							<a href="#" id="translate_btn">&#10148;</a>
						</span>
						<p id="yandex">Powered by <a href="https://translate.yandex.com/" target="_blank">Yandex.Translate</a></p>
					</ul>`;
		return html;
	},

	// base css for the translate popup
	get_css: function(){
		return `<style type="text/css" scoped>
					.dropdown-menu:before {
						content: "";
						width: 0;
						height: 0;
						position: absolute;
						border-left: 8px solid transparent;
						border-right: 8px solid transparent;
						border-bottom: 16px solid #FAFAFA;
						top: -15px;
						left: 20px;
						z-index: 2000;
					}
					#lyrics .dropdown-menu {
						display: none;
						padding: 10px;
						width: 100%;
						max-width: 200px;
						box-shadow: 1px -1px 1px 1px rgba(0,0,0,.2), 0px 1px 1px 1px rgba(0,0,0,.2);
						margin-top: 45px;
						position: absolute;
						z-index: 900000;
						background: #FAFAFA;
						left: 20px;
						top: 0;
						border-radius: 5px;
						border: 1px solid #ee792c;
						color: #000;
						min-width: 150px;
						font-size: 13px;
					}
					#lyrics .dropdown-menu:after {
						content: "";
						width: 0;
						height: 0;
						position: absolute;
						border-left: 8px solid transparent;
						border-right: 8px solid transparent;
						border-bottom: 17px solid rgba(0,0,0,.15);
						top: -17px;
						left: 21px;
						z-index: 1999;
					}
					#lyrics input[type=text] {
						outline: none;
						border: none;
						border-bottom: 1px solid #FFCF90;
						background: #fafafa;
						height: 1.6rem;
						font-size: 1em;
						margin: 0 0 15px 0;
						padding: 2px;
						box-shadow: none;
						transition: all 0.3s;
					}
					#lyrics input[type=text]:focus {
						border-bottom: 1px solid #ee792c;
						box-shadow: 0 1px 0 0 #ee792c;
					}
					#form {
						display: flex;
						align-items: center;
						flex-wrap: nowrap;
					}
					#translate_btn {
						font-size: 30px;
						margin-top: -20px;
						margin-left: 5px;
						color: #ff9102 !important;
						transition: all .4s linear;
					}
					#translate_btn:hover {
						color: #ee792c;
					}
					#close_translator {
						color: #fff;
						position: absolute;
						right: 0px;
						top: 0px;
						font-size: 16px;
						transition: color .4s linear;
						background: #ff0000;
						padding: 1px 4px;
						border-top-right-radius: 5px;
					}
					#close_translator:hover {
						cursor: pointer;
						color: #ff0000;
						background: #fff;
					}
					#yandex {
						margin: 0;
					    padding: 0;
					    font-size: .9em;
					}
				</style>`;
	},

	// show / hide the popup
	show_hide: function(e){
		$('.dropdown-menu').toggle();
		e.preventDefault();
		e.stopPropagation();
	},

	init_js: function(){
		$("#close_translator").click((e) => {this.show_hide(e)});

		$("#lang_chooser").click( (e) => {
			$(this).focus(); 
			e.preventDefault();
			e.stopPropagation();
		});

		// translate lyrics
		$("#translate_btn").click(function(e){
			try {
				// get target language
				let lang_text = $("#lang_chooser").val();
				let lang_code = Translator.languages[lang_text] ? Translator.languages[lang_text] : null;
				if(lang_code === null)
					throw new Error("Invalid language");

				// get text to translate
				let text = $("#words").html();
				if(text !== '<div id="err_msg">Play a song to see lyrics</div>'){
					text = text.replace('<p id="yandex">Translation by <a href="https://translate.yandex.com/" target="_blank">Yandex.Translate</a></p>', "");
				}else{
					throw new Error("No lyrics to translate");
				}
				let my_key = keys.yandex;

				// perform the translation request
				fetch(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=${my_key}&text=${encodeURI(text)}&lang=${lang_code}&format=html`).then(
					function(response){
						if(response.ok){
							return response.json();
						}
						throw new Error("Couldn't make request :(");
					}
				).then(function(data){

					$("#words").html(
						'<p id="yandex">Translation by <a href="https://translate.yandex.com/" target="_blank">Yandex.Translate</a></p>' +
						data.text
						);
				
				}).catch(function(e){
					console.error("Fetch error: " + e.message);
				});

				// close the popup
				Translator.show_hide(e);
				// notify the user that it's in process
				$("#words").html(`<div id="err_msg">Working...<br><img src="${chrome.extension.getURL('img/loader.gif')}"></div>`);

			}catch(err){
				$('#words').html(`<div id="err_msg">${err.message}</div>`);
				Translator.show_hide(e);
			}
		});
	}


}

export default Translator