import Cache from "../utils/cache"

Cache.init();


// Used to handle the response of a "get" call to the cache. 
// This function will return the lyrics to the tab that requested it
let cur_tab = null;
function response_handler(res){
	chrome.tabs.sendMessage(cur_tab.tab.id, {message: res}, function(res){
		cur_tab = null;
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	switch(request.message){
		case 'store-song':
			Cache.add_item(request.song);
			break;
		case 'get-song':
			cur_tab = sender;
			Cache.get_item(request.id, response_handler);
			break;
		default:
			break;
	}
});